import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    clientId: v.id("users"),
    freelancerId: v.id("users"),
    totalAmount: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const contractId = await ctx.db.insert("contracts", {
      ...args,
      status: "draft" as const,
      fundingStatus: "unfunded" as const,
      createdBy: userId,
      currentAmount: 0,
    });

    return contractId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const contracts = await ctx.db
      .query("contracts")
      .collect();

    return contracts.filter(
      (c) => c.clientId === userId || c.freelancerId === userId
    );
  },
});

export const listClientProjects = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const contracts = await ctx.db
      .query("contracts")
      .withIndex("by_client", (q) => q.eq("clientId", userId))
      .collect();

    return contracts;
  },
});

export const listFreelancerProjects = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const contracts = await ctx.db
      .query("contracts")
      .withIndex("by_freelancer", (q) => q.eq("freelancerId", userId))
      .collect();

    return contracts;
  },
});

export const get = query({
  args: { contractId: v.id("contracts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const contract = await ctx.db.get(args.contractId);
    if (!contract) return null;

    if (contract.clientId !== userId && contract.freelancerId !== userId) {
      return null;
    }

    return contract;
  },
});

export const updateStatus = mutation({
  args: {
    contractId: v.id("contracts"),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("disputed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const contract = await ctx.db.get(args.contractId);
    if (!contract) throw new Error("Contract not found");

    await ctx.db.patch(args.contractId, {
      status: args.status,
    });

    return args.contractId;
  },
});

export const fundContract = mutation({
  args: {
    contractId: v.id("contracts"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const contract = await ctx.db.get(args.contractId);
    if (!contract) throw new Error("Contract not found");
    if (contract.clientId !== userId) throw new Error("Only client can fund");

    const newAmount = contract.currentAmount + args.amount;

    await ctx.db.patch(args.contractId, {
      currentAmount: newAmount,
      fundingStatus:
        newAmount >= contract.totalAmount ? "fully_funded" : "partially_funded",
    });

    // Create transaction record
    await ctx.db.insert("transactions", {
      contractId: args.contractId,
      fromUserId: userId,
      toUserId: contract.freelancerId,
      amount: args.amount,
      currency: contract.currency,
      type: "funding",
      status: "completed",
      description: `Funded ${contract.title}`,
    });

    return args.contractId;
  },
});