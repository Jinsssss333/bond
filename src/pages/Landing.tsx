import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Shield, Lock, CheckCircle, Zap, ArrowRight } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="./logo.svg" alt="Bond" width={32} height={32} className="rounded-lg" />
            <span className="text-2xl font-bold tracking-tight">Bond</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button onClick={() => navigate("/dashboard")} className="rounded-full">
                Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/auth")}>
                  Sign In
                </Button>
                <Button onClick={() => navigate("/auth")} className="rounded-full">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <AuroraBackground>
          <section className="container mx-auto px-4 py-24 max-w-6xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-muted/50 text-sm backdrop-blur-sm">
                <Shield className="h-4 w-4" />
                Secure Freelance Escrow Platform
              </div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-5xl md:text-7xl font-bold tracking-tight"
              >
                Trust in every
                <br />
                <span className="text-primary">freelance deal</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-xl text-muted-foreground max-w-2xl mx-auto"
              >
                Bond provides secure escrow services for freelancers and clients with
                milestone-based payments, AI verification, and complete transparency.
              </motion.p>
            </motion.div>
          </section>
        </AuroraBackground>

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