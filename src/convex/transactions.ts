import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const transactions = await ctx.db
      .query("transactions")
      .collect();

    return transactions.filter(
      (t) => t.fromUserId === userId || t.toUserId === userId
    );
  },
});
