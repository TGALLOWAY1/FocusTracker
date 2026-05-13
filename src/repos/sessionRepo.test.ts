import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CompletedSession, SessionReflection } from "../state/focusStore";

// Fakes the shape the repo expects from supabase-js v2 query builder. Every
// method returns `this` to allow chaining; terminal calls return the saved
// row(s) so test assertions can inspect what was sent.

type Captured = {
  table: string;
  op: "select" | "insert" | "upsert" | "delete";
  payload?: unknown;
  options?: unknown;
  filters: { col: string; val: unknown }[];
  order: { col: string; asc: boolean } | null;
};

const captured: Captured[] = [];
let nextSelectResult: { data: unknown; error: unknown } = { data: [], error: null };
let getUserResult: { data: { user: { id: string } | null }; error: null } = {
  data: { user: { id: "user-1" } },
  error: null,
};

function makeBuilder(table: string, op: Captured["op"]) {
  const entry: Captured = { table, op, filters: [], order: null };
  captured.push(entry);
  const builder: Record<string, unknown> = {
    select() {
      return builder;
    },
    insert(payload: unknown) {
      entry.payload = payload;
      return builder;
    },
    upsert(payload: unknown, options?: unknown) {
      entry.payload = payload;
      entry.options = options;
      return Promise.resolve({ error: null });
    },
    delete() {
      return builder;
    },
    order(col: string, opts: { ascending?: boolean } = {}) {
      entry.order = { col, asc: opts.ascending ?? true };
      // terminal for fetchAll — resolve with current selection result
      return Promise.resolve(nextSelectResult);
    },
    eq(col: string, val: unknown) {
      entry.filters.push({ col, val });
      return Promise.resolve({ error: null });
    },
    then(resolve: (v: { error: null }) => unknown) {
      // for inserts without further chaining
      return resolve({ error: null });
    },
  };
  return builder;
}

vi.mock("../lib/supabase", () => ({
  supabaseConfigured: true,
  supabase: {
    auth: {
      getUser: () => Promise.resolve(getUserResult),
    },
    from(table: string) {
      let currentOp: Captured["op"] = "select";
      return new Proxy(
        {},
        {
          get(_t, prop: string) {
            if (prop === "select") currentOp = "select";
            else if (prop === "insert") currentOp = "insert";
            else if (prop === "upsert") currentOp = "upsert";
            else if (prop === "delete") currentOp = "delete";
            const builder = makeBuilder(table, currentOp);
            return (builder as Record<string, unknown>)[prop];
          },
        }
      );
    },
  },
}));

vi.mock("../components/ui/Toast", () => ({
  toast: vi.fn(),
}));

import { sessionRepo } from "./sessionRepo";

const session: CompletedSession = {
  id: "00000000-0000-0000-0000-000000000001",
  projectId: "00000000-0000-0000-0000-0000000000aa",
  projectName: "Test Project",
  task: "Write the test",
  startedAt: 1_700_000_000_000,
  endedAt: 1_700_000_600_000,
  plannedDurationSec: 600,
  actualDurationSec: 600,
  completedNaturally: true,
  activityCategory: "coding",
  sessionType: "light",
  tags: ["Light Work", "Coding", "Completed"],
};

const reflection: SessionReflection = {
  sessionId: session.id,
  focusLevel: 4,
  energyLevel: 3,
  reflection: "felt focused",
  completedPlanned: true,
  createdAt: 1_700_000_700_000,
};

beforeEach(() => {
  captured.length = 0;
  nextSelectResult = { data: [], error: null };
  getUserResult = { data: { user: { id: "user-1" } }, error: null };
});

