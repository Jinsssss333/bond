import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LayoutDashboard, Briefcase, Lock, Receipt, FileText, AlertCircle } from "lucide-react";
import { LogoDropdown } from "@/components/LogoDropdown";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export default function Escrows() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const escrows = useQuery(api.escrows.list);
  const contracts = useQuery(api.contracts.list);
  const createEscrow = useMutation(api.escrows.create);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Get contracts without escrows
  const contractsWithoutEscrows = contracts?.filter((contract) => {
    return !escrows?.some((escrow) => escrow.contractId === contract._id);
  }) || [];

  const handleCreateEscrow = () => {
    if (contractsWithoutEscrows.length === 0) {
      toast.error("No projects available without escrows. Please create a project first.");
      return;
    }
    setShowCreateDialog(true);
  };

  const handleSubmitEscrow = async () => {
    try {
      setIsCreating(true);

      if (!selectedContractId) {
        toast.error("Please select a project");
        setIsCreating(false);
        return;
      }

      const selectedContract = contracts?.find((c) => c._id === selectedContractId);
      if (!selectedContract) {
        toast.error("Selected project not found");
        setIsCreating(false);
        return;
      }

      await createEscrow({
        contractId: selectedContractId as Id<"contracts">,
        amount: selectedContract.totalAmount,
        currency: selectedContract.currency,
      });

      toast.success("Escrow created successfully!");
      setShowCreateDialog(false);
      setSelectedContractId("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create escrow");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "funded":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "released":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "disputed":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getContractTitle = (contractId: string) => {
    const contract = contracts?.find((c) => c._id === contractId);
    return contract?.title || "Unknown Project";
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Bond" width={32} height={32} className="rounded-lg" />
            <span className="text-2xl font-bold tracking-tight text-primary">BOND</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => navigate("/dashboard")}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => navigate("/projects")}
          >
            <Briefcase className="h-5 w-5" />
            Projects
          </Button>
          <Button
            variant="default"
            className="w-full justify-start gap-3"
            onClick={() => navigate("/escrows")}
          >
            <Lock className="h-5 w-5" />
            Escrows
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => navigate("/transactions")}
          >
            <Receipt className="h-5 w-5" />
            Transactions
          </Button>
        </nav>

        <div className="p-4 border-t space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3">
            <FileText className="h-5 w-5" />
            Developer
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3">
            <AlertCircle className="h-5 w-5" />
            Help & Support
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="px-8 py-4 flex items-center justify-between">
            <h1 className="text-sm text-muted-foreground">Bond - Guaranteed Payments</h1>
            <div className="flex items-center gap-4">
              <LogoDropdown />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">All Escrows</h2>
              <Button onClick={handleCreateEscrow}>
                Create Escrow
              </Button>
            </div>

            {/* Create Escrow Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Escrow</DialogTitle>
                  <DialogDescription>
                    Select a project to create an escrow for. Only projects without existing escrows are shown.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="project">Select Project</Label>
                    <Select value={selectedContractId} onValueChange={setSelectedContractId}>
                      <SelectTrigger id="project">
                        <SelectValue placeholder="Choose a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {contractsWithoutEscrows.map((contract) => (
                          <SelectItem key={contract._id} value={contract._id}>
                            {contract.title} - ${contract.totalAmount.toLocaleString()} {contract.currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {contractsWithoutEscrows.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No projects available. All projects already have escrows.
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={isCreating}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitEscrow} disabled={isCreating || !selectedContractId}>
                    {isCreating ? "Creating..." : "Create Escrow"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Escrows Table */}
            {!escrows || escrows.length === 0 ? (
              <div className="border-2 rounded-lg p-12 text-center">
                <Lock className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground">No escrows yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="border-2 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium">Escrow ID</th>
                      <th className="text-left p-4 font-medium">Project</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Total Amount</th>
                      <th className="text-left p-4 font-medium">Amount Released</th>
                      <th className="text-left p-4 font-medium">Last Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {escrows.map((escrow) => (
                      <tr
                        key={escrow._id}
                        className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => navigate(`/contracts/${escrow.contractId}`)}
                      >
                        <td className="p-4">
                          <span className="text-primary font-mono text-sm">{escrow.escrowId}</span>
                        </td>
                        <td className="p-4 font-medium">{getContractTitle(escrow.contractId)}</td>
                        <td className="p-4">
                          <Badge className={getStatusColor(escrow.status)}>
                            {escrow.status === "funded" ? "Partially Released" : escrow.status}
                          </Badge>
                        </td>
                        <td className="p-4 font-semibold">
                          {escrow.amount.toLocaleString()} {escrow.currency}
                        </td>
                        <td className="p-4 font-semibold text-green-600">
                          {escrow.status === "released" ? escrow.amount.toLocaleString() : "0"} {escrow.currency}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(escrow._creationTime).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
