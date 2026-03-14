"use client";

import { PaymentMethodSummary } from "@/app/lib/types";

interface PaymentMethodSelectorProps {
  paymentMethods: PaymentMethodSummary[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const CARD_BRAND_SHORT: Record<string, string> = {
  visa: "VISA",
  mastercard: "MC",
  amex: "AMEX",
  discover: "DISC",
};

export function PaymentMethodSelector({
  paymentMethods,
  selectedId,
  onSelect,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      {paymentMethods.map((pm) => (
        <label
          key={pm.id}
          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
            selectedId === pm.id
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value={pm.id}
            checked={selectedId === pm.id}
            onChange={() => onSelect(pm.id)}
            className="sr-only"
          />
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-6 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-xs font-medium">
              {pm.type === "card" &&
                (CARD_BRAND_SHORT[pm.card?.brand || ""] ||
                  pm.card?.brand?.slice(0, 4).toUpperCase())}
              {pm.type === "paypal" && "PP"}
              {pm.type === "link" && "Link"}
              {pm.type === "twint" && "TW"}
            </div>
            <div className="flex-1">
              {pm.type === "card" && pm.card && (
                <span className="text-gray-900 dark:text-white">
                  **** {pm.card.last4}
                </span>
              )}
              {pm.type === "paypal" && pm.paypal && (
                <span className="text-gray-900 dark:text-white">
                  {pm.paypal.payerEmail}
                </span>
              )}
              {pm.type === "link" && (
                <span className="text-gray-900 dark:text-white">
                  Stripe Link{pm.link?.email ? ` (${pm.link.email})` : ""}
                </span>
              )}
              {pm.type === "twint" && (
                <span className="text-gray-900 dark:text-white">TWINT</span>
              )}
            </div>
            {pm.isDefault && (
              <span className="text-xs text-green-600 dark:text-green-400">
                Default
              </span>
            )}
          </div>
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              selectedId === pm.id
                ? "border-blue-500 bg-blue-500"
                : "border-gray-300 dark:border-gray-600"
            }`}
          >
            {selectedId === pm.id && (
              <div className="w-2 h-2 bg-white rounded-full" />
            )}
          </div>
        </label>
      ))}

      {/* Option for new payment method */}
      <label
        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
          selectedId === null
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
        }`}
      >
        <input
          type="radio"
          name="paymentMethod"
          value=""
          checked={selectedId === null}
          onChange={() => onSelect(null)}
          className="sr-only"
        />
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-6 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
            <span className="text-lg text-gray-600 dark:text-gray-400">+</span>
          </div>
          <span className="text-gray-900 dark:text-white">
            Use a new payment method
          </span>
        </div>
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            selectedId === null
              ? "border-blue-500 bg-blue-500"
              : "border-gray-300 dark:border-gray-600"
          }`}
        >
          {selectedId === null && (
            <div className="w-2 h-2 bg-white rounded-full" />
          )}
        </div>
      </label>
    </div>
  );
}
