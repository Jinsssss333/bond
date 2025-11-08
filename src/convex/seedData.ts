import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedMockData = mutation({
  args: {},
  handler: async (ctx) => {
    // Get or create mock users
    const users = await ctx.db.query("users").collect();
    
    if (users.length === 0) {
      // Create mock users
      const clientId = await ctx.db.insert("users", {
        name: "Acme Corp",
        email: "client@acme.com",
        role: "client" as const,
      });

      const freelancerId = await ctx.db.insert("users", {
        name: "John Developer",
        email: "freelancer@dev.com",
        role: "freelancer" as const,
      });

      const arbiterId = await ctx.db.insert("users", {
        name: "Jane Arbiter",
        email: "arbiter@bond.com",
        role: "arbiter" as const,
      });

      // Create mock projects
      const project1 = await ctx.db.insert("projects", {
        title: "E-commerce Website Redesign",
        description: "Complete redesign of the main e-commerce platform.",
        clientId,
        freelancerId,
        totalBudget: 15000,
        currency: "USD",
        status: "active" as const,
        fundingStatus: "partially_funded" as const,
      });

      const project2 = await ctx.db.insert("projects", {
        title: "Mobile App Development",
        description: "Develop a new iOS and Android app.",
        clientId,
        freelancerId,
        totalBudget: 25000,
        currency: "USD",
        status: "active" as const,
        fundingStatus: "fully_funded" as const,
      });

      const project3 = await ctx.db.insert("projects", {
        title: "Brand Identity & Logo",
        description: "Create a new brand identity package.",
        clientId,
        freelancerId,
        totalBudget: 5000,
        currency: "USD",
        status: "disputed" as const,
        fundingStatus: "fully_funded" as const,
      });

      // Create mock milestones
      await ctx.db.insert("milestones", {
        projectId: project1,
        title: "Phase 1: Wireframes & UX",
        description: "Deliver complete wireframes and user flows.",
        amount: 5000,
        status: "released" as const,
        deliverableUrl: "https://figma.com/wireframes",
        submittedAt: Date.now() - 86400000 * 7,
        approvedAt: Date.now() - 86400000 * 6,
        releasedAt: Date.now() - 86400000 * 5,
      });

      await ctx.db.insert("milestones", {
        projectId: project1,
        title: "Phase 2: UI Design",
        description: "High-fidelity mockups for all screens.",
        amount: 5000,
        status: "submitted" as const,
        deliverableUrl: "https://figma.com/designs",
        submittedAt: Date.now() - 86400000 * 2,
      });

      await ctx.db.insert("milestones", {
        projectId: project1,
        title: "Phase 3: Frontend Dev",
        description: "Implement the design in React.",
        amount: 5000,
        status: "pending" as const,
      });

      await ctx.db.insert("milestones", {
        projectId: project2,
        title: "iOS Development",
        description: "Build iOS app with Swift.",
        amount: 12500,
        status: "released" as const,
        deliverableUrl: "https://github.com/app-ios",
        submittedAt: Date.now() - 86400000 * 14,
        approvedAt: Date.now() - 86400000 * 13,
        releasedAt: Date.now() - 86400000 * 12,
      });

      await ctx.db.insert("milestones", {
        projectId: project2,
        title: "Android Development",
        description: "Build Android app with Kotlin.",
        amount: 12500,
        status: "released" as const,
        deliverableUrl: "https://github.com/app-android",
        submittedAt: Date.now() - 86400000 * 7,
        approvedAt: Date.now() - 86400000 * 6,
        releasedAt: Date.now() - 86400000 * 5,
      });

      // Create mock escrows
      const escrow1 = await ctx.db.insert("escrows", {
        projectId: project1,
        clientId,
        freelancerId,
        totalAmount: 15000,
        releasedAmount: 5000,
        status: "funded" as const,
        createdAt: Date.now() - 86400000 * 30,
      });

      const escrow2 = await ctx.db.insert("escrows", {
        projectId: project2,
        clientId,
        freelancerId,
        totalAmount: 25000,
        releasedAmount: 25000,
        status: "released" as const,
        createdAt: Date.now() - 86400000 * 60,
      });

      const escrow3 = await ctx.db.insert("escrows", {
        projectId: project3,
        clientId,
        freelancerId,
        totalAmount: 5000,
        releasedAmount: 0,
        status: "funded" as const,
        createdAt: Date.now() - 86400000 * 15,
      });

      // Create mock disputes
      await ctx.db.insert("disputes", {
        projectId: project3,
        milestoneId: (await ctx.db.query("milestones").withIndex("by_projectId", (q) => q.eq("projectId", project3)).collect())[0]?._id || "" as any,
        clientId,
        freelancerId,
        title: "Logo Design Quality Issues",
        description: "The logo design does not meet the agreed specifications.",
        clientEvidence: "The colors are not matching the brand guidelines.",
        status: "open" as const,
        createdAt: Date.now() - 86400000 * 5,
      });

      return { success: true, message: "Mock data seeded successfully" };
    }

    return { success: false, message: "Mock data already exists" };
  },
});
