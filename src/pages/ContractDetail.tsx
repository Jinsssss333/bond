import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, CheckCircle, XCircle, Clock, DollarSign, Upload, FileText, AlertTriangle, Wallet } from "lucide-react";
import { LogoDropdown } from "@/components/LogoDropdown";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { getUSDCAddress, usdcAbi } from "@/lib/contracts";

export default function ContractDetail() {
  const { contractId } = useParams<{ contractId: string }>();
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  // Web3 hooks
  const { address, isConnected, chain } = useAccount();
  const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  
  const contract = useQuery(
    api.contracts.get,
    contractId ? { contractId: contractId as Id<"contracts"> } : "skip"
  );
  const milestones = useQuery(
    api.milestones.listByContract,
    contractId ? { contractId: contractId as Id<"contracts"> } : "skip"
  );

  const fundContract = useMutation(api.contracts.fundContract);
  const createMilestone = useMutation(api.milestones.create);
  const submitDeliverable = useMutation(api.milestones.submitDeliverable);
  const approveMilestone = useMutation(api.milestones.approve);
  const rejectMilestone = useMutation(api.milestones.reject);
  const acceptContract = useMutation(api.contracts.acceptContract);
  const createDispute = useMutation(api.disputes.create);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [fundAmount, setFundAmount] = useState("");
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [showCryptoFundDialog, setShowCryptoFundDialog] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Id<"milestones"> | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    amount: "",
  });

  const [submitData, setSubmitData] = useState({
    title: "",
    description: "",
  });

  const [rejectionReason, setRejectionReason] = useState("");
  const [disputeData, setDisputeData] = useState({
    reason: "",
    evidence: "",
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Handle successful blockchain transaction
  useEffect(() => {
    if (isConfirmed && hash && fundAmount && contract) {
      const amount = parseFloat(fundAmount);
      fundContract({
        contractId: contract._id,
        amount,
      }).then(() => {
        toast.success("Contract funded successfully via blockchain!");
        setFundAmount("");
        setShowCryptoFundDialog(false);
      }).catch((error) => {
        toast.error("Failed to record blockchain transaction");
      });
    }
  }, [isConfirmed, hash, fundAmount, contract]);

  if (isLoading || !user || !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const isClient = contract.clientId === user._id;
  const isFreelancer = contract.freelancerId === user._id;
  const isPending = contract.status === "pending_acceptance";
  const fundingProgress = (contract.currentAmount / contract.totalAmount) * 100;

  const handleAcceptContract = async () => {
    try {
      await acceptContract({ contractId: contract._id });
      toast.success("Project invitation accepted!");
    } catch (error) {
      toast.error("Failed to accept invitation");
    }
  };

  const handleCryptoFund = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!chain) {
      toast.error("Please connect to a supported network");
      return;
    }

    try {
      const usdcAddress = getUSDCAddress(chain.id);
      const amountInWei = parseUnits(fundAmount, 6); // USDC has 6 decimals

      // For demo purposes, we'll use the contract address as the escrow address
      // In production, you'd have a dedicated escrow smart contract
      const escrowAddress = contract.escrowWalletAddress || address;

      toast.info("Please confirm the transaction in your wallet...");

      writeContract({
        address: usdcAddress,
        abi: usdcAbi,
        functionName: "transfer",
        args: [escrowAddress as `0x${string}`, amountInWei],
      });
    } catch (error) {
      console.error("Crypto funding error:", error);
      toast.error("Failed to initiate blockchain transaction");
    }
  };

  const handleFund = async () => {
    try {
      const amount = parseFloat(fundAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      await fundContract({
        contractId: contract._id,
        amount,
      });

      toast.success("Contract funded successfully");
      setFundAmount("");
    } catch (error) {
      toast.error("Failed to fund contract");
    }
  };

  const handleCreateMilestone = async () => {
    try {
      const amount = parseFloat(newMilestone.amount);
      if (!newMilestone.title || !newMilestone.description || isNaN(amount)) {
        toast.error("Please fill all fields");
        return;
      }

      await createMilestone({
        contractId: contract._id,
        title: newMilestone.title,
        description: newMilestone.description,
        amount,
      });

      toast.success("Milestone created successfully");
      setShowMilestoneDialog(false);
      setNewMilestone({ title: "", description: "", amount: "" });
    } catch (error) {
      toast.error("Failed to create milestone");
    }
  };

  const handleFileUpload = async (milestoneId: Id<"milestones">) => {
    if (!uploadedFile || !submitData.title || !submitData.description) {
      toast.error("Please fill all fields and upload a file");
      return;
    }

    try {
      setIsUploading(true);
      
      const uploadUrl = await generateUploadUrl();
      
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": uploadedFile.type },
        body: uploadedFile,
      });

      const { storageId } = await result.json();

      await submitDeliverable({
        milestoneId,
        title: submitData.title,
        description: submitData.description,
        fileStorageId: storageId,
      });

      toast.success("Deliverable submitted successfully");
      setShowSubmitDialog(false);
      setUploadedFile(null);
      setSubmitData({ title: "", description: "" });
      setSelectedMilestone(null);
    } catch (error) {
      toast.error("Failed to submit deliverable");
    } finally {
      setIsUploading(false);
    }
  };

  const handleApproveMilestone = async (milestoneId: Id<"milestones">) => {
    try {
      await approveMilestone({ milestoneId });
      toast.success("Milestone approved");
    } catch (error) {
      toast.error("Failed to approve milestone");
    }
  };

  const handleRejectMilestone = async () => {
    if (!selectedMilestone || !rejectionReason) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      await rejectMilestone({
        milestoneId: selectedMilestone,
        rejectionReason,
      });
      toast.success("Milestone rejected. Freelancer can resubmit.");
      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedMilestone(null);
    } catch (error) {
      toast.error("Failed to reject milestone");
    }
  };

  const handleRaiseDispute = async () => {
    if (!disputeData.reason) {
      toast.error("Please provide a reason for the dispute");
      return;
    }

    try {
      await createDispute({
        contractId: contract._id,
        milestoneId: selectedMilestone || undefined,
        reason: disputeData.reason,
        evidence: disputeData.evidence || undefined,
      });
      toast.success("Dispute raised successfully. An arbiter will review it.");
      setShowDisputeDialog(false);
      setDisputeData({ reason: "", evidence: "" });
      setSelectedMilestone(null);
    } catch (error) {
      toast.error("Failed to raise dispute");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LogoDropdown />
            <h1 className="text-2xl font-bold tracking-tight">Bond</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{contract.title}</h2>
              <p className="text-muted-foreground mt-2">{contract.description}</p>
            </div>
            <div className="flex gap-2">
              <Badge
                variant={
                  contract.status === "active"
                    ? "default"
                    : contract.status === "completed"
                    ? "secondary"
                    : "outline"
                }
              >
                {contract.status}
              </Badge>
            </div>
          </div>

          {isPending && isFreelancer && (
            <Card className="border-2 border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle>Project Invitation</CardTitle>
                <CardDescription>
                  You've been invited to work on this project. Review the details and accept to get started.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleAcceptContract} size="lg">
                  Accept Project Invitation
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Contract Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-semibold">
                    ${contract.totalAmount.toLocaleString()} {contract.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Funded Amount</span>
                  <span className="font-semibold">
                    ${contract.currentAmount.toLocaleString()} {contract.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Released Amount</span>
                  <span className="font-semibold text-green-600">
                    ${(milestones?.filter(m => m.status === "approved" || m.status === "paid").reduce((sum, m) => sum + m.amount, 0) || 0).toLocaleString()} {contract.currency}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Funding Progress</span>
                    <span className="font-medium">{fundingProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={fundingProgress} />
                </div>
                <Badge variant="outline">{contract.fundingStatus}</Badge>
              </CardContent>
            </Card>

            {isClient && contract.fundingStatus !== "fully_funded" && (
              <Card>
                <CardHeader>
                  <CardTitle>Fund Contract</CardTitle>
                  <CardDescription>Add funds to the escrow</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                    />
                    <Button onClick={handleFund}>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Fund
                    </Button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowCryptoFundDialog(true)}
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Fund with USDC (Crypto)
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Remaining: ${(contract.totalAmount - contract.currentAmount).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Milestones</CardTitle>
                  <CardDescription>Track deliverables and payments</CardDescription>
                </div>
                {isClient && (
                  <Dialog open={showMilestoneDialog} onOpenChange={setShowMilestoneDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Milestone
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Milestone</DialogTitle>
                        <DialogDescription>
                          Add a new milestone to this contract
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Title</label>
                          <Input
                            value={newMilestone.title}
                            onChange={(e) =>
                              setNewMilestone({ ...newMilestone, title: e.target.value })
                            }
                            placeholder="Milestone title"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={newMilestone.description}
                            onChange={(e) =>
                              setNewMilestone({ ...newMilestone, description: e.target.value })
                            }
                            placeholder="Describe the deliverable"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Amount</label>
                          <Input
                            type="number"
                            value={newMilestone.amount}
                            onChange={(e) =>
                              setNewMilestone({ ...newMilestone, amount: e.target.value })
                            }
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowMilestoneDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateMilestone}>Create</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!milestones || milestones.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No milestones yet. {isClient ? "Create one to get started!" : "Waiting for client to add milestones."}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {milestones.map((milestone) => (
                    <div
                      key={milestone._id}
                      className="p-4 border rounded-lg space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{milestone.title}</h4>
                            <Badge variant="outline">{milestone.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {milestone.description}
                          </p>
                          {milestone.revisionNotes && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                              <p className="text-sm font-medium text-yellow-800">Revision Requested:</p>
                              <p className="text-sm text-yellow-700">{milestone.revisionNotes}</p>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            ${milestone.amount.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {isFreelancer && (milestone.status === "pending" || milestone.status === "revision_requested") && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedMilestone(milestone._id);
                              setShowSubmitDialog(true);
                            }}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Submit Work
                          </Button>
                        </div>
                      )}

                      {isClient && milestone.status === "submitted" && (
                        <div className="space-y-2">
                          {milestone.deliverableUrl && (
                            <div className="p-2 bg-muted rounded">
                              <a
                                href={milestone.deliverableUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center gap-2"
                              >
                                <FileText className="h-4 w-4" />
                                View Submitted File
                              </a>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveMilestone(milestone._id)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedMilestone(milestone._id);
                                setShowRejectDialog(true);
                              }}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}

                      {(isClient || isFreelancer) && milestone.status !== "approved" && milestone.status !== "paid" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedMilestone(milestone._id);
                            setShowDisputeDialog(true);
                          }}
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Raise Dispute
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Crypto Funding Dialog */}
        <Dialog open={showCryptoFundDialog} onOpenChange={setShowCryptoFundDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Fund with USDC</DialogTitle>
              <DialogDescription>
                Use your connected wallet to fund this contract with USDC stablecoins
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {!isConnected ? (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">Please connect your wallet to continue</p>
                  <p className="text-sm text-muted-foreground">Use the wallet button in the header to connect</p>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Connected Wallet:</span>
                      <span className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Network:</span>
                      <span>{chain?.name || "Unknown"}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Amount (USDC)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                    />
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> This will transfer USDC from your wallet to the escrow. The transaction will be recorded on the blockchain.
                    </p>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCryptoFundDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCryptoFund} 
                disabled={!isConnected || isWritePending || isConfirming}
              >
                {isWritePending ? "Waiting for approval..." : isConfirming ? "Confirming..." : "Fund with USDC"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Submit Deliverable Dialog */}
        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Deliverable</DialogTitle>
              <DialogDescription>
                Upload your work for this milestone
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={submitData.title}
                  onChange={(e) => setSubmitData({ ...submitData, title: e.target.value })}
                  placeholder="Deliverable title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={submitData.description}
                  onChange={(e) => setSubmitData({ ...submitData, description: e.target.value })}
                  placeholder="Describe what you've completed"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Upload File</label>
                <Input
                  type="file"
                  onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => selectedMilestone && handleFileUpload(selectedMilestone)}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Submit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Milestone</DialogTitle>
              <DialogDescription>
                Provide a reason for rejection so the freelancer can improve
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain what needs to be improved..."
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRejectMilestone}>
                Reject & Request Revision
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dispute Dialog */}
        <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Raise Dispute</DialogTitle>
              <DialogDescription>
                An arbiter will review your dispute and help resolve the issue
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Reason</label>
                <Textarea
                  value={disputeData.reason}
                  onChange={(e) => setDisputeData({ ...disputeData, reason: e.target.value })}
                  placeholder="Explain the issue..."
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Evidence (Optional)</label>
                <Textarea
                  value={disputeData.evidence}
                  onChange={(e) => setDisputeData({ ...disputeData, evidence: e.target.value })}
                  placeholder="Provide any supporting evidence..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDisputeDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRaiseDispute}>
                Raise Dispute
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}