import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, DollarSign, AlertCircle, LayoutDashboard, Briefcase, Lock, Receipt, Settings, Menu, X } from "lucide-react";
import { WalletConnect } from "@/components/WalletConnect";
import { PolkadotWalletConnect } from "@/components/PolkadotWalletConnect";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const contracts = useQuery(api.contracts.list);
  const disputes = useQuery(api.disputes.list);
  const acceptContract = useMutation(api.contracts.acceptContract);
  const rejectContract = useMutation(api.contracts.rejectContract);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleAcceptContract = async (contractId: string) => {
    try {
      await acceptContract({ contractId: contractId as Id<"contracts"> });
      toast.success("Project invitation accepted!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to accept invitation");
    }
  };

  const handleRejectContract = async (contractId: string) => {
    try {
      await rejectContract({ contractId: contractId as Id<"contracts"> });
      toast.success("Project invitation rejected");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject invitation");
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const isFreelancer = user.role === "freelancer";
  const pendingInvitations = contracts?.filter((c) => c.status === "pending_acceptance" && c.freelancerId === user._id) || [];
  const activeContracts = contracts?.filter((c) => c.status === "active") || [];
  const totalValue = contracts?.reduce((sum, c) => sum + c.currentAmount, 0) || 0;
  const openDisputes = disputes?.filter((d) => d.status === "open") || [];

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
              <img src="https://harmless-tapir-303.convex.cloud/api/storage/4fa9fa7a-0288-4db5-8094-46ed7097320f" alt="Bond" width={48} height={48} className="rounded-lg bg-white p-1" />
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
            variant="default"
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
            variant="ghost"
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
            <Settings className="h-5 w-5" />
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
            {user.role !== "arbiter" && (
              <div className="flex items-center gap-3">
                <WalletConnect />
                <PolkadotWalletConnect />
              </div>
            )}
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
            {/* Welcome Section */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Welcome back, {user.name || user.email || "User"}!
              </h2>
            </div>

            {/* Pending Invitations for Freelancers */}
            {isFreelancer && pendingInvitations.length > 0 && (
              <Card className="border shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Pending Project Invitations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingInvitations.map((contract) => (
                    <div
                      key={contract._id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-muted/30"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{contract.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {contract.description}
                        </p>
                        <p className="text-sm font-medium mt-2">
                          Budget: ${contract.totalAmount.toLocaleString()} {contract.currency}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptContract(contract._id)}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/contracts/${contract._id}`)}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectContract(contract._id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Projects
                  </CardTitle>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{activeContracts.length}</div>
                </CardContent>
              </Card>

              <Card className="border shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total in Escrow
                  </CardTitle>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${totalValue.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Open Disputes
                  </CardTitle>
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{openDisputes.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border shadow-md">
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