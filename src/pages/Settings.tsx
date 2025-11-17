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
              <img src="https://harmless-tapir-303.convex.cloud/api/storage/4fa9fa7a-0288-4db5-8094-46ed7097320f" alt="Bond" width={48} height={48} className="rounded-lg bg-white p-1" />
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
      <div className="flex-1 p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            <p className="text-muted-foreground mt-1">Manage your profile information</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Profile Information</CardTitle>
                <CardDescription className="text-sm">
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted h-9"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-sm">Role</Label>
                  <Input
                    id="role"
                    value={profile.role}
                    disabled
                    className="bg-muted capitalize h-9"
                  />
                  <p className="text-xs text-muted-foreground">
                    Role cannot be changed
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="age" className="text-sm">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    min="0"
                    max="150"
                    className="h-9"
                  />
                </div>

                {(isClient || isFreelancer) && (
                  <div className="space-y-1.5">
                    <Label htmlFor="company" className="text-sm">
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
                      className="h-9"
                    />
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} disabled={isSaving} size="sm">
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
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
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Account Actions</CardTitle>
                <CardDescription className="text-sm">
                  Manage your account settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  size="sm"
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}