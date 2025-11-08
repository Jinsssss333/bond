import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createEscrow = mutation({
  args: {
    projectId: v.id("projects"),
    totalAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const escrowId = await ctx.db.insert("escrows", {
      projectId: args.projectId,
      clientId: project.clientId,
      freelancerId: project.freelancerId,
      totalAmount: args.totalAmount,
      releasedAmount: 0,
      status: "draft" as const,
      createdAt: Date.now(),
    });

    return escrowId;
  },
});

export const getEscrowByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("escrows")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .unique();
  },
});

export const fundEscrow = mutation({
  args: {
    escrowId: v.id("escrows"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const escrow = await ctx.db.get(args.escrowId);
    if (!escrow) throw new Error("Escrow not found");
    if (escrow.clientId !== userId) throw new Error("Only client can fund");

    await ctx.db.patch(args.escrowId, {
      status: "funded" as const,
    });

    return args.escrowId;
  },
});

export const releaseEscrow = mutation({
  args: {
    escrowId: v.id("escrows"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const escrow = await ctx.db.get(args.escrowId);
    if (!escrow) throw new Error("Escrow not found");

    const newReleased = escrow.releasedAmount + args.amount;

    await ctx.db.patch(args.escrowId, {
      releasedAmount: newReleased,
      status: newReleased >= escrow.totalAmount ? "released" : "funded",
    });

    return args.escrowId;
  },
});
