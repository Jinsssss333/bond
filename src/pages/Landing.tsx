import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Shield, Lock, CheckCircle, Zap, ArrowRight } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="./logo.svg" alt="Bond" width={32} height={32} className="rounded-lg" />
            <span className="text-2xl font-bold tracking-tight">Bond</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button onClick={() => navigate("/dashboard")}>
                Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button onClick={() => navigate("/auth")}>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-24 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-muted/50 text-sm">
              <Shield className="h-4 w-4" />
              Secure Freelance Escrow Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Trust in every
              <br />
              <span className="text-primary">freelance deal</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Bond provides secure escrow services for freelancers and clients with
              milestone-based payments, AI verification, and complete transparency.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <Button size="lg" onClick={() => navigate("/auth")}>
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </section>

        <section className="container mx-auto px-4 py-24 max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            <div className="space-y-4 p-6 border rounded-lg">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Secure Escrow</h3>
              <p className="text-muted-foreground">
                Funds are held securely until milestones are completed and approved by both parties.
              </p>
            </div>

            <div className="space-y-4 p-6 border rounded-lg">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Milestone Tracking</h3>
              <p className="text-muted-foreground">
                Break projects into milestones with clear deliverables and payment schedules.
              </p>
            </div>

            <div className="space-y-4 p-6 border rounded-lg">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">AI Verification</h3>
              <p className="text-muted-foreground">
                Automated deliverable verification using AI to ensure quality standards are met.
              </p>
            </div>
          </motion.div>
        </section>

        <section className="border-t">
          <div className="container mx-auto px-4 py-24 max-w-4xl text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold tracking-tight mb-4">
                Ready to secure your next project?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of freelancers and clients who trust Bond for their escrow needs.
              </p>
              <Button size="lg" onClick={() => navigate("/auth")}>
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2024 Bond. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}