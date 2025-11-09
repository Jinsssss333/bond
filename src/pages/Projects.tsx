import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LayoutDashboard, Briefcase, Lock, Receipt, FileText, AlertCircle } from "lucide-react";
import { LogoDropdown } from "@/components/LogoDropdown";
import { toast } from "sonner";

export default function Projects() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const contracts = useQuery(api.contracts.list);
  const createContract = useMutation(api.contracts.create);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    freelancerEmail: "",
    totalAmount: "",
    currency: "USD",
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleCreateProject = async () => {
    try {
      setIsCreating(true);
      
      if (!newProject.title || !newProject.description || !newProject.freelancerEmail || !newProject.totalAmount) {
        toast.error("Please fill in all fields");
        setIsCreating(false);
        return;
      }

      const amount = parseFloat(newProject.totalAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("Please enter a valid amount");
        setIsCreating(false);
        return;
      }

      await createContract({
        title: newProject.title,
        description: newProject.description,
        freelancerEmail: newProject.freelancerEmail,
        totalAmount: amount,
        currency: newProject.currency,
      });

      toast.success("Project created successfully!");
      setShowCreateDialog(false);
      setNewProject({
        title: "",
        description: "",
        freelancerEmail: "",
        totalAmount: "",
        currency: "USD",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create project");
    } finally {
      setIsCreating(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "disputed":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "draft":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
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
            variant="default"
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
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
              {!isFreelancer && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  Create New Project
                </Button>
              )}
            </div>

            {/* Create Project Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Enter the project details to create a new contract with a freelancer.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter project title"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the project"
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="freelancerEmail">Freelancer Email</Label>
                    <Input
                      id="freelancerEmail"
                      type="email"
                      placeholder="freelancer@example.com"
                      value={newProject.freelancerEmail}
                      onChange={(e) => setNewProject({ ...newProject, freelancerEmail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalAmount">Total Budget</Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      placeholder="0.00"
                      value={newProject.totalAmount}
                      onChange={(e) => setNewProject({ ...newProject, totalAmount: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={isCreating}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProject} disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Project"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Projects Grid */}
            {!contracts || contracts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                  <p className="text-muted-foreground">No projects yet. Create one to get started!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {contracts.map((contract) => (
                  <motion.div
                    key={contract._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full flex flex-col">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <CardTitle className="text-lg">{contract.title}</CardTitle>
                          <Badge className={getStatusColor(contract.status)}>
                            {contract.status}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {contract.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col justify-end">
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="text-2xl font-bold">
                              ${contract.totalAmount.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Budget</div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/contracts/${contract._id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}