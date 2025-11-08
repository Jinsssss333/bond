import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const contracts = await ctx.db
      .query("contracts")
      .collect();

    const userContracts = contracts.filter(
      (c) => c.clientId === userId || c.freelancerId === userId
    );

    const escrows = await ctx.db.query("escrows").collect();

    return escrows.filter((e) =>
      userContracts.some((c) => c._id === e.contractId)
    );
  },
});

export const create = mutation({
  args: {
    contractId: v.id("contracts"),
    amount: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const escrowId = `ESC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    const id = await ctx.db.insert("escrows", {
      ...args,
      escrowId,
      status: "pending" as const,
    });

    return id;
  },
});

export const release = mutation({
  args: {
    escrowId: v.id("escrows"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const escrow = await ctx.db.get(args.escrowId);
    if (!escrow) throw new Error("Escrow not found");

    await ctx.db.patch(args.escrowId, {
      status: "released" as const,
      releasedAt: Date.now(),
    });

    return args.escrowId;
  },
});
