import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Scale, DollarSign, LayoutDashboard, AlertCircle, FileText, Settings as SettingsIcon } from "lucide-react";
import { LogoDropdown } from "@/components/LogoDropdown";

export default function ArbiterDashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const disputes = useQuery(api.disputes.list);
  const escrows = useQuery(api.escrows.list);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const openDisputes = disputes?.filter((d) => d.status === "open" || d.status === "under_review") || [];
  const resolvedDisputes = disputes?.filter((d) => d.status === "resolved") || [];
  const totalEscrows = escrows?.length || 0;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Bond" width={32} height={32} className="rounded-lg" />
            <span className="text-2xl font-bold tracking-tight text-primary">BOND</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant="default"
            className="w-full justify-start gap-3"
            onClick={() => navigate("/arbiter/dashboard")}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => navigate("/arbiter/disputes")}
          >
            <Shield className="h-5 w-5" />
            Disputes
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => navigate("/arbiter/escrows")}
          >
            <Scale className="h-5 w-5" />
            All Escrows
          </Button>
        </nav>

        <div className="p-4 border-t space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => navigate("/settings")}
          >
            <SettingsIcon className="h-5 w-5" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3">
            <FileText className="h-5 w-5" />
            Developer
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3">
            <AlertCircle className="h-5 w-5" />
            Help & Support
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="px-8 py-4 flex items-center justify-between">
            <h1 className="text-sm text-muted-foreground">Bond - Guaranteed Payments</h1>
            <div className="flex items-center gap-4">
              <LogoDropdown />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Welcome Section */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Welcome back, {user.name || user.email || "Bond Arbiter"}!
              </h2>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Open Disputes
                  </CardTitle>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{openDisputes.length}</div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Resolved
                  </CardTitle>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Scale className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{resolvedDisputes.length}</div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    All Escrows
                  </CardTitle>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalEscrows}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Activity feed coming soon...</p>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}