import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Scale, LayoutDashboard, AlertCircle, FileText } from "lucide-react";
import { LogoDropdown } from "@/components/LogoDropdown";

export default function ArbiterDisputes() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const disputes = useQuery(api.disputes.list);
  const contracts = useQuery(api.contracts.list);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "under_review":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "resolved":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "closed":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getContract = (contractId: string) => {
    return contracts?.find((c) => c._id === contractId);
  };

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
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => navigate("/arbiter/dashboard")}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Button>
          <Button
            variant="default"
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
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">All Disputes</h2>
            </div>

            {/* Disputes Table */}
            {!disputes || disputes.length === 0 ? (
              <div className="border-2 rounded-lg p-12 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground">No disputes to review.</p>
              </div>
            ) : (
              <div className="border-2 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium">Dispute ID</th>
                      <th className="text-left p-4 font-medium">Escrow ID</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Date Opened</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disputes.map((dispute) => {
                      const contract = getContract(dispute.contractId);
                      return (
                        <tr
                          key={dispute._id}
                          className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                          onClick={() => navigate(`/arbiter/disputes/${dispute._id}`)}
                        >
                          <td className="p-4">
                            <span className="text-primary font-mono text-sm">
                              dispute-{dispute._id.slice(0, 6)}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-primary font-mono text-sm">
                              {contract ? `escrow-${contract._id.slice(0, 6)}` : "N/A"}
                            </span>
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusColor(dispute.status)}>
                              {dispute.status === "under_review" ? "Under Review" : dispute.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {new Date(dispute._creationTime).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
