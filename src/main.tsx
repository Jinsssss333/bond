import { Toaster } from "@/components/ui/sonner";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import AuthPage from "@/pages/Auth.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from './config/wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import "./index.css";
import Landing from "./pages/Landing.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import ContractDetail from "./pages/ContractDetail.tsx";
import NotFound from "./pages/NotFound.tsx";
import Projects from "./pages/Projects.tsx";
import Escrows from "./pages/Escrows.tsx";
import Transactions from "./pages/Transactions.tsx";
import ArbiterDashboard from "./pages/ArbiterDashboard.tsx";
import ArbiterDisputes from "./pages/ArbiterDisputes.tsx";
import ArbiterEscrows from "./pages/ArbiterEscrows.tsx";
import Settings from "./pages/Settings.tsx";
import "./types/global.d.ts";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);
const queryClient = new QueryClient();

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VlyToolbar />
    <InstrumentationProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <ConvexAuthProvider client={convex}>
              <BrowserRouter>
                <RouteSyncer />
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<AuthPage redirectAfterAuth="/dashboard" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/escrows" element={<Escrows />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/contracts/:contractId" element={<ContractDetail />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/arbiter/dashboard" element={<ArbiterDashboard />} />
                  <Route path="/arbiter/disputes" element={<ArbiterDisputes />} />
                  <Route path="/arbiter/escrows" element={<ArbiterEscrows />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
              <Toaster />
            </ConvexAuthProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </InstrumentationProvider>
  </StrictMode>,
);