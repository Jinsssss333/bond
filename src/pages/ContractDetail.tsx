// This page is deprecated. Use ProjectDetail instead
import { useNavigate } from "react-router";
import { useEffect } from "react";

export default function ContractDetail() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/dashboard");
  }, [navigate]);

  return null;
}
