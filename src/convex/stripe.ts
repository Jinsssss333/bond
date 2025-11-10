"use node";

import { v } from "convex/values";
import { internalAction, action } from "./_generated/server";
import { internal } from "./_generated/api";
import Stripe from "stripe";

export const createPaymentIntent = action({
  args: {
    contractId: v.id("contracts"),
    amount: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      throw new Error("Stripe is not configured. Please add STRIPE_SECRET_KEY.");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-10-29.clover",
    });

    // Convert amount to cents for Stripe
    const amountInCents = Math.round(args.amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: args.currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        contractId: args.contractId,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  },
});

export const handleWebhook = internalAction({
  args: {
    body: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSecretKey || !webhookSecret) {
      console.error("Stripe webhook configuration missing");
      throw new Error("Stripe webhook not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-10-29.clover",
    });

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        args.body,
        args.signature,
        webhookSecret
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      throw new Error("Invalid webhook signature");
    }

    // Handle successful payment
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const contractId = paymentIntent.metadata.contractId;
      const amount = paymentIntent.amount / 100; // Convert from cents

      if (contractId) {
        // Update contract funding
        await ctx.runMutation(internal.contracts.fundContractInternal, {
          contractId: contractId as any,
          amount,
          paymentMethod: "fiat",
          transactionId: paymentIntent.id,
        });

        console.log("Payment succeeded for contract:", contractId);
      }
    }

    // Handle failed payment
    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.error("Payment failed:", paymentIntent.id);
    }

    return { received: true };
  },
});

export const refundPayment = action({
  args: {
    paymentIntentId: v.string(),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      throw new Error("Stripe is not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-10-29.clover",
    });

    const refund = await stripe.refunds.create({
      payment_intent: args.paymentIntentId,
      amount: args.amount ? Math.round(args.amount * 100) : undefined,
    });

    return {
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount / 100,
    };
  },
});
