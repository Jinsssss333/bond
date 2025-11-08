import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createDispute = mutation({
  args: {
    projectId: v.id("projects"),
    milestoneId: v.id("milestones"),
    title: v.string(),
    description: v.string(),
    evidence: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const disputeId = await ctx.db.insert("disputes", {
      projectId: args.projectId,
      milestoneId: args.milestoneId,
      clientId: project.clientId,
      freelancerId: project.freelancerId,
      title: args.title,
      description: args.description,
      clientEvidence: userId === project.clientId ? args.evidence : undefined,
      freelancerEvidence: userId === project.freelancerId ? args.evidence : undefined,
      status: "open" as const,
      createdAt: Date.now(),
    });

    return disputeId;
  },
});

export const listOpenDisputes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("disputes")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .collect();
  },
});

export const listDisputesByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("disputes")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const getDispute = query({
  args: { disputeId: v.id("disputes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db.get(args.disputeId);
  },
});

export const resolveDispute = mutation({
  args: {
    disputeId: v.id("disputes"),
    outcome: v.union(v.literal("client"), v.literal("freelancer"), v.literal("split")),
    resolution: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const dispute = await ctx.db.get(args.disputeId);
    if (!dispute) throw new Error("Dispute not found");

    await ctx.db.patch(args.disputeId, {
      status: "resolved" as const,
      outcome: args.outcome,
      resolution: args.resolution,
      arbiterId: userId,
      resolvedAt: Date.now(),
    });

    return args.disputeId;
  },
});
