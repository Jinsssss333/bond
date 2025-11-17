Bond Escrow

A modern escrow-app built with a full-stack stack: frontend, backend, authentication, and database.

🚀 Why Bond Escrow

Bond Escrow is designed to provide a secure, user-friendly escrow platform. Whether you’re building a fintech app, marketplace, or trust-mediated transactional system, this project gives you a strong foundation:

React + Vite for fast frontend development

TypeScript across frontend and backend for type-safety

Convex for backend & database, with built-in real-time capabilities

Email/OTP authentication out of the box

Tailwind v4 + Shadcn UI for clean, extendable UI components

Animations (Framer Motion) + customizable theme support

🧰 Tech Stack

Frontend: Vite + React + TypeScript

Styling: Tailwind v4, Shadcn UI, Lucide Icons

Backend: Convex (database + serverless)

Auth: Convex Auth (email OTP + anonymous users)

Animations: Framer Motion

Routing: React Router v7

Project uses pnpm as package manager

🔧 Quick Setup

Clone the repo:

git clone https://github.com/Jinsssss333/bond.git
cd bond


Install dependencies:

pnpm install


Configure your environment variables using .env.example as reference. Key variables include:

VITE_CONVEX_URL

CONVEX_DEPLOYMENT

Backend variables: JWKS, JWT_PRIVATE_KEY, SITE_URL

Run the local development server:

pnpm dev


Open your browser at http://localhost:5173 (or whichever port Vite uses).

🛡 Authentication & Authorization

Auth is already configured. Email-OTP flow and anonymous users are supported.

Frontend: Use the useAuth hook from @/hooks/use-auth to retrieve isLoading, isAuthenticated, user, signIn, signOut.

Protect routes by checking isAuthenticated and redirecting to /auth when needed.

Backend: Use getCurrentUser() from src/convex/users.ts for server-side user context.

Do not modify src/convex/auth/emailOtp.ts, auth.config.ts, or auth.ts unless you know what you’re doing.

Use proper authorization checks on both frontend and backend to ensure secure access.

📂 Code Structure & Conventions

src/pages/ – Your page components go here.

src/components/ – Reusable UI components.

src/components/ui/ – Shadcn UI primitives and custom UI-wrappers.

When adding a page, add its route in src/main.tsx.

Follow these UI guidelines:

Use cursor-pointer on clickable elements

For title text: tracking-tight font-bold

Avoid nested cards and heavy shadows — prefer simple borders

Always ensure mobile responsiveness (max/min widths, center alignment)

Implement dark/light mode via parent className theme switching

🧪 Backend (Convex) Details

Schema defined in src/convex/schema.ts.

Do not include _id or _creationTime fields explicitly in queries — they are handled automatically.

Document ID types: use Id<"TableName">, not plain string.

Document object types: Doc<"TableName">.

Use use node when writing Convex actions that access external connections. Separate queries/mutations from external-connection actions.

Example CRUD usage:

import { crud } from "convex-helpers/server/crud";
import schema from "./schema.ts";

export const { create, read, update, destroy } = crud(schema, "users");

// In an action:
const user = await ctx.runQuery(internal.users.read, { id: userId });

📝 Contributing

Contributions are welcome! Whether you’re filing bug reports, proposing new features, or submitting pull requests — here’s how:

Fork the repository

Create your feature branch (git checkout -b feature/xyz)

Commit your changes (git commit -m "Add …")

Push to your branch (git push origin feature/xyz)

Open a Pull Request

Please follow existing code style, ensure UI responsiveness, write TypeScript types, and test your changes.

📜 License

Distributed under the MIT License.

✅ Coming Soon / Roadmap

Support additional authentication providers (e.g., OAuth)

Escrow-specific workflow modules (e.g., Dispute resolution, Multi-party bonding)

Admin dashboard for monitoring transactions

Improved UI themes / presets

Production deployment guide

Questions?

If you encounter issues or have feature requests, feel free to open an issue on the repo or contact the maintainer.

Thanks for checking out Bond Escrow — happy coding! 🎉