describe("sessionRepo", () => {
  it("no-ops on every method when there is no authed user", async () => {
    getUserResult = { data: { user: null }, error: null };
    await sessionRepo.insert(session);
    await sessionRepo.attachReflection(reflection);
    await sessionRepo.bulkInsert([session]);
    await sessionRepo.delete(session.id);
    expect(captured).toHaveLength(0);
    const all = await sessionRepo.fetchAll();
    expect(all).toEqual([]);
  });

  it("insert() sends a row with snake_case fields and the current user_id", async () => {
    await sessionRepo.insert(session);
    expect(captured).toHaveLength(1);
    expect(captured[0]).toMatchObject({
      table: "focus_sessions",
      op: "insert",
    });
    const payload = captured[0].payload as Record<string, unknown>;
    expect(payload.id).toBe(session.id);
    expect(payload.user_id).toBe("user-1");
    expect(payload.project_id).toBe(session.projectId);
    expect(payload.project_name).toBe(session.projectName);
    expect(payload.activity_category).toBe("coding");
    expect(payload.session_type).toBe("light");
    expect(payload.completed_naturally).toBe(true);
    expect(payload.started_at).toBe(new Date(session.startedAt).toISOString());
    expect(payload.ended_at).toBe(new Date(session.endedAt).toISOString());
    expect(payload.tags).toEqual(session.tags);
  });

  it("insert() sends project_id: null when the session has no project", async () => {
    await sessionRepo.insert({ ...session, projectId: "" });
    const payload = captured[0].payload as Record<string, unknown>;
    expect(payload.project_id).toBeNull();
  });

  it("attachReflection() upserts on session_id with user_id and snake_case fields", async () => {
    await sessionRepo.attachReflection(reflection);
    expect(captured[0]).toMatchObject({
      table: "focus_reflections",
      op: "upsert",
      options: { onConflict: "session_id" },
    });
    const payload = captured[0].payload as Record<string, unknown>;
    expect(payload.session_id).toBe(reflection.sessionId);
    expect(payload.user_id).toBe("user-1");
    expect(payload.focus_level).toBe(4);
    expect(payload.energy_level).toBe(3);
    expect(payload.reflection).toBe("felt focused");
    expect(payload.completed_planned).toBe(true);
  });

  it("attachReflection() sends reflection: null when no text was entered", async () => {
    await sessionRepo.attachReflection({ ...reflection, reflection: undefined });
    const payload = captured[0].payload as Record<string, unknown>;
    expect(payload.reflection).toBeNull();
  });

  it("bulkInsert() sends every session in a single insert and no-ops on empty input", async () => {
    await sessionRepo.bulkInsert([]);
    expect(captured).toHaveLength(0);

    await sessionRepo.bulkInsert([session, { ...session, id: "00000000-0000-0000-0000-000000000002" }]);
    const payload = captured[0].payload as Array<Record<string, unknown>>;
    expect(Array.isArray(payload)).toBe(true);
    expect(payload).toHaveLength(2);
    expect(payload[0].user_id).toBe("user-1");
    expect(payload[1].id).toBe("00000000-0000-0000-0000-000000000002");
  });

  it("delete() filters by id", async () => {
    await sessionRepo.delete(session.id);
    expect(captured[0]).toMatchObject({ table: "focus_sessions", op: "delete" });
    expect(captured[0].filters).toEqual([{ col: "id", val: session.id }]);
  });

  it("fetchAll() unwraps embedded focus_reflections and orders by ended_at desc", async () => {
    nextSelectResult = {
      data: [
        {
          id: session.id,
          user_id: "user-1",
          project_id: session.projectId,
          project_name: session.projectName,
          task: session.task,
          started_at: new Date(session.startedAt).toISOString(),
          ended_at: new Date(session.endedAt).toISOString(),
          planned_duration_sec: session.plannedDurationSec,
          actual_duration_sec: session.actualDurationSec,
          completed_naturally: session.completedNaturally,
          activity_category: session.activityCategory,
          session_type: session.sessionType,
          tags: session.tags,
          focus_reflections: [
            {
              session_id: session.id,
              user_id: "user-1",
              focus_level: 5,
              energy_level: 4,
              reflection: null,
              completed_planned: false,
              created_at: new Date(session.endedAt + 60_000).toISOString(),
            },
          ],
        },
      ],
      error: null,
    };

    const all = await sessionRepo.fetchAll();
    expect(captured[0]).toMatchObject({
      table: "focus_sessions",
      op: "select",
      order: { col: "ended_at", asc: false },
    });
    expect(all).toHaveLength(1);
    expect(all[0].session.projectId).toBe(session.projectId);
    expect(all[0].session.projectName).toBe(session.projectName);
    expect(all[0].session.startedAt).toBe(session.startedAt);
    expect(all[0].reflection).not.toBeNull();
    expect(all[0].reflection?.focusLevel).toBe(5);
  });

  it("fetchAll() returns null reflection when none is embedded", async () => {
    nextSelectResult = {
      data: [
        {
          id: session.id,
          user_id: "user-1",
          project_id: session.projectId,
          project_name: session.projectName,
          task: session.task,
          started_at: new Date(session.startedAt).toISOString(),
          ended_at: new Date(session.endedAt).toISOString(),
          planned_duration_sec: session.plannedDurationSec,
          actual_duration_sec: session.actualDurationSec,
          completed_naturally: session.completedNaturally,
          activity_category: session.activityCategory,
          session_type: session.sessionType,
          tags: session.tags,
          focus_reflections: [],
        },
      ],
      error: null,
    };
    const all = await sessionRepo.fetchAll();
    expect(all[0].reflection).toBeNull();
  });
});
