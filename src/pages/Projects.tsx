import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoDropdown } from "@/components/LogoDropdown";
import { Search, Filter } from "lucide-react";
import { useState } from "react";

export default function Projects() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  const clientProjects = useQuery(api.contracts.listClientProjects);
  const freelancerProjects = useQuery(api.contracts.listFreelancerProjects);
  
  const allProjects = user?.role === "client" ? clientProjects : freelancerProjects;
  
  const filteredProjects = allProjects?.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LogoDropdown />
            <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
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
              <h2 className="text-3xl font-bold">All Projects</h2>
              <p className="text-muted-foreground mt-1">Manage your projects and milestones</p>
            </div>
            <Button onClick={() => navigate("/dashboard")} className="bg-blue-600 hover:bg-blue-700">
              Back to Dashboard
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No projects found
                </CardContent>
              </Card>
            ) : (
              filteredProjects.map((project) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => navigate(`/projects/${project._id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl">{project.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-2">{project.description}</p>
                        </div>
                        <Badge variant={project.status === "active" ? "default" : "outline"}>
                          {project.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Budget</div>
                          <div className="text-2xl font-bold">${project.totalBudget.toLocaleString()}</div>
                        </div>
                        <div className="space-y-1 text-right">
                          <div className="text-sm text-muted-foreground">Funding Status</div>
                          <Badge variant="outline">
                            {project.fundingStatus.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
