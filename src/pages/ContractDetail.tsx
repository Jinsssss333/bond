import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
import { LogoDropdown } from "@/components/LogoDropdown";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export default function ContractDetail() {
  const { contractId } = useParams<{ contractId: string }>();
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const contract = useQuery(
    api.contracts.get,
    contractId ? { contractId: contractId as Id<"contracts"> } : "skip"
  );
  const milestones = useQuery(
    api.milestones.listByContract,
    contractId ? { contractId: contractId as Id<"contracts"> } : "skip"
  );

  const fundContract = useMutation(api.contracts.fundContract);
  const createMilestone = useMutation(api.milestones.create);
  const approveMilestone = useMutation(api.milestones.approve);
  const acceptContract = useMutation(api.contracts.acceptContract);

  const [fundAmount, setFundAmount] = useState("");
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    amount: "",
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading || !user || !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const isClient = contract.clientId === user._id;
  const isFreelancer = contract.freelancerId === user._id;
  const isPending = contract.status === "pending_acceptance";
  const fundingProgress = (contract.currentAmount / contract.totalAmount) * 100;

  const handleAcceptContract = async () => {
    try {
      await acceptContract({ contractId: contract._id });
      toast.success("Project invitation accepted!");
    } catch (error) {
      toast.error("Failed to accept invitation");
    }
  };

  const handleFund = async () => {
    try {
      const amount = parseFloat(fundAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      await fundContract({
        contractId: contract._id,
        amount,
      });

      toast.success("Contract funded successfully");
      setFundAmount("");
    } catch (error) {
      toast.error("Failed to fund contract");
    }
  };

  const handleCreateMilestone = async () => {
    try {
      const amount = parseFloat(newMilestone.amount);
      if (!newMilestone.title || !newMilestone.description || isNaN(amount)) {
        toast.error("Please fill all fields");
        return;
      }

      await createMilestone({
        contractId: contract._id,
        title: newMilestone.title,
        description: newMilestone.description,
        amount,
      });

      toast.success("Milestone created successfully");
      setShowMilestoneDialog(false);
      setNewMilestone({ title: "", description: "", amount: "" });
    } catch (error) {
      toast.error("Failed to create milestone");
    }
  };

  const handleApproveMilestone = async (milestoneId: Id<"milestones">) => {
    try {
      await approveMilestone({ milestoneId });
      toast.success("Milestone approved");
    } catch (error) {
      toast.error("Failed to approve milestone");
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{contract.title}</h2>
              <p className="text-muted-foreground mt-2">{contract.description}</p>
            </div>
            <div className="flex gap-2">
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
          </div>

          {/* Pending Invitation Alert for Freelancers */}
          {isPending && isFreelancer && (
            <Card className="border-2 border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle>Project Invitation</CardTitle>
                <CardDescription>
                  You've been invited to work on this project. Review the details and accept to get started.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleAcceptContract} size="lg">
                  Accept Project Invitation
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Contract Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-semibold">
                    ${contract.totalAmount.toLocaleString()} {contract.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Funded Amount</span>
                  <span className="font-semibold">
                    ${contract.currentAmount.toLocaleString()} {contract.currency}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Funding Progress</span>
                    <span className="font-medium">{fundingProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={fundingProgress} />
                </div>
                <Badge variant="outline">{contract.fundingStatus}</Badge>
              </CardContent>
            </Card>

            {isClient && contract.fundingStatus !== "fully_funded" && (
              <Card>
                <CardHeader>
                  <CardTitle>Fund Contract</CardTitle>
                  <CardDescription>Add funds to the escrow</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                    />
                    <Button onClick={handleFund}>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Fund
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Remaining: ${(contract.totalAmount - contract.currentAmount).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Milestones</CardTitle>
                  <CardDescription>Track deliverables and payments</CardDescription>
                </div>
                <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Milestone
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Milestone</DialogTitle>
                      <DialogDescription>
                        Add a new milestone to this contract
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          value={newMilestone.title}
                          onChange={(e) =>
                            setNewMilestone({ ...newMilestone, title: e.target.value })
                          }
                          placeholder="Milestone title"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={newMilestone.description}
                          onChange={(e) =>
                            setNewMilestone({ ...newMilestone, description: e.target.value })
                          }
                          placeholder="Describe the deliverable"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Amount</label>
                        <Input
                          type="number"
                          value={newMilestone.amount}
                          onChange={(e) =>
                            setNewMilestone({ ...newMilestone, amount: e.target.value })
                          }
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowMilestoneDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateMilestone}>Create</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {!milestones || milestones.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No milestones yet. Create one to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {milestones.map((milestone) => (
                    <div
                      key={milestone._id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{milestone.title}</h4>
                          <Badge variant="outline">{milestone.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {milestone.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold">
                            ${milestone.amount.toLocaleString()}
                          </div>
                        </div>
                        {isClient && milestone.status === "submitted" && (
                          <Button
                            size="sm"
                            onClick={() => handleApproveMilestone(milestone._id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
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