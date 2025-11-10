"use node";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const summarizeFile = action({
  args: {
    fileStorageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1024,
        },
      });

      // Get file URL
      const fileUrl = await ctx.storage.getUrl(args.fileStorageId);
      if (!fileUrl) {
        throw new Error("File not found");
      }

      // Fetch file content
      const response = await fetch(fileUrl);
      const fileBuffer = await response.arrayBuffer();
      const fileContent = Buffer.from(fileBuffer).toString("base64");

      // Determine mime type
      let mimeType = "application/octet-stream";
      if (args.fileType.includes("pdf")) {
        mimeType = "application/pdf";
      } else if (args.fileType.includes("image")) {
        mimeType = args.fileType;
      } else if (args.fileType.includes("text")) {
        mimeType = "text/plain";
      }

      // Enhanced prompt for better summarization
      const prompt = `You are an expert project reviewer analyzing a freelancer's deliverable submission. 

Analyze this file thoroughly and provide a comprehensive yet concise summary in the following format:

**📋 Overview**
[Brief description of what this deliverable is]

**🎯 Key Deliverables**
[List the main items, features, or components delivered]

**✨ Highlights**
[Notable achievements, quality aspects, or standout elements]

**📊 Completeness**
[Assessment of whether the deliverable appears complete and meets professional standards]

**💡 Recommendations**
[Any suggestions for the client - approve, request revisions, or areas to verify]

Keep the summary professional, objective, and under 250 words. Focus on actionable insights that help the client make an informed decision.`;

      const result = await model.generateContent([
        {
          inlineData: {
            data: fileContent,
            mimeType: mimeType,
          },
        },
        prompt,
      ]);

      const summary = result.response.text();
      return { summary, success: true };
    } catch (error) {
      console.error("Gemini summarization error:", error);
      return {
        summary: "Unable to generate summary. Please review the file manually.",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});