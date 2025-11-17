import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LayoutDashboard, Briefcase, Lock, Receipt, FileText, AlertCircle, Settings as SettingsIcon, Shield, Scale, LogOut, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { useAuthActions } from "@convex-dev/auth/react";
import { PolkadotWalletConnect } from "@/components/PolkadotWalletConnect";
import { getPolkadotIdentity } from "@/lib/polkadot";

export default function Settings() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { signOut } = useAuthActions();
  const profile = useQuery(api.settings.getProfile);
  const updateProfile = useMutation(api.settings.updateProfile);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    company: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const [polkadotAddress, setPolkadotAddress] = useState("");
  const [polkadotIdentity, setPolkadotIdentity] = useState<any>(null);
  const linkPolkadot = useMutation(api.polkadot.linkPolkadotAddress);
  const unlinkPolkadot = useMutation(api.polkadot.unlinkPolkadotAddress);
  const polkadotInfo = useQuery(api.polkadot.getPolkadotInfo);

  const handleLinkPolkadot = async (address: string) => {
    try {
      const identity = await getPolkadotIdentity(address);
      await linkPolkadot({
        polkadotAddress: address,
        identity: identity || undefined,
      });
      toast.success("Polkadot address linked successfully!");
    } catch (error) {
      toast.error("Failed to link Polkadot address");
    }
  };

  const handleUnlinkPolkadot = async () => {
    try {
      await unlinkPolkadot({});
      toast.success("Polkadot address unlinked");
    } catch (error) {
      toast.error("Failed to unlink Polkadot address");
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        age: profile.age ? profile.age.toString() : "",
        company: profile.company || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const age = formData.age ? parseInt(formData.age) : undefined;
      if (formData.age && (isNaN(age!) || age! < 0 || age! > 150)) {
        toast.error("Please enter a valid age");
        setIsSaving(false);
        return;
      }

      await updateProfile({
        name: formData.name || undefined,
        age: age,
        company: formData.company || undefined,
      });

      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const isArbiter = user.role === "arbiter";
  const isFreelancer = user.role === "freelancer";
  const isClient = user.role === "client";

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
              <img src="/logo.svg" alt="Bond" width={32} height={32} className="rounded-lg" />
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
            onClick={() => navigate(isArbiter ? "/arbiter/dashboard" : "/dashboard")}
          >
            <LayoutDashboard className="h-5 w-5" />
            {sidebarOpen && "Dashboard"}
          </Button>
          {!isArbiter && (
            <>
              <Button
                variant="ghost"
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
            </>
          )}
          {isArbiter && (
            <>
              <Button
                variant="ghost"
                className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'} gap-3`}
                onClick={() => navigate("/arbiter/disputes")}
              >
                <Shield className="h-5 w-5" />
                {sidebarOpen && "Disputes"}
              </Button>
              <Button
                variant="ghost"
                className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center'} gap-3`}
                onClick={() => navigate("/arbiter/escrows")}
              >
                <Scale className="h-5 w-5" />
                {sidebarOpen && "All Escrows"}
              </Button>
            </>
          )}
        </nav>

        <div className="p-3 space-y-1">
          <Button
            variant="default"
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
        <header className="bg-card/50 backdrop-blur-sm shadow-sm">
          <div className="px-8 py-4 flex items-center justify-between">
            <h1 className="text-sm font-medium text-muted-foreground">Bond - Guaranteed Payments</h1>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl space-y-6"
          >
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
              <p className="text-muted-foreground mt-2">Manage your profile information</p>
            </div>

            <Card className="border shadow-md">
              <CardHeader className="pb-4">
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={profile.role}
                    disabled
                    className="bg-muted capitalize"
                  />
                  <p className="text-xs text-muted-foreground">
                    Role cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    min="0"
                    max="150"
                  />
                </div>

                {(isClient || isFreelancer) && (
                  <div className="space-y-2">
                    <Label htmlFor="company">
                      {isClient ? "Company" : "Job Title / Specialization"}
                    </Label>
                    <Input
                      id="company"
                      placeholder={
                        isClient
                          ? "Enter your company name"
                          : "e.g., Full Stack Developer, UI/UX Designer"
                      }
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (profile) {
                        setFormData({
                          name: profile.name || "",
                          age: profile.age ? profile.age.toString() : "",
                          company: profile.company || "",
                        });
                      }
                    }}
                    disabled={isSaving}
                  >
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-md">
              <CardHeader className="pb-4">
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>
                  Manage your account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      await signOut();
                      navigate("/");
                      toast.success("Signed out successfully");
                    } catch (error) {
                      toast.error("Failed to sign out");
                    }
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}