import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// One row per Zustand store, keyed by its localStorage `name`.
// `payload` is the raw JSON string Zustand writes — preserved verbatim so
// the persist contract (state + version envelope, custom merge/migrate)
// stays the single source of truth for shape.
export default defineSchema({
  snapshots: defineTable({
    key: v.string(),
    payload: v.string(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),
});
