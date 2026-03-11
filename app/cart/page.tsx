"use client";

import Link from "next/link";
import { useCart } from "@/app/contexts/CartContext";
import { CartItem } from "@/app/components/cart/CartItem";
import { CartSummary } from "@/app/components/cart/CartSummary";
import { Button } from "@/app/components/ui/Button";

export default function CartPage() {
  const { items, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Your Cart is Empty
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Add some products to get started!
        </p>
        <Link href="/">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Shopping Cart
        </h1>
        <Button variant="ghost" onClick={clearCart}>
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {items.map((item) => (
            <CartItem key={item.product.id} item={item} />
          ))}
        </div>
        <div>
          <CartSummary />
        </div>
      </div>
    </div>
  );
}
