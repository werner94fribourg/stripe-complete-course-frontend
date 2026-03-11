"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/app/contexts/CartContext";
import { Button } from "@/app/components/ui/Button";

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();

  // Clear cart on mount (in case redirect happened before clearing)
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <div className="mb-8">
        <svg
          className="mx-auto h-16 w-16 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Payment Successful!
      </h1>

      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        Thank you for your purchase. Your order has been confirmed and will be
        processed shortly.
      </p>

      <Link href="/">
        <Button>Continue Shopping</Button>
      </Link>
    </div>
  );
}
