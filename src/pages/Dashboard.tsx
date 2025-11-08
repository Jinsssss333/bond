import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, DollarSign, AlertCircle, LayoutDashboard, Briefcase, Lock, Receipt } from "lucide-react";
import { LogoDropdown } from "@/components/LogoDropdown";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const contracts = useQuery(api.contracts.list);
  const disputes = useQuery(api.disputes.list);
  const createContract = useMutation(api.contracts.create);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newContract, setNewContract] = useState({
    title: "",
    description: "",
    freelancerId: "",
    totalAmount: "",
    currency: "USD",
  });

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

  const activeContracts = contracts?.filter((c) => c.status === "active") || [];
  const totalValue = contracts?.reduce((sum, c) => sum + c.currentAmount, 0) || 0;
  const openDisputes = disputes?.filter((d) => d.status === "open") || [];

  const handleCreateContract = async () => {
    try {
      const amount = parseFloat(newContract.totalAmount);
      if (!newContract.title || !newContract.description || !newContract.freelancerId || isNaN(amount)) {
        toast.error("Please fill all fields with valid data");
        return;
      }

      const contractId = await createContract({
        title: newContract.title,
        description: newContract.description,
        clientId: user._id,
        freelancerId: newContract.freelancerId as any,
        totalAmount: amount,
        currency: newContract.currency,
      });

      toast.success("Contract created successfully");
      setShowCreateDialog(false);
      setNewContract({ title: "", description: "", freelancerId: "", totalAmount: "", currency: "USD" });
      navigate(`/contracts/${contractId}`);
    } catch (error) {
      toast.error("Failed to create contract");
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
            variant="default"
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
            variant="ghost"
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
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">
                Welcome back, {user.name || user.email || "User"}!
              </h2>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    Create Escrow
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Contract</DialogTitle>
                    <DialogDescription>
                      Set up a new escrow contract with a freelancer
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={newContract.title}
                        onChange={(e) => setNewContract({ ...newContract, title: e.target.value })}
                        placeholder="Contract title"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={newContract.description}
                        onChange={(e) => setNewContract({ ...newContract, description: e.target.value })}
                        placeholder="Describe the project"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Freelancer User ID</label>
                      <Input
                        value={newContract.freelancerId}
                        onChange={(e) => setNewContract({ ...newContract, freelancerId: e.target.value })}
                        placeholder="Freelancer's user ID"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Total Amount</label>
                      <Input
                        type="number"
                        value={newContract.totalAmount}
                        onChange={(e) => setNewContract({ ...newContract, totalAmount: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Currency</label>
                      <Input
                        value={newContract.currency}
                        onChange={(e) => setNewContract({ ...newContract, currency: e.target.value })}
                        placeholder="USD"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateContract}>Create Contract</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Projects
                  </CardTitle>
                  <Briefcase className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{activeContracts.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total in Escrow
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    ${totalValue.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Open Disputes
                  </CardTitle>
                  <AlertCircle className="h-5 w-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{openDisputes.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
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