import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const updateVerificationResult = internalMutation({
  args: {
    milestoneId: v.id("milestones"),
    result: v.object({
      passed: v.boolean(),
      confidence: v.number(),
      feedback: v.string(),
      checkedCriteria: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.milestoneId, {
      aiVerificationStatus: args.result.passed ? "passed" : "failed",
      aiVerificationResult: JSON.stringify(args.result),
    });
  },
});