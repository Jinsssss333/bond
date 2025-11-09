import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Mail, Briefcase, Users, Scale } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface AuthProps {
  redirectAfterAuth?: string;
}

type Role = "client" | "freelancer" | "arbiter";

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"signIn" | "signUp" | "role" | { email: string }>("signIn");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setRole = useMutation(api.users.setRole);
  const allUsers = useQuery(api.users.currentUser);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const redirect = redirectAfterAuth || "/dashboard";
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirectAfterAuth]);

  const handleSignInSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      const emailValue = formData.get("email") as string;
      setEmail(emailValue);
      
      // Send OTP code
      await signIn("email-otp", formData);
      setStep({ email: emailValue });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleSignUpClick = () => {
    setStep("role");
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setStep("signUp");
  };

  const handleSignUpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      const emailValue = formData.get("email") as string;
      setEmail(emailValue);
      await signIn("email-otp", formData);
      setStep({ email: emailValue });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-up error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);

      // Wait a moment for auth to complete, then set role if signing up
      if (selectedRole) {
        await new Promise(resolve => setTimeout(resolve, 500));
        try {
          await setRole({ role: selectedRole });
          toast.success(`Welcome! You're signed in as a ${selectedRole}.`);
        } catch (roleError) {
          console.error("Failed to set role:", roleError);
          toast.error("Authentication successful, but failed to set role. Please contact support.");
        }
      }

      const redirect = redirectAfterAuth || "/dashboard";
      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center justify-center h-full flex-col">
          <Card className="min-w-[350px] pb-0 border shadow-md">
            {step === "signIn" ? (
              <>
                <CardHeader className="text-center">
                  <div className="flex justify-center">
                    <img
                      src="./logo.svg"
                      alt="Lock Icon"
                      width={64}
                      height={64}
                      className="rounded-lg mb-4 mt-4 cursor-pointer"
                      onClick={() => navigate("/")}
                    />
                  </div>
                  <CardTitle className="text-xl">Sign In</CardTitle>
                  <CardDescription>
                    Enter your email to continue
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSignInSubmit}>
                  <CardContent>
                    <div className="relative flex items-center gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          name="email"
                          placeholder="name@example.com"
                          type="email"
                          className="pl-9"
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        variant="outline"
                        size="icon"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {error && (
                      <p className="mt-2 text-sm text-red-500">{error}</p>
                    )}
                    
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                      Don't have an account?{" "}
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto"
                        onClick={handleSignUpClick}
                        disabled={isLoading}
                      >
                        Sign up
                      </Button>
                    </div>
                  </CardContent>
                </form>
              </>
            ) : step === "role" ? (
              <>
                <CardHeader className="text-center">
                  <div className="flex justify-center">
                    <img
                      src="./logo.svg"
                      alt="Lock Icon"
                      width={64}
                      height={64}
                      className="rounded-lg mb-4 mt-4 cursor-pointer"
                      onClick={() => navigate("/")}
                    />
                  </div>
                  <CardTitle className="text-xl">Select Your Role</CardTitle>
                  <CardDescription>
                    Choose how you'll be using Bond
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full h-auto py-4 flex flex-col items-start gap-2"
                    onClick={() => handleRoleSelect("client")}
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      <span className="font-semibold">Client</span>
                    </div>
                    <span className="text-xs text-muted-foreground text-left">
                      I want to hire freelancers and manage projects
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full h-auto py-4 flex flex-col items-start gap-2"
                    onClick={() => handleRoleSelect("freelancer")}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      <span className="font-semibold">Freelancer</span>
                    </div>
                    <span className="text-xs text-muted-foreground text-left">
                      I want to work on projects and receive payments
                    </span>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full h-auto py-4 flex flex-col items-start gap-2"
                    onClick={() => handleRoleSelect("arbiter")}
                  >
                    <div className="flex items-center gap-2">
                      <Scale className="h-5 w-5" />
                      <span className="font-semibold">Arbiter</span>
                    </div>
                    <span className="text-xs text-muted-foreground text-left">
                      I want to resolve disputes between parties
                    </span>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full mt-4"
                    onClick={() => setStep("signIn")}
                  >
                    Back to Sign In
                  </Button>
                </CardContent>
              </>
            ) : step === "signUp" && selectedRole ? (
              <>
                <CardHeader className="text-center">
                  <div className="flex justify-center">
                    <img
                      src="./logo.svg"
                      alt="Lock Icon"
                      width={64}
                      height={64}
                      className="rounded-lg mb-4 mt-4 cursor-pointer"
                      onClick={() => navigate("/")}
                    />
                  </div>
                  <CardTitle className="text-xl">Sign Up as {selectedRole}</CardTitle>
                  <CardDescription>
                    Enter your email to create an account
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSignUpSubmit}>
                  <CardContent>
                    <div className="relative flex items-center gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          name="email"
                          placeholder="name@example.com"
                          type="email"
                          className="pl-9"
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        variant="outline"
                        size="icon"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {error && (
                      <p className="mt-2 text-sm text-red-500">{error}</p>
                    )}
                    
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full mt-4"
                      onClick={() => setStep("role")}
                      disabled={isLoading}
                    >
                      Change Role
                    </Button>
                  </CardContent>
                </form>
              </>
            ) : (
              <>
                <CardHeader className="text-center mt-4">
                  <CardTitle>Check your email</CardTitle>
                  <CardDescription>
                    We've sent a code to {typeof step === "object" && step.email ? step.email : email}
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleOtpSubmit}>
                  <CardContent className="pb-4">
                    <input type="hidden" name="email" value={typeof step === "object" && step.email ? step.email : email} />
                    <input type="hidden" name="code" value={otp} />

                    <div className="flex justify-center">
                      <InputOTP
                        value={otp}
                        onChange={setOtp}
                        maxLength={6}
                        disabled={isLoading}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                            const form = (e.target as HTMLElement).closest("form");
                            if (form) {
                              form.requestSubmit();
                            }
                          }
                        }}
                      >
                        <InputOTPGroup>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <InputOTPSlot key={index} index={index} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    {error && (
                      <p className="mt-2 text-sm text-red-500 text-center">
                        {error}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground text-center mt-4">
                      Didn't receive a code?{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => setStep("signIn")}
                      >
                        Try again
                      </Button>
                    </p>
                  </CardContent>
                  <CardFooter className="flex-col gap-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify code
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep("signIn")}
                      disabled={isLoading}
                      className="w-full"
                    >
                      Use different email
                    </Button>
                  </CardFooter>
                </form>
              </>
            )}

            <div className="py-4 px-6 text-xs text-center text-muted-foreground bg-muted border-t rounded-b-lg">
              Secured by{" "}
              <a
                href="https://vly.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary transition-colors"
              >
                vly.ai
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}