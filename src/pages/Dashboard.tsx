// This page is deprecated. Use DashboardRouter instead which routes to role-based dashboards
import { useNavigate } from "react-router";
import { useEffect } from "react";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/dashboard");
  }, [navigate]);

  return null;
}