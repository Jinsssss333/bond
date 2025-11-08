import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, DollarSign, AlertCircle } from "lucide-react";
import { LogoDropdown } from "@/components/LogoDropdown";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ClientDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const projects = useQuery(api.contracts.listClientProjects);
  const createProject = useMutation(api.contracts.createProject);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    freelancerId: "",
    totalBudget: "",
    currency: "USD",
  });

  const handleCreateProject = async () => {
    try {
      const budget = parseFloat(newProject.totalBudget);
      if (!newProject.title || !newProject.description || !newProject.freelancerId || isNaN(budget)) {
        toast.error("Please fill all fields with valid data");
        return;
      }

      const projectId = await createProject({
        title: newProject.title,
        description: newProject.description,
        freelancerId: newProject.freelancerId as any,
        totalBudget: budget,
        currency: newProject.currency,
      });

      toast.success("Project created successfully");
      setShowCreateDialog(false);
      setNewProject({ title: "", description: "", freelancerId: "", totalBudget: "", currency: "USD" });
      navigate(`/projects/${projectId}`);
    } catch (error) {
      toast.error("Failed to create project");
    }
  };

  const activeProjects = projects?.filter((p) => p.status === "active") || [];
  const totalBudget = projects?.reduce((sum, p) => sum + p.totalBudget, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LogoDropdown />
            <h1 className="text-2xl font-bold tracking-tight">Bond</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={() => {
              signOut();
              navigate("/");
            }}>
              Sign Out
            </Button>
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
              <h2 className="text-3xl font-bold tracking-tight">Client Dashboard</h2>
              <p className="text-muted-foreground mt-1">Manage your projects and escrows</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>Set up a new project with a freelancer</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      placeholder="Project title"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="Describe the project"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Freelancer User ID</label>
                    <Input
                      value={newProject.freelancerId}
                      onChange={(e) => setNewProject({ ...newProject, freelancerId: e.target.value })}
                      placeholder="Freelancer's user ID"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Total Budget</label>
                    <Input
                      type="number"
                      value={newProject.totalBudget}
                      onChange={(e) => setNewProject({ ...newProject, totalBudget: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProject}>Create Project</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeProjects.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disputes</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Projects</CardTitle>
              <CardDescription>All your active and completed projects</CardDescription>
            </CardHeader>
            <CardContent>
              {!projects || projects.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No projects yet. Create your first one!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <motion.div
                      key={project._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => navigate(`/projects/${project._id}`)}
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{project.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold">${project.totalBudget.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">{project.fundingStatus}</div>
                        </div>
                        <Badge variant={project.status === "active" ? "default" : "outline"}>
                          {project.status}
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