import { useAuth } from "@/hooks/use-auth";
import { useNavigate, Routes, Route } from "react-router";
import { useEffect } from "react";
import ClientDashboard from "./dashboards/ClientDashboard";
import FreelancerDashboard from "./dashboards/FreelancerDashboard";
import ArbiterDashboard from "./dashboards/ArbiterDashboard";
import NotFound from "./NotFound";

export default function DashboardRouter() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

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

  return (
    <Routes>
      {(user.role === "client" || !user.role) && (
        <Route path="/*" element={<ClientDashboard />} />
      )}
      {user.role === "freelancer" && (
        <Route path="/*" element={<FreelancerDashboard />} />
      )}
      {user.role === "arbiter" && (
        <Route path="/*" element={<ArbiterDashboard />} />
      )}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
