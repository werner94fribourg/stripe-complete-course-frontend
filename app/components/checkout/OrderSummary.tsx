"use client";

import { useCart } from "@/app/contexts/CartContext";

export function OrderSummary() {
  const { items, totalPrice } = useCart();
  const formattedTotal = (totalPrice / 100).toFixed(2);

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Order Summary
      </h3>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex justify-between text-sm"
          >
            <span className="text-gray-600 dark:text-gray-400">
              {item.product.name} x {item.quantity}
            </span>
            <span className="text-gray-900 dark:text-white">
              ${((item.product.price * item.quantity) / 100).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <hr className="my-4 border-gray-200 dark:border-gray-700" />

      <div className="flex justify-between font-semibold">
        <span className="text-gray-900 dark:text-white">Total</span>
        <span className="text-gray-900 dark:text-white">${formattedTotal}</span>
      </div>
    </div>
  );
}
