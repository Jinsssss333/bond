import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LogoDropdown } from "@/components/LogoDropdown";
import { ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";

export default function Transactions() {
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
            <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
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
              <h2 className="text-3xl font-bold">Transaction History</h2>
              <p className="text-muted-foreground mt-1">View all your payment transactions</p>
            </div>
            <Button onClick={() => navigate("/dashboard")} className="bg-blue-600 hover:bg-blue-700">
              Back to Dashboard
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {!projects || projects.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <motion.div
                      key={project._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          user?.role === "client" ? "bg-red-500/20" : "bg-green-500/20"
                        }`}>
                          {user?.role === "client" ? (
                            <ArrowUpRight className="h-5 w-5 text-red-400" />
                          ) : (
                            <ArrowDownRight className="h-5 w-5 text-green-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{project.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {user?.role === "client" ? "Payment to escrow" : "Payment from escrow"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-xl font-bold ${
                            user?.role === "client" ? "text-destructive" : "text-green-600"
                          }`}>
                            {user?.role === "client" ? "-" : "+"}${project.totalBudget.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">{project.currency}</div>
                        </div>
                        <Badge variant="outline">
                          {project.fundingStatus.replace("_", " ")}
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
