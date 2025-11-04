import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    contractId: v.id("contracts"),
    title: v.string(),
    description: v.string(),
    amount: v.number(),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const contract = await ctx.db.get(args.contractId);
    if (!contract) throw new Error("Contract not found");

    const milestoneId = await ctx.db.insert("milestones", {
      ...args,
      status: "pending" as const,
      deliverableUrl: undefined,
      aiVerificationStatus: undefined,
      aiVerificationResult: undefined,
    });

    return milestoneId;
  },
});

export const listByContract = query({
  args: { contractId: v.id("contracts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const milestones = await ctx.db
      .query("milestones")
      .filter((q) => q.eq(q.field("contractId"), args.contractId))
      .collect();

    return milestones;
  },
});

export const submitDeliverable = mutation({
  args: {
    milestoneId: v.id("milestones"),
    deliverableUrl: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const milestone = await ctx.db.get(args.milestoneId);
    if (!milestone) throw new Error("Milestone not found");

    await ctx.db.patch(args.milestoneId, {
      deliverableUrl: args.deliverableUrl,
      status: "submitted" as const,
      submittedAt: Date.now(),
    });

    return args.milestoneId;
  },
});

export const approve = mutation({
  args: {
    milestoneId: v.id("milestones"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const milestone = await ctx.db.get(args.milestoneId);
    if (!milestone) throw new Error("Milestone not found");

    const contract = await ctx.db.get(milestone.contractId);
    if (!contract) throw new Error("Contract not found");
    if (contract.clientId !== userId) throw new Error("Only client can approve");

    await ctx.db.patch(args.milestoneId, {
      status: "approved" as const,
      approvedAt: Date.now(),
    });

    return args.milestoneId;
  },
});

export const requestRevision = mutation({
  args: {
    milestoneId: v.id("milestones"),
    revisionNotes: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.milestoneId, {
      status: "revision_requested" as const,
      revisionNotes: args.revisionNotes,
    });

    return args.milestoneId;
  },
});
