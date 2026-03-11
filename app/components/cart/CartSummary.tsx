"use client";

import Link from "next/link";
import { useCart } from "@/app/contexts/CartContext";
import { useAuth } from "@/app/contexts/AuthContext";
import { Button } from "@/app/components/ui/Button";
import { Alert } from "@/app/components/ui/Alert";

export function CartSummary() {
  const { totalItems, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();

  const formattedTotal = (totalPrice / 100).toFixed(2);

  if (totalItems === 0) {
    return null;
  }

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

      {!isAuthenticated && (
        <Alert variant="warning" className="mb-4">
          Please{" "}
          <Link href="/auth/login" className="underline">
            login
          </Link>{" "}
          to checkout
        </Alert>
      )}

      <Link href={isAuthenticated ? "/checkout" : "/auth/login"}>
        <Button className="w-full">Proceed to Checkout</Button>
      </Link>
    </div>
  );
}
