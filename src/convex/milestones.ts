import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.string(),
    amount: v.number(),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

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

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("milestones")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const submitDeliverable = mutation({
  args: {
    milestoneId: v.id("milestones"),
    deliverableUrl: v.string(),
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

export const requestRelease = mutation({
  args: {
    milestoneId: v.id("milestones"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const milestone = await ctx.db.get(args.milestoneId);
    if (!milestone) throw new Error("Milestone not found");

    await ctx.db.patch(args.milestoneId, {
      status: "approved" as const,
      approvedAt: Date.now(),
    });

    return args.milestoneId;
  },
});

export const releaseMilestone = mutation({
  args: {
    milestoneId: v.id("milestones"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const milestone = await ctx.db.get(args.milestoneId);
    if (!milestone) throw new Error("Milestone not found");

    await ctx.db.patch(args.milestoneId, {
      status: "released" as const,
      releasedAt: Date.now(),
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
