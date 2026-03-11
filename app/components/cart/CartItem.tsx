"use client";

import { CartItem as CartItemType } from "@/app/lib/types";
import { useCart } from "@/app/contexts/CartContext";
import { Button } from "@/app/components/ui/Button";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity } = item;
  const formattedPrice = (product.price / 100).toFixed(2);
  const itemTotal = ((product.price * quantity) / 100).toFixed(2);

  return (
    <div className="flex items-center justify-between py-4 border-b dark:border-gray-700">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 dark:text-white">
          {product.name}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          ${formattedPrice} each
        </p>
      </div>

      <div className="flex items-center space-x-4">
        {/* Quantity controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateQuantity(product.id, quantity - 1)}
          >
            -
          </Button>
          <span className="w-8 text-center text-gray-900 dark:text-white">
            {quantity}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateQuantity(product.id, quantity + 1)}
          >
            +
          </Button>
        </div>

        {/* Item total */}
        <span className="w-20 text-right font-medium text-gray-900 dark:text-white">
          ${itemTotal}
        </span>

        {/* Remove button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeItem(product.id)}
          className="text-red-600 hover:text-red-700"
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
