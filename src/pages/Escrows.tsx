import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogoDropdown } from "@/components/LogoDropdown";
import { DollarSign, Lock, CheckCircle } from "lucide-react";

export default function Escrows() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const clientProjects = useQuery(api.contracts.listClientProjects);
  const freelancerProjects = useQuery(api.contracts.listFreelancerProjects);
  
  const projects = user?.role === "client" ? clientProjects : freelancerProjects;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LogoDropdown />
            <h1 className="text-2xl font-bold tracking-tight">Escrows</h1>
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

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Escrow Management</h2>
              <p className="text-muted-foreground mt-1">Track funds held in escrow</p>
            </div>
            <Button onClick={() => navigate("/dashboard")} className="bg-blue-600 hover:bg-blue-700">
              Back to Dashboard
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total in Escrow</CardTitle>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${projects?.reduce((sum, p) => sum + p.totalBudget, 0).toLocaleString() || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Escrows</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {projects?.filter(p => p.fundingStatus !== "unfunded").length || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {projects?.filter(p => p.status === "completed").length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Escrow Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {!projects || projects.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No escrow transactions</p>
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
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.fundingStatus.replace("_", " ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Amount</div>
                          <div className="text-xl font-bold">${project.totalBudget.toLocaleString()}</div>
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
