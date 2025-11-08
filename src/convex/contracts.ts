import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    freelancerEmail: v.string(),
    totalAmount: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (user?.role !== "client") throw new Error("Only clients can create contracts");

    // Find freelancer by email
    const freelancer = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.freelancerEmail))
      .first();

    if (!freelancer) throw new Error("Freelancer not found");
    if (freelancer.role !== "freelancer") throw new Error("User is not a freelancer");

    const contractId = await ctx.db.insert("contracts", {
      title: args.title,
      description: args.description,
      clientId: userId,
      freelancerId: freelancer._id,
      totalAmount: args.totalAmount,
      currency: args.currency,
      status: "pending_acceptance" as const,
      fundingStatus: "unfunded" as const,
      createdBy: userId,
      currentAmount: 0,
    });

    // Create escrow with random ID
    const escrowId = `ESC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    await ctx.db.insert("escrows", {
      contractId,
      amount: args.totalAmount,
      currency: args.currency,
      status: "pending" as const,
      escrowId,
    });

    return contractId;
  },
});

export const acceptContract = mutation({
  args: { contractId: v.id("contracts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const contract = await ctx.db.get(args.contractId);
    if (!contract) throw new Error("Contract not found");
    if (contract.freelancerId !== userId) throw new Error("Only assigned freelancer can accept");

    await ctx.db.patch(args.contractId, {
      status: "active" as const,
    });

    return args.contractId;
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
      v.literal("pending_acceptance"),
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

    // Update escrow
    const escrow = await ctx.db
      .query("escrows")
      .withIndex("by_contract", (q) => q.eq("contractId", args.contractId))
      .first();

    if (escrow) {
      await ctx.db.patch(escrow._id, {
        status: "funded" as const,
        fundedAt: Date.now(),
      });
    }

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