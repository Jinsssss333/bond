import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
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
    }).index("by_contract", ["contractId"]),
  },
  {
    schemaValidation: false,
  }
);

export default schema;