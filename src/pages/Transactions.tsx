import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Briefcase, Lock, Receipt, FileText, AlertCircle, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { LogoDropdown } from "@/components/LogoDropdown";

export default function Transactions() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const transactions = useQuery(api.transactions.list);

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "funding":
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case "release":
      case "payout":
        return <ArrowUpRight className="h-4 w-4 text-blue-600" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
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
            onClick={() => navigate("/dashboard")}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => navigate("/projects")}
          >
            <Briefcase className="h-5 w-5" />
            Projects
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => navigate("/escrows")}
          >
            <Lock className="h-5 w-5" />
            Escrows
          </Button>
          <Button
            variant="default"
            className="w-full justify-start gap-3"
            onClick={() => navigate("/transactions")}
          >
            <Receipt className="h-5 w-5" />
            Transactions
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
              <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
            </div>

            {/* Transactions Table */}
            {!transactions || transactions.length === 0 ? (
              <div className="border-2 rounded-lg p-12 text-center">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground">No transactions yet.</p>
              </div>
            ) : (
              <div className="border-2 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Escrow ID</th>
                      <th className="text-left p-4 font-medium">Amount</th>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Payment ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr
                        key={transaction._id}
                        className="border-b hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(transaction.type)}
                            <span className="capitalize font-medium">{transaction.type}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-primary font-mono text-sm">
                            {transaction.contractId.slice(0, 10)}...
                          </span>
                        </td>
                        <td className="p-4 font-semibold">
                          {transaction.amount.toLocaleString()} {transaction.currency}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(transaction._creationTime).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-sm text-muted-foreground">
                            pi_{transaction._id.slice(0, 6)}...
                          </span>
                        </td>
                      </tr>
                    ))}
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
