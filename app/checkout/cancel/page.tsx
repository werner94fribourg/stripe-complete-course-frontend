"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/Button";

export default function CheckoutCancelPage() {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <div className="mb-8">
        <svg
          className="mx-auto h-16 w-16 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Payment Cancelled
      </h1>

      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        Your payment was cancelled. No charges were made. Your cart items are
        still saved if you&apos;d like to try again.
      </p>

      <div className="flex justify-center space-x-4">
        <Button onClick={() => router.push("/cart")}>Return to Cart</Button>
        <Button variant="secondary" onClick={() => router.push("/")}>
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
