import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  CLIENT: "client",
  FREELANCER: "freelancer",
  ARBITER: "arbiter",
} as const;

export const roleValidator = v.union(
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
    }).index("email", ["email"]),

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
        v.literal("active"),
        v.literal("completed"),
        v.literal("disputed"),
        v.literal("cancelled")
      ),
      fundingStatus: v.union(
        v.literal("unfunded"),
        v.literal("partially_funded"),
        v.literal("fully_funded")
      ),
      createdBy: v.id("users"),
    })
      .index("by_client", ["clientId"])
      .index("by_freelancer", ["freelancerId"]),

    projects: defineTable({
      title: v.string(),
      description: v.string(),
      clientId: v.id("users"),
      freelancerId: v.id("users"),
      totalBudget: v.number(),
      currency: v.string(),
      status: v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("completed"),
        v.literal("disputed"),
        v.literal("cancelled")
      ),
      fundingStatus: v.union(
        v.literal("unfunded"),
        v.literal("partially_funded"),
        v.literal("fully_funded")
      ),
    })
      .index("by_clientId", ["clientId"])
      .index("by_freelancerId", ["freelancerId"]),

    milestones: defineTable({
      projectId: v.id("projects"),
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
        v.literal("released")
      ),
      deliverableUrl: v.optional(v.string()),
      submittedAt: v.optional(v.number()),
      approvedAt: v.optional(v.number()),
      releasedAt: v.optional(v.number()),
      revisionNotes: v.optional(v.string()),
      aiVerificationStatus: v.optional(
        v.union(v.literal("pending"), v.literal("passed"), v.literal("failed"))
      ),
      aiVerificationResult: v.optional(v.string()),
    }).index("by_projectId", ["projectId"]),

    escrows: defineTable({
      projectId: v.id("projects"),
      clientId: v.id("users"),
      freelancerId: v.id("users"),
      totalAmount: v.number(),
      releasedAmount: v.number(),
      status: v.union(
        v.literal("draft"),
        v.literal("funded"),
        v.literal("released")
      ),
      createdAt: v.number(),
    }).index("by_projectId", ["projectId"]),

    disputes: defineTable({
      projectId: v.id("projects"),
      milestoneId: v.id("milestones"),
      clientId: v.id("users"),
      freelancerId: v.id("users"),
      title: v.string(),
      description: v.string(),
      clientEvidence: v.optional(v.string()),
      freelancerEvidence: v.optional(v.string()),
      status: v.union(
        v.literal("open"),
        v.literal("under_review"),
        v.literal("resolved")
      ),
      outcome: v.optional(v.union(v.literal("client"), v.literal("freelancer"), v.literal("split"))),
      resolution: v.optional(v.string()),
      arbiterId: v.optional(v.id("users")),
      createdAt: v.number(),
      resolvedAt: v.optional(v.number()),
    })
      .index("by_projectId", ["projectId"])
      .index("by_status", ["status"]),
  },
  {
    schemaValidation: false,
  }
);

export default schema;