import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, DollarSign, AlertCircle, Menu, X, LayoutGrid, Settings, HelpCircle, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ClientDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const projects = useQuery(api.contracts.listClientProjects);
  const createProject = useMutation(api.contracts.createProject);

  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <span className="text-sm text-slate-400">Bond - Guaranteed Payments</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <Settings className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 pl-4 border-l border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold">
                AC
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Acme Corp</span>
                <span className="text-xs text-slate-400">Client</span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? 212 : 0 }}
          transition={{ duration: 0.3 }}
          className="border-r border-slate-800 bg-slate-900/50 overflow-hidden"
        >
          <div className="p-6 space-y-8">
            <div>
              <h1 className="text-xl font-bold text-blue-400">BOND</h1>
            </div>

            <nav className="space-y-2">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-600/20 text-blue-400 text-sm font-medium">
                <LayoutGrid className="h-4 w-4" />
                Dashboard
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors">
                <FileText className="h-4 w-4" />
                Projects
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors">
                <DollarSign className="h-4 w-4" />
                Escrows
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors">
                <AlertCircle className="h-4 w-4" />
                Transactions
              </button>
            </nav>

            <div className="pt-8 border-t border-slate-800 space-y-2">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors">
                <Settings className="h-4 w-4" />
                Developer
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors">
                <HelpCircle className="h-4 w-4" />
                Help & Support
              </button>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-8 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold">Welcome back, Acme Corp!</h2>
                  <p className="text-slate-400 mt-2">Manage your projects and escrows</p>
                </div>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Escrow
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-slate-800">
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
                          className="bg-slate-800 border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={newProject.description}
                          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                          placeholder="Describe the project"
                          className="bg-slate-800 border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Freelancer User ID</label>
                        <Input
                          value={newProject.freelancerId}
                          onChange={(e) => setNewProject({ ...newProject, freelancerId: e.target.value })}
                          placeholder="Freelancer's user ID"
                          className="bg-slate-800 border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Total Budget</label>
                        <Input
                          type="number"
                          value={newProject.totalBudget}
                          onChange={(e) => setNewProject({ ...newProject, totalBudget: e.target.value })}
                          placeholder="0.00"
                          className="bg-slate-800 border-slate-700"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-slate-700">
                        Cancel
                      </Button>
                      <Button onClick={handleCreateProject} className="bg-blue-600 hover:bg-blue-700">
                        Create Project
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Active Projects</CardTitle>
                    <FileText className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{activeProjects.length}</div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Total in Escrow</CardTitle>
                    <DollarSign className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">${totalBudget.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Open Disputes</CardTitle>
                    <AlertCircle className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">0</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Activity feed coming soon...</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-slate-400">
                    <p>Activity feed coming soon...</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}