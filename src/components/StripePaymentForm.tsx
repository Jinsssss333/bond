import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

interface PaymentFormProps {
  contractId: Id<"contracts">;
  amount: number;
  currency: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({ contractId, amount, currency, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/contracts/${contractId}`,
        },
        redirect: "if_required",
      });

      if (result.error) {
        toast.error(result.error.message || "Payment failed");
      } else {
        toast.success("Payment successful! Contract funded.");
        onSuccess();
      }
    } catch (error) {
      toast.error("Payment processing failed");
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
        </Button>
      </div>
    </form>
  );
}

export function StripePaymentForm(props: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const createPaymentIntent = useAction(api.stripe.createPaymentIntent);

  const initializePayment = async () => {
    setIsLoading(true);
    try {
      const result = await createPaymentIntent({
        contractId: props.contractId,
        amount: props.amount,
        currency: props.currency,
      });
      setClientSecret(result.clientSecret);
    } catch (error) {
      toast.error("Failed to initialize payment");
      console.error("Payment initialization error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Pay securely with credit or debit card via Stripe
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={props.onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={initializePayment}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Loading..." : "Continue to Payment"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
        },
      }}
    >
      <CheckoutForm {...props} />
    </Elements>
  );
}
