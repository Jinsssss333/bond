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
    if (contract.clientId !== userId) throw new Error("Only client can create milestones");

    // Calculate total milestone amount
    const existingMilestones = await ctx.db
      .query("milestones")
      .withIndex("by_contract", (q) => q.eq("contractId", args.contractId))
      .collect();
    
    const totalMilestoneAmount = existingMilestones.reduce((sum, m) => sum + m.amount, 0);
    const newTotal = totalMilestoneAmount + args.amount;

    if (newTotal > contract.totalAmount) {
      throw new Error(
        `Total milestone amount ($${newTotal.toLocaleString()}) exceeds project budget ($${contract.totalAmount.toLocaleString()})`
      );
    }

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
      .withIndex("by_contract", (q) => q.eq("contractId", args.contractId))
      .collect();

    return milestones;
  },
});

export const submitDeliverable = mutation({
  args: {
    milestoneId: v.id("milestones"),
    title: v.string(),
    description: v.string(),
    fileStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const milestone = await ctx.db.get(args.milestoneId);
    if (!milestone) throw new Error("Milestone not found");

    const contract = await ctx.db.get(milestone.contractId);
    if (!contract) throw new Error("Contract not found");
    if (contract.freelancerId !== userId) throw new Error("Only freelancer can submit");

    const fileUrl = await ctx.storage.getUrl(args.fileStorageId);
    if (!fileUrl) throw new Error("File not found");

    await ctx.db.patch(args.milestoneId, {
      deliverableUrl: fileUrl,
      status: "submitted" as const,
      submittedAt: Date.now(),
      title: args.title,
      description: args.description,
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

    // Release funds from escrow
    const escrow = await ctx.db
      .query("escrows")
      .withIndex("by_contract", (q) => q.eq("contractId", milestone.contractId))
      .first();

    if (escrow && escrow.status === "funded") {
      await ctx.db.patch(escrow._id, {
        status: "released" as const,
        releasedAt: Date.now(),
      });
    }

    // Create transaction for release
    await ctx.db.insert("transactions", {
      contractId: milestone.contractId,
      milestoneId: args.milestoneId,
      fromUserId: contract.clientId,
      toUserId: contract.freelancerId,
      amount: milestone.amount,
      currency: contract.currency,
      type: "release",
      status: "completed",
      description: `Released funds for milestone: ${milestone.title}`,
    });

    return args.milestoneId;
  },
});

export const reject = mutation({
  args: {
    milestoneId: v.id("milestones"),
    rejectionReason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const milestone = await ctx.db.get(args.milestoneId);
    if (!milestone) throw new Error("Milestone not found");

    const contract = await ctx.db.get(milestone.contractId);
    if (!contract) throw new Error("Contract not found");
    if (contract.clientId !== userId) throw new Error("Only client can reject");

    await ctx.db.patch(args.milestoneId, {
      status: "revision_requested" as const,
      revisionNotes: args.rejectionReason,
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

export const initiatePayout = mutation({
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
    if (contract.freelancerId !== userId) throw new Error("Only freelancer can initiate payout");
    if (milestone.status !== "approved") throw new Error("Milestone must be approved first");

    await ctx.db.patch(args.milestoneId, {
      status: "paid" as const,
    });

    // Create payout transaction
    await ctx.db.insert("transactions", {
      contractId: milestone.contractId,
      milestoneId: args.milestoneId,
      fromUserId: contract.clientId,
      toUserId: contract.freelancerId,
      amount: milestone.amount,
      currency: contract.currency,
      type: "payout",
      status: "completed",
      description: `Payout for milestone: ${milestone.title}`,
    });

    return args.milestoneId;
  },
});