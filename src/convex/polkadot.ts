import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const linkPolkadotAddress = mutation({
  args: {
    polkadotAddress: v.string(),
    identity: v.optional(v.object({
      display: v.optional(v.string()),
      legal: v.optional(v.string()),
      email: v.optional(v.string()),
      verified: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Check if address is already linked to another user
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_polkadot", (q) => q.eq("polkadotAddress", args.polkadotAddress))
      .first();

    if (existingUser && existingUser._id !== userId) {
      throw new Error("This Polkadot address is already linked to another account");
    }

    await ctx.db.patch(userId, {
      polkadotAddress: args.polkadotAddress,
      polkadotIdentity: args.identity,
    });

    return userId;
  },
});

export const unlinkPolkadotAddress = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(userId, {
      polkadotAddress: undefined,
      polkadotIdentity: undefined,
    });

    return userId;
  },
});

export const getPolkadotInfo = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    return {
      polkadotAddress: user.polkadotAddress,
      polkadotIdentity: user.polkadotIdentity,
    };
  },
});
