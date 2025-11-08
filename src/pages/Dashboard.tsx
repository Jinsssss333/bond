import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, DollarSign, Clock } from "lucide-react";
import { LogoDropdown } from "@/components/LogoDropdown";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const contracts = useQuery(api.contracts.list);
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
  const totalValue = contracts?.reduce((sum, c) => sum + c.totalAmount, 0) || 0;
  const fundedValue = contracts?.reduce((sum, c) => sum + c.currentAmount, 0) || 0;

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
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LogoDropdown />
            <h1 className="text-2xl font-bold tracking-tight">Bond</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground mt-1">
                Manage your escrow contracts and milestones
              </p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Contract
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

          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Contracts
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeContracts.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Value
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${totalValue.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Funded Amount
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${fundedValue.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Contracts</CardTitle>
              <CardDescription>
                Your latest escrow agreements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!contracts || contracts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No contracts yet. Create your first one!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contracts.map((contract) => (
                    <motion.div
                      key={contract._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => navigate(`/contracts/${contract._id}`)}
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{contract.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {contract.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold">
                            ${contract.totalAmount.toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ${contract.currentAmount.toLocaleString()} funded
                          </div>
                        </div>
                        <Badge
                          variant={
                            contract.status === "active"
                              ? "default"
                              : contract.status === "completed"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {contract.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}