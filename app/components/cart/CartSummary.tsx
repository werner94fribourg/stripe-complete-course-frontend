"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/contexts/CartContext";
import { useAuth } from "@/app/contexts/AuthContext";
import { Button } from "@/app/components/ui/Button";
import { Alert } from "@/app/components/ui/Alert";
import { api } from "@/app/lib/api";
import { PaymentMethod } from "@/app/lib/types";

export function CartSummary() {
  const { items, totalItems, totalPrice } = useCart();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("stripe-elements");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const formattedTotal = (totalPrice / 100).toFixed(2);

  if (totalItems === 0) {
    return null;
  }

  const handleCheckout = async () => {
    if (!isAuthenticated || !user) {
      router.push("/auth/login");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (paymentMethod === "stripe-checkout") {
        // Create checkout session and redirect to Stripe
        const orderItems = items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        }));

        const { url } = await api.createCheckoutSession({
          userId: user.id,
          items: orderItems,
        });

        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        // Navigate to Stripe Elements checkout page
        router.push("/checkout");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Order Summary
      </h3>

      <div className="flex justify-between mb-4">
        <span className="text-gray-600 dark:text-gray-400">
          Subtotal ({totalItems} items)
        </span>
        <span className="font-medium text-gray-900 dark:text-white">
          ${formattedTotal}
        </span>
      </div>

      {/* Payment Method Select */}
      <div className="mb-4">
        <label
          htmlFor="payment-method"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Payment Method
        </label>
        <select
          id="payment-method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="stripe-elements">Stripe Elements</option>
          <option value="stripe-checkout">Stripe Checkout</option>
        </select>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {paymentMethod === "stripe-elements"
            ? "Pay with embedded payment form"
            : "Redirect to Stripe hosted checkout page"}
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {!isAuthenticated && (
        <Alert variant="warning" className="mb-4">
          Please{" "}
          <Link href="/auth/login" className="underline">
            login
          </Link>{" "}
          to checkout
        </Alert>
      )}

      <Button
        className="w-full"
        onClick={handleCheckout}
        disabled={isLoading}
        isLoading={isLoading}
      >
        {isLoading ? "Processing..." : "Proceed to Checkout"}
      </Button>
    </div>
  );
}
