"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const sendProjectInvitation = internalAction({
  args: {
    freelancerEmail: v.string(),
    freelancerName: v.optional(v.string()),
    projectTitle: v.string(),
    projectDescription: v.string(),
    budget: v.number(),
    currency: v.string(),
    contractId: v.string(),
    clientName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      throw new Error("Email service not configured");
    }

    const invitationUrl = `${process.env.CONVEX_SITE_URL}/contracts/${args.contractId}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Project Invitation - Bond</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Bond</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Secure Freelance Escrow Platform</p>
          </div>
          
          <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">You've Been Invited to a New Project!</h2>
            
            <p style="color: #4b5563; font-size: 16px;">
              ${args.freelancerName ? `Hi ${args.freelancerName}` : 'Hello'},
            </p>
            
            <p style="color: #4b5563; font-size: 16px;">
              ${args.clientName || 'A client'} has invited you to work on a new project on Bond.
            </p>
            
            <div style="background: #f9fafb; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
              <h3 style="margin-top: 0; color: #1f2937; font-size: 20px;">${args.projectTitle}</h3>
              <p style="color: #4b5563; margin: 10px 0;">${args.projectDescription}</p>
              <p style="color: #1f2937; font-weight: 600; margin: 15px 0 0 0; font-size: 18px;">
                Budget: ${args.budget.toLocaleString()} ${args.currency}
              </p>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${invitationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                View Project & Accept Invitation
              </a>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 6px; margin: 30px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>🔒 Secure Escrow:</strong> Funds are held securely in escrow until milestones are completed and approved.
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If you have any questions, please don't hesitate to reach out to the client or contact Bond support.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              This invitation was sent by Bond Escrow Platform<br>
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `;

    const emailText = `
You've Been Invited to a New Project!

${args.freelancerName ? `Hi ${args.freelancerName}` : 'Hello'},

${args.clientName || 'A client'} has invited you to work on a new project on Bond.

Project: ${args.projectTitle}
Description: ${args.projectDescription}
Budget: ${args.budget.toLocaleString()} ${args.currency}

To view the project details and accept the invitation, visit:
${invitationUrl}

Secure Escrow: Funds are held securely in escrow until milestones are completed and approved.

If you have any questions, please don't hesitate to reach out to the client or contact Bond support.

---
This invitation was sent by Bond Escrow Platform
If you didn't expect this invitation, you can safely ignore this email.
    `;

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Bond <onboarding@resend.dev>",
          to: [args.freelancerEmail],
          subject: `Project Invitation: ${args.projectTitle}`,
          html: emailHtml,
          text: emailText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Resend API error:", errorData);
        throw new Error(`Failed to send email: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Email sent successfully:", data);
      return { success: true, emailId: data.id };
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  },
});
