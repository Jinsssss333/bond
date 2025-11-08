import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createProject = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    freelancerId: v.id("users"),
    totalBudget: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const projectId = await ctx.db.insert("projects", {
      title: args.title,
      description: args.description,
      clientId: userId,
      freelancerId: args.freelancerId,
      totalBudget: args.totalBudget,
      currency: args.currency,
      status: "draft" as const,
      fundingStatus: "unfunded" as const,
    });

    return projectId;
  },
});

export const listClientProjects = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("projects")
      .withIndex("by_clientId", (q) => q.eq("clientId", userId))
      .collect();
  },
});

export const listFreelancerProjects = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("projects")
      .withIndex("by_freelancerId", (q) => q.eq("freelancerId", userId))
      .collect();
  },
});

export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    if (project.clientId !== userId && project.freelancerId !== userId) {
      return null;
    }

    return project;
  },
});

export const fundProject = mutation({
  args: {
    projectId: v.id("projects"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");
    if (project.clientId !== userId) throw new Error("Only client can fund");

    await ctx.db.patch(args.projectId, {
      fundingStatus: "partially_funded" as const,
    });

    return args.projectId;
  },
});
