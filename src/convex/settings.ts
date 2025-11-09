import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    return {
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user",
      age: user.age || null,
      company: user.company || "",
    };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    age: v.optional(v.number()),
    company: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const updates: {
      name?: string;
      age?: number;
      company?: string;
    } = {};

    if (args.name !== undefined) updates.name = args.name;
    if (args.age !== undefined) updates.age = args.age;
    if (args.company !== undefined) updates.company = args.company;

    await ctx.db.patch(userId, updates);

    return userId;
  },
});
