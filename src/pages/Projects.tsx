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
import { LayoutDashboard, Briefcase, Lock, Receipt, FileText, AlertCircle, Settings as SettingsIcon, Trash2, Menu, X } from "lucide-react";
import { LogoDropdown } from "@/components/LogoDropdown";
import { toast } from "sonner";

export default function Projects() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const contracts = useQuery(api.contracts.list);
  const createContract = useMutation(api.contracts.create);
  const deleteContract = useMutation(api.contracts.deleteContract);
  const requestDeletion = useMutation(api.contracts.requestDeletion);
  const confirmDeletion = useMutation(api.contracts.confirmDeletion);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleDeleteClick = (contractId: string, status: string) => {
    setSelectedContractId(contractId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedContractId) return;

    try {
      setIsDeleting(true);
      const contract = contracts?.find(c => c._id === selectedContractId);
      
      if (!contract) {
        toast.error("Contract not found");
        return;
      }

      if (contract.status === "pending_acceptance") {
        // Direct deletion for pending contracts
        await deleteContract({ contractId: selectedContractId as any });
        toast.success("Project deleted successfully");
      } else {
        // Request deletion for active contracts
        await requestDeletion({ contractId: selectedContractId as any });
        toast.success("Deletion request sent to freelancer");
      }

      setShowDeleteDialog(false);
      setSelectedContractId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete project");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDeletion = async (contractId: string) => {
    try {
      await confirmDeletion({ contractId: contractId as any });
      toast.success("Deletion confirmed. Client can now delete the project.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to confirm deletion");
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
  const isClient = user.role === "client";

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
            variant="ghost"
            className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'} gap-3`}
            onClick={() => navigate("/dashboard")}
          >
            <LayoutDashboard className="h-5 w-5" />
            {sidebarOpen && "Dashboard"}
          </Button>
          <Button
            variant="default"
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

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Project</DialogTitle>
                  <DialogDescription>
                    {contracts?.find(c => c._id === selectedContractId)?.status === "pending_acceptance"
                      ? "Are you sure you want to delete this project? This action cannot be undone."
                      : "This project has an active freelancer. A deletion request will be sent to them for confirmation."}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Delete Project"}
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
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(contract.status)}>
                              {contract.status}
                            </Badge>
                            {isClient && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleDeleteClick(contract._id, contract.status)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {contract.description}
                        </CardDescription>
                        {contract.status === "pending_deletion" && isFreelancer && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm font-medium text-yellow-800">Deletion Requested</p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2"
                              onClick={() => handleConfirmDeletion(contract._id)}
                            >
                              Confirm Deletion
                            </Button>
                          </div>
                        )}
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