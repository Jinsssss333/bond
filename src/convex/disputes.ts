import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const user = await ctx.db.get(userId);
    if (!user) return [];

    if (user.role === "arbiter") {
      return await ctx.db.query("disputes").collect();
    }

    const contracts = await ctx.db
      .query("contracts")
      .collect();

    const userContracts = contracts.filter(
      (c) => c.clientId === userId || c.freelancerId === userId
    );

    const disputes = await ctx.db.query("disputes").collect();

    return disputes.filter((d) =>
      userContracts.some((c) => c._id === d.contractId)
    );
  },
});

export const create = mutation({
  args: {
    contractId: v.id("contracts"),
    milestoneId: v.optional(v.id("milestones")),
    reason: v.string(),
    evidence: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const disputeId = await ctx.db.insert("disputes", {
      ...args,
      raisedBy: userId,
      status: "open" as const,
    });

    return disputeId;
  },
});

export const resolve = mutation({
  args: {
    disputeId: v.id("disputes"),
    resolution: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (user?.role !== "arbiter") throw new Error("Only arbiters can resolve disputes");

    await ctx.db.patch(args.disputeId, {
      status: "resolved" as const,
      resolution: args.resolution,
      resolvedAt: Date.now(),
    });

    return args.disputeId;
  },
});
