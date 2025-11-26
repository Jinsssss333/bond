import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Shield, Lock, CheckCircle, Zap, ArrowRight } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();

  const animationProps = isMobile ? {
    initial: { opacity: 1, y: 0 },
    animate: { opacity: 1, y: 0 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0 }
  } : {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">Bond</span>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate(isAuthenticated ? "/dashboard" : "/auth")} className="rounded-full">
              {isAuthenticated ? "Dashboard" : "Sign In"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main>
        <AuroraBackground>
          <section className="container mx-auto px-4 py-24 max-w-6xl relative z-10">
            <motion.div
              {...animationProps}
              className="text-center space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-muted/50 text-sm backdrop-blur-sm">
                <Shield className="h-4 w-4" />
                Blockchain-Powered Escrow Platform
              </div>
              
              <motion.h1 
                {...animationProps}
                transition={isMobile ? { duration: 0 } : { delay: 0.2, duration: 0.6 }}
                className="text-4xl md:text-7xl font-bold tracking-tight"
              >
                Trust in every
                <br />
                <span className="text-blue-600">freelance deal</span>
              </motion.h1>
              
              <motion.p 
                {...animationProps}
                transition={isMobile ? { duration: 0 } : { delay: 0.4, duration: 0.6 }}
                className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
              >
                Bond provides secure blockchain escrow with USDC stablecoins for freelancers and clients with
                milestone-based payments, smart contracts, and complete transparency.
              </motion.p>
            </motion.div>
          </section>
        </AuroraBackground>

        <section className="container mx-auto px-4 py-16 md:py-24 max-w-6xl">
          <motion.div
            {...animationProps}
            className="grid md:grid-cols-3 gap-8"
          >
            <div className="space-y-4 p-6 border rounded-lg bg-card/50 backdrop-blur-sm">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Blockchain Escrow</h3>
              <p className="text-muted-foreground">
                Funds held in smart contracts on Ethereum/Polygon until milestones are completed and approved.
              </p>
            </div>

            <div className="space-y-4 p-6 border rounded-lg bg-card/50 backdrop-blur-sm">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">USDC Payments</h3>
              <p className="text-muted-foreground">
                Pay with USDC stablecoin - no crypto volatility, just stable USD-pegged payments.
              </p>
            </div>

            <div className="space-y-4 p-6 border rounded-lg bg-card/50 backdrop-blur-sm">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Web3 Wallets</h3>
              <p className="text-muted-foreground">
                Connect MetaMask, WalletConnect, or Coinbase Wallet for secure crypto transactions.
              </p>
            </div>
          </motion.div>
        </section>

        <section className="border-t">
          <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl text-center space-y-6">
            <motion.div
              {...animationProps}
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Ready to secure your next project?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Join thousands of freelancers and clients who trust Bond for blockchain escrow.
              </p>
              <Button size="lg" onClick={() => navigate("/auth")} className="w-full md:w-auto">
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