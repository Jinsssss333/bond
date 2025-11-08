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
import { ArrowLeft, Plus, DollarSign } from "lucide-react";
import { LogoDropdown } from "@/components/LogoDropdown";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const project = useQuery(
    api.contracts.getProject,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip"
  );
  const milestones = useQuery(
    api.milestones.listByProject,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip"
  );

  const fundProject = useMutation(api.contracts.fundProject);
  const createMilestone = useMutation(api.milestones.create);

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

  if (isLoading || !user || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const isClient = project.clientId === user._id;

  const handleFund = async () => {
    try {
      const amount = parseFloat(fundAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      await fundProject({
        projectId: project._id,
        amount,
      });

      toast.success("Project funded successfully");
      setFundAmount("");
    } catch (error) {
      toast.error("Failed to fund project");
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
        projectId: project._id,
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
              <h2 className="text-3xl font-bold tracking-tight">{project.title}</h2>
              <p className="text-muted-foreground mt-2">{project.description}</p>
            </div>
            <Badge variant={project.status === "active" ? "default" : "outline"}>
              {project.status}
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Budget</span>
                  <span className="font-semibold">${project.totalBudget.toLocaleString()} {project.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Funding Status</span>
                  <Badge variant="outline">{project.fundingStatus}</Badge>
                </div>
              </CardContent>
            </Card>

            {isClient && project.fundingStatus !== "fully_funded" && (
              <Card>
                <CardHeader>
                  <CardTitle>Fund Project</CardTitle>
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
                {isClient && (
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
                        <DialogDescription>Add a new milestone to this project</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Title</label>
                          <Input
                            value={newMilestone.title}
                            onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                            placeholder="Milestone title"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={newMilestone.description}
                            onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                            placeholder="Describe the deliverable"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Amount</label>
                          <Input
                            type="number"
                            value={newMilestone.amount}
                            onChange={(e) => setNewMilestone({ ...newMilestone, amount: e.target.value })}
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
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!milestones || milestones.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No milestones yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {milestones.map((milestone) => (
                    <div key={milestone._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{milestone.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold">${milestone.amount.toLocaleString()}</div>
                        </div>
                        <Badge variant="outline">{milestone.status}</Badge>
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
