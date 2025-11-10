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
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

      // Generate summary
      const prompt = `Please analyze this file and provide a concise summary including:
1. Main content/purpose
2. Key points or findings
3. Any deliverables or outcomes mentioned
4. Overall quality assessment

Keep the summary professional and under 200 words.`;

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
