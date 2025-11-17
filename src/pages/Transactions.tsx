import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Briefcase, Lock, Receipt, FileText, AlertCircle, Settings as SettingsIcon, ArrowDownLeft, ArrowUpRight, Menu, X } from "lucide-react";
import { LogoDropdown } from "@/components/LogoDropdown";

export default function Transactions() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const transactions = useQuery(api.transactions.list);
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-card transition-all duration-300 ease-in-out flex flex-col shadow-lg`}>
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && (
            <button 
              onClick={() => navigate("/")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img src="https://harmless-tapir-303.convex.cloud/api/storage/4fa9fa7a-0288-4db5-8094-46ed7097320f" alt="Bond" width={48} height={48} className="rounded-lg" />
              <span className="text-2xl font-bold tracking-tight text-primary">BOND</span>
            </button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <Button
            variant="ghost"
            className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'} gap-3`}
            onClick={() => navigate("/dashboard")}
          >
            <LayoutDashboard className="h-5 w-5" />
            {sidebarOpen && "Dashboard"}
          </Button>
          <Button
            variant="ghost"
            className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'} gap-3`}
            onClick={() => navigate("/projects")}
          >
            <Briefcase className="h-5 w-5" />
            {sidebarOpen && "Projects"}
          </Button>
          <Button
            variant="ghost"
            className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'} gap-3`}
            onClick={() => navigate("/escrows")}
          >
            <Lock className="h-5 w-5" />
            {sidebarOpen && "Escrows"}
          </Button>
          <Button
            variant="default"
            className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'} gap-3`}
            onClick={() => navigate("/transactions")}
          >
            <Receipt className="h-5 w-5" />
            {sidebarOpen && "Transactions"}
          </Button>
        </nav>

        <div className="p-3 space-y-1">
          <Button
            variant="ghost"
            className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'} gap-3`}
            onClick={() => navigate("/settings")}
          >
            <SettingsIcon className="h-5 w-5" />
            {sidebarOpen && "Settings"}
          </Button>
          <Button variant="ghost" className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'} gap-3`}>
            <FileText className="h-5 w-5" />
            {sidebarOpen && "Developer"}
          </Button>
          <Button variant="ghost" className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'} gap-3`}>
            <AlertCircle className="h-5 w-5" />
            {sidebarOpen && "Help & Support"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card/50 backdrop-blur-sm">
          <div className="px-8 py-4 flex items-center justify-end">
            <LogoDropdown />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 overflow-y-auto">
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