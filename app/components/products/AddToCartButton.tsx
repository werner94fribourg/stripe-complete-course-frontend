"use client";

import { useState } from "react";
import { Product } from "@/app/lib/types";
import { useCart } from "@/app/contexts/CartContext";
import { Button } from "@/app/components/ui/Button";

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Button
      onClick={handleClick}
      variant={added ? "secondary" : "primary"}
      className="w-full"
    >
      {added ? "Added!" : "Add to Cart"}
    </Button>
  );
}
