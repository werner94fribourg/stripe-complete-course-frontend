"use client";

import Link from "next/link";
import { Product } from "@/app/lib/types";
import { Card, CardContent, CardFooter } from "@/app/components/ui/Card";
import { AddToCartButton } from "./AddToCartButton";

interface ProductCardProps {
  product: Product;
  showDetails?: boolean;
}

export function ProductCard({ product, showDetails = false }: ProductCardProps) {
  const formattedPrice = (product.price / 100).toFixed(2);

  return (
    <Card className="flex flex-col h-full">
      <CardContent className="flex-1">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
            {product.name}
          </h3>
        </Link>
        <p
          className={`mt-2 text-gray-600 dark:text-gray-400 ${
            showDetails ? "" : "line-clamp-2"
          }`}
        >
          {product.description}
        </p>
        <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
          ${formattedPrice}
        </p>
      </CardContent>
      <CardFooter>
        <AddToCartButton product={product} />
      </CardFooter>
    </Card>
  );
}
