import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getMany = query({
  args: { keys: v.array(v.string()) },
  handler: async (ctx, { keys }) => {
    const rows = await Promise.all(
      keys.map((key) =>
        ctx.db
          .query("snapshots")
          .withIndex("by_key", (q) => q.eq("key", key))
          .unique()
      )
    );
    return rows
      .filter((row): row is NonNullable<typeof row> => row !== null)
      .map((row) => ({
        key: row.key,
        payload: row.payload,
        updatedAt: row.updatedAt,
      }));
  },
});

export const put = mutation({
  args: {
    key: v.string(),
    payload: v.string(),
    updatedAt: v.number(),
  },
  handler: async (ctx, { key, payload, updatedAt }) => {
    const existing = await ctx.db
      .query("snapshots")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    if (existing === null) {
      await ctx.db.insert("snapshots", { key, payload, updatedAt });
    } else {
      await ctx.db.patch(existing._id, { payload, updatedAt });
    }
  },
});
