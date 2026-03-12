"use client";

import { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/app/lib/stripe";
import { api } from "@/app/lib/api";
import { useCart } from "@/app/contexts/CartContext";
import { useAuth } from "@/app/contexts/AuthContext";
import { CheckoutForm } from "@/app/components/checkout/CheckoutForm";
import { OrderSummary } from "@/app/components/checkout/OrderSummary";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { Alert } from "@/app/components/ui/Alert";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const { items, totalItems } = useCart();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

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
        setError(
          err instanceof Error ? err.message : "Failed to create payment",
        );
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [items, user, isAuthenticated, authLoading, totalItems, router]);

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Payment Details
          </h2>
          {/** NOTE: Use of the Elements provider from stripe react library */}
          {/** NOTE: Elements component create a Stripe Elements context. */}
          {/** NOTE: Procedure:
           *    1. A payment intent is created in the backend by calling the create Payment intent route. It returns a client secret if successful
           *    2. Elements provider connects to Stripe server using the public key and uses the client secret to fetch payment intent informations (amount, currency, allowed payment methods, ...)
           *    3. Elements create the secure context with the retrieving payment information and the associated merchant
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
        </div>
        <div>
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
