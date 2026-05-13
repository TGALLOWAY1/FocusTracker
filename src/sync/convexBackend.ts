import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import type { Snapshot, SnapshotBackend } from "./snapshotSync";

// `anyApi` is the untyped escape hatch. We use it (rather than the
// generated `api`) so the frontend compiles before `npx convex dev`
// has scaffolded `convex/_generated/`. Function names here are coupled
// to `convex/snapshots.ts`.
export function createConvexBackend(client: ConvexHttpClient): SnapshotBackend {
  return {
    async fetchSnapshots(keys) {
      const rows = (await client.query(anyApi.snapshots.getMany, {
        keys,
      })) as Snapshot[];
      return rows;
    },
    async pushSnapshot({ key, payload, updatedAt }) {
      await client.mutation(anyApi.snapshots.put, {
        key,
        payload,
        updatedAt,
      });
    },
  };
}

export function tryCreateConvexClient(): ConvexHttpClient | null {
  const url = import.meta.env.VITE_CONVEX_URL;
  if (typeof url !== "string" || url.length === 0) return null;
  return new ConvexHttpClient(url);
}
