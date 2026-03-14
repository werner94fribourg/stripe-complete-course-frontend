"use client";

import { PaymentMethodSummary } from "@/app/lib/types";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethodSummary;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  isDeleting: boolean;
  isSettingDefault: boolean;
}

const CARD_BRAND_DISPLAY: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  discover: "Discover",
  diners: "Diners Club",
  jcb: "JCB",
  unionpay: "UnionPay",
};

export function PaymentMethodCard({
  paymentMethod,
  onDelete,
  onSetDefault,
  isDeleting,
  isSettingDefault,
}: PaymentMethodCardProps) {
  const formatExpiry = (month: number, year: number) =>
    `${month.toString().padStart(2, "0")}/${year.toString().slice(-2)}`;

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-12 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
            {paymentMethod.type === "card" && (
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {CARD_BRAND_DISPLAY[paymentMethod.card?.brand || ""] ||
                  paymentMethod.card?.brand?.toUpperCase() ||
                  "Card"}
              </span>
            )}
            {paymentMethod.type === "paypal" && (
              <span className="text-xs font-bold text-blue-600">PayPal</span>
            )}
            {paymentMethod.type === "link" && (
              <span className="text-xs font-bold text-green-600">Link</span>
            )}
            {paymentMethod.type === "twint" && (
              <span className="text-xs font-bold text-black dark:text-white">
                TWINT
              </span>
            )}
          </div>

          <div>
            {paymentMethod.type === "card" && paymentMethod.card && (
              <>
                <p className="font-medium text-gray-900 dark:text-white">
                  **** **** **** {paymentMethod.card.last4}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Expires{" "}
                  {formatExpiry(
                    paymentMethod.card.expMonth,
                    paymentMethod.card.expYear
                  )}
                </p>
              </>
            )}
            {paymentMethod.type === "paypal" && paymentMethod.paypal && (
              <p className="font-medium text-gray-900 dark:text-white">
                {paymentMethod.paypal.payerEmail}
              </p>
            )}
            {paymentMethod.type === "link" && (
              <>
                <p className="font-medium text-gray-900 dark:text-white">
                  Stripe Link
                </p>
                {paymentMethod.link?.email && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {paymentMethod.link.email}
                  </p>
                )}
              </>
            )}
            {paymentMethod.type === "twint" && (
              <p className="font-medium text-gray-900 dark:text-white">
                TWINT Account
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {paymentMethod.isDefault && (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
              Default
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {!paymentMethod.isDefault && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSetDefault(paymentMethod.id)}
            isLoading={isSettingDefault}
            disabled={isDeleting}
          >
            Set as Default
          </Button>
        )}
        <Button
          size="sm"
          variant="danger"
          onClick={() => onDelete(paymentMethod.id)}
          isLoading={isDeleting}
          disabled={isSettingDefault}
        >
          Remove
        </Button>
      </div>
    </Card>
  );
}
