import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
  CLIENT: "client",
  FREELANCER: "freelancer",
  ARBITER: "arbiter",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
  v.literal(ROLES.CLIENT),
  v.literal(ROLES.FREELANCER),
  v.literal(ROLES.ARBITER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      age: v.optional(v.number()),
      company: v.optional(v.string()),
      walletAddress: v.optional(v.string()),
    })
      .index("email", ["email"])
      .index("by_wallet", ["walletAddress"]),

    contracts: defineTable({
      title: v.string(),
      description: v.string(),
      clientId: v.id("users"),
      freelancerId: v.id("users"),
      totalAmount: v.number(),
      currentAmount: v.number(),
      currency: v.string(),
      status: v.union(
        v.literal("draft"),
        v.literal("pending_acceptance"),
        v.literal("active"),
        v.literal("completed"),
        v.literal("disputed"),
        v.literal("cancelled"),
        v.literal("pending_deletion")
      ),
      fundingStatus: v.union(
        v.literal("unfunded"),
        v.literal("partially_funded"),
        v.literal("fully_funded")
      ),
      createdBy: v.id("users"),
      paymentMethod: v.optional(v.union(v.literal("fiat"), v.literal("crypto"))),
      blockchainTxHash: v.optional(v.string()),
      escrowWalletAddress: v.optional(v.string()),
    })
      .index("by_client", ["clientId"])
      .index("by_freelancer", ["freelancerId"]),

    milestones: defineTable({
      contractId: v.id("contracts"),
      title: v.string(),
      description: v.string(),
      amount: v.number(),
      dueDate: v.optional(v.number()),
      status: v.union(
        v.literal("pending"),
        v.literal("in_progress"),
        v.literal("submitted"),
        v.literal("revision_requested"),
        v.literal("approved"),
        v.literal("paid")
      ),
      deliverableUrl: v.optional(v.string()),
      submittedAt: v.optional(v.number()),
      approvedAt: v.optional(v.number()),
      revisionNotes: v.optional(v.string()),
      aiVerificationStatus: v.optional(
        v.union(v.literal("pending"), v.literal("passed"), v.literal("failed"))
      ),
      aiVerificationResult: v.optional(v.string()),
      blockchainTxHash: v.optional(v.string()),
    }).index("by_contract", ["contractId"]),

    escrows: defineTable({
      contractId: v.id("contracts"),
      escrowId: v.string(),
      amount: v.number(),
      currency: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("funded"),
        v.literal("released"),
        v.literal("refunded"),
        v.literal("disputed")
      ),
      fundedAt: v.optional(v.number()),
      releasedAt: v.optional(v.number()),
      blockchainTxHash: v.optional(v.string()),
      walletAddress: v.optional(v.string()),
    }).index("by_contract", ["contractId"]),

    disputes: defineTable({
      contractId: v.id("contracts"),
      milestoneId: v.optional(v.id("milestones")),
      raisedBy: v.id("users"),
      assignedTo: v.optional(v.id("users")),
      reason: v.string(),
      evidence: v.optional(v.string()),
      status: v.union(
        v.literal("open"),
        v.literal("under_review"),
        v.literal("resolved"),
        v.literal("closed")
      ),
      resolution: v.optional(v.string()),
      resolvedAt: v.optional(v.number()),
    })
      .index("by_contract", ["contractId"])
      .index("by_arbiter", ["assignedTo"]),

    transactions: defineTable({
      contractId: v.id("contracts"),
      milestoneId: v.optional(v.id("milestones")),
      fromUserId: v.id("users"),
      toUserId: v.id("users"),
      amount: v.number(),
      currency: v.string(),
      type: v.union(
        v.literal("funding"),
        v.literal("release"),
        v.literal("refund"),
        v.literal("fee"),
        v.literal("payout")
      ),
      status: v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("failed")
      ),
      description: v.string(),
      blockchainTxHash: v.optional(v.string()),
      paymentMethod: v.optional(v.union(v.literal("fiat"), v.literal("crypto"))),
    })
      .index("by_contract", ["contractId"])
      .index("by_from_user", ["fromUserId"])
      .index("by_to_user", ["toUserId"]),
  },
  {
    schemaValidation: false,
  }
);

export default schema;