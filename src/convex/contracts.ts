import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

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
    if (!user) throw new Error("User not found");
    if (user.role !== "client") throw new Error("Only clients can create contracts");

    const freelancer = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.freelancerEmail))
      .first();

    if (!freelancer) {
      throw new Error("Freelancer not found. They need to sign up first.");
    }

    if (freelancer.role !== "freelancer") {
      throw new Error("The specified user is not a freelancer");
    }

    const contractId = await ctx.db.insert("contracts", {
      title: args.title,
      description: args.description,
      clientId: userId,
      freelancerId: freelancer._id,
      totalAmount: args.totalAmount,
      currentAmount: 0,
      currency: args.currency,
      status: "pending_acceptance",
      fundingStatus: "unfunded",
      createdBy: userId,
    });

    // Schedule email notification to be sent
    await ctx.scheduler.runAfter(
      0,
      internal.emails.sendProjectInvitation,
      {
        freelancerEmail: args.freelancerEmail,
        freelancerName: freelancer.name,
        projectTitle: args.title,
        projectDescription: args.description,
        budget: args.totalAmount,
        currency: args.currency,
        contractId: contractId,
        clientName: user.name,
      }
    );

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

export const rejectContract = mutation({
  args: { contractId: v.id("contracts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const contract = await ctx.db.get(args.contractId);
    if (!contract) throw new Error("Contract not found");
    if (contract.freelancerId !== userId) throw new Error("Only assigned freelancer can reject");
    if (contract.status !== "pending_acceptance") throw new Error("Can only reject pending invitations");

    await ctx.db.patch(args.contractId, {
      status: "cancelled" as const,
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

export const fundContractInternal = internalMutation({
  args: {
    contractId: v.id("contracts"),
    amount: v.number(),
    paymentMethod: v.union(v.literal("fiat"), v.literal("crypto")),
    transactionId: v.string(),
  },
  handler: async (ctx, args) => {
    const contract = await ctx.db.get(args.contractId);
    if (!contract) throw new Error("Contract not found");

    const newAmount = contract.currentAmount + args.amount;

    await ctx.db.patch(args.contractId, {
      currentAmount: newAmount,
      fundingStatus:
        newAmount >= contract.totalAmount ? "fully_funded" : "partially_funded",
      paymentMethod: args.paymentMethod,
    });

    // Update or create escrow
    const escrow = await ctx.db
      .query("escrows")
      .withIndex("by_contract", (q) => q.eq("contractId", args.contractId))
      .first();

    if (escrow) {
      await ctx.db.patch(escrow._id, {
        status: "funded" as const,
        fundedAt: Date.now(),
        blockchainTxHash: args.paymentMethod === "fiat" ? args.transactionId : escrow.blockchainTxHash,
      });
    } else {
      await ctx.db.insert("escrows", {
        contractId: args.contractId,
        escrowId: `ESC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        amount: args.amount,
        currency: contract.currency,
        status: "funded" as const,
        fundedAt: Date.now(),
        blockchainTxHash: args.paymentMethod === "fiat" ? args.transactionId : undefined,
      });
    }

    // Create transaction record
    await ctx.db.insert("transactions", {
      contractId: args.contractId,
      fromUserId: contract.clientId,
      toUserId: contract.freelancerId,
      amount: args.amount,
      currency: contract.currency,
      type: "funding",
      status: "completed",
      description: `Funded ${contract.title} via ${args.paymentMethod}`,
      paymentMethod: args.paymentMethod,
      blockchainTxHash: args.paymentMethod === "fiat" ? args.transactionId : undefined,
    });

    return args.contractId;
  },
});

export const requestDeletion = mutation({
  args: { contractId: v.id("contracts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const contract = await ctx.db.get(args.contractId);
    if (!contract) throw new Error("Contract not found");
    if (contract.clientId !== userId) throw new Error("Only client can request deletion");

    // Check if freelancer has accepted
    if (contract.status === "pending_acceptance") {
      throw new Error("Cannot request deletion for pending contracts. Delete directly instead.");
    }

    await ctx.db.patch(args.contractId, {
      status: "pending_deletion" as any,
    });

    return args.contractId;
  },
});

export const deleteContract = mutation({
  args: { contractId: v.id("contracts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const contract = await ctx.db.get(args.contractId);
    if (!contract) throw new Error("Contract not found");
    if (contract.clientId !== userId) throw new Error("Only client can delete");

    // Check if freelancer has accepted
    if (contract.status !== "pending_acceptance" && contract.status !== "pending_deletion" && contract.status !== "cancelled") {
      throw new Error("Cannot delete active contracts without freelancer confirmation");
    }

    // Delete related milestones
    const milestones = await ctx.db
      .query("milestones")
      .withIndex("by_contract", (q) => q.eq("contractId", args.contractId))
      .collect();
    
    for (const milestone of milestones) {
      await ctx.db.delete(milestone._id);
    }

    // Delete related escrows
    const escrows = await ctx.db
      .query("escrows")
      .withIndex("by_contract", (q) => q.eq("contractId", args.contractId))
      .collect();
    
    for (const escrow of escrows) {
      await ctx.db.delete(escrow._id);
    }

    // Delete the contract
    await ctx.db.delete(args.contractId);

    return args.contractId;
  },
});

export const confirmDeletion = mutation({
  args: { contractId: v.id("contracts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const contract = await ctx.db.get(args.contractId);
    if (!contract) throw new Error("Contract not found");
    if (contract.freelancerId !== userId) throw new Error("Only freelancer can confirm");

    // Delete related milestones
    const milestones = await ctx.db
      .query("milestones")
      .withIndex("by_contract", (q) => q.eq("contractId", args.contractId))
      .collect();
    
    for (const milestone of milestones) {
      await ctx.db.delete(milestone._id);
    }

    // Delete related escrows
    const escrows = await ctx.db
      .query("escrows")
      .withIndex("by_contract", (q) => q.eq("contractId", args.contractId))
      .collect();
    
    for (const escrow of escrows) {
      await ctx.db.delete(escrow._id);
    }

    // Delete the contract
    await ctx.db.delete(args.contractId);

    return args.contractId;
  },
});