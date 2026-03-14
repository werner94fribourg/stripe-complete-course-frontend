"use client";

import { useEffect, useState, useRef } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/app/lib/stripe";
import { api } from "@/app/lib/api";
import { useCart } from "@/app/contexts/CartContext";
import { useAuth } from "@/app/contexts/AuthContext";
import { PaymentMethodSummary } from "@/app/lib/types";
import { CheckoutForm } from "@/app/components/checkout/CheckoutForm";
import { OrderSummary } from "@/app/components/checkout/OrderSummary";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { Alert } from "@/app/components/ui/Alert";
import { Button } from "@/app/components/ui/Button";
import { PaymentMethodSelector } from "@/app/components/payment-methods";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const paymentIntentCreated = useRef(false);

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodSummary[]>(
    []
  );
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<
    string | null
  >(null);

  const { items, totalItems, clearCart } = useCart();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Fetch payment methods
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) return;

    const fetchPaymentMethods = async () => {
      try {
        const methods = await api.getPaymentMethods();
        setPaymentMethods(methods);
        // Auto-select default if exists
        const defaultMethod = methods.find((m) => m.isDefault);
        if (defaultMethod) {
          setSelectedPaymentMethodId(defaultMethod.id);
        }
      } catch (err) {
        console.error("Failed to fetch payment methods:", err);
      } finally {
        setPaymentMethodsLoading(false);
      }
    };

    fetchPaymentMethods();
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Redirect if cart is empty
    if (totalItems === 0) {
      router.push("/cart");
      return;
    }

    // Wait for payment methods to load
    if (paymentMethodsLoading) return;

    // If user has saved payment methods, don't auto-create payment intent
    // They will select a payment method first
    if (paymentMethods.length > 0) {
      setIsLoading(false);
      return;
    }

    // No saved payment methods, create payment intent for new method flow
    if (paymentIntentCreated.current) return;
    paymentIntentCreated.current = true;

    const createPaymentIntent = async () => {
      try {
        const orderItems = items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        }));

        const { clientSecret } = await api.createPaymentIntent({
          userId: user!.id,
          items: orderItems,
        });

        setClientSecret(clientSecret);
      } catch (err) {
        paymentIntentCreated.current = false;
        setError(
          err instanceof Error ? err.message : "Failed to create payment"
        );
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [
    items,
    user,
    isAuthenticated,
    authLoading,
    totalItems,
    router,
    paymentMethodsLoading,
    paymentMethods.length,
  ]);

  const handlePayWithSavedMethod = async () => {
    if (!selectedPaymentMethodId || !user) return;

    setIsProcessing(true);
    setError("");

    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const result = await api.createPaymentIntentWithMethod({
        userId: user.id,
        items: orderItems,
        paymentMethodId: selectedPaymentMethodId,
      });

      if (result.status === "succeeded") {
        // Payment completed successfully
        clearCart();
        router.push("/checkout/success");
        return;
      }

      if (result.requiresAction && result.clientSecret) {
        // Needs 3D Secure - show payment element for authentication
        setClientSecret(result.clientSecret);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Payment failed. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedWithNewMethod = async () => {
    if (paymentIntentCreated.current) return;
    paymentIntentCreated.current = true;

    setIsLoading(true);
    setError("");

    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const { clientSecret } = await api.createPaymentIntent({
        userId: user!.id,
        items: orderItems,
      });

      setClientSecret(clientSecret);
    } catch (err) {
      paymentIntentCreated.current = false;
      setError(
        err instanceof Error ? err.message : "Failed to create payment"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading || paymentMethodsLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        Checkout
      </h1>

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Payment Details
          </h2>

          {/* Show payment method selector if user has saved methods and no clientSecret yet */}
          {paymentMethods.length > 0 && !clientSecret && (
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Payment Method
              </h3>
              <PaymentMethodSelector
                paymentMethods={paymentMethods}
                selectedId={selectedPaymentMethodId}
                onSelect={setSelectedPaymentMethodId}
              />

              <div className="mt-6">
                {selectedPaymentMethodId ? (
                  <Button
                    onClick={handlePayWithSavedMethod}
                    isLoading={isProcessing}
                    className="w-full"
                  >
                    Pay Now
                  </Button>
                ) : (
                  <Button
                    onClick={handleProceedWithNewMethod}
                    isLoading={isLoading}
                    className="w-full"
                  >
                    Continue with New Payment Method
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Show Stripe Elements when:
              1. No saved payment methods (new method flow)
              2. User selected "new payment method"
              3. Saved method requires 3DS authentication
          */}
          {clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                },
              }}
            >
              <CheckoutForm />
            </Elements>
          )}

          {/* No payment methods and no clientSecret - show loading state */}
          {paymentMethods.length === 0 && !clientSecret && !error && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          )}
        </div>
        <div>
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
