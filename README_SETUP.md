# Environment Setup Guide

This guide will help you set up all the necessary API keys and environment variables for the Bond Escrow platform.

## Required Services

### 1. Convex (Backend & Database)
- Sign up at [convex.dev](https://convex.dev)
- Create a new project
- Run `npx convex dev` to get your deployment URL
- The CLI will automatically set up `CONVEX_DEPLOYMENT` and authentication keys

### 2. Resend (Email Service)
- Sign up at [resend.com](https://resend.com)
- Get your API key from the dashboard
- Add to Convex environment: `RESEND_API_KEY`

### 3. WalletConnect (Web3 Wallet Connection)
- Sign up at [cloud.walletconnect.com](https://cloud.walletconnect.com/)
- Create a new project
- Copy your Project ID
- Add to `.env.local`: `VITE_WALLETCONNECT_PROJECT_ID`

### 4. Stripe (Payment Processing)
- Sign up at [stripe.com](https://stripe.com)
- Get your API keys from the dashboard (use test keys for development)
- Add to Convex environment:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET` (from Stripe CLI or webhook settings)

### 5. Google Gemini (AI Summarization)
- Sign up at [ai.google.dev](https://ai.google.dev)
- Get your API key
- Add to Convex environment: `GEMINI_API_KEY`

### 6. Alchemy (Optional - Better RPC Performance)
- Sign up at [alchemy.com](https://www.alchemy.com/)
- Create apps for Ethereum and Polygon
- Add to `.env.local`: `NEXT_PUBLIC_ALCHEMY_API_KEY`

## Setup Steps

### 1. Install Dependencies
