"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/app/lib/api";
import { Product } from "@/app/lib/types";
import { ProductCard } from "@/app/components/products/ProductCard";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { Alert } from "@/app/components/ui/Alert";
import { Button } from "@/app/components/ui/Button";

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.getProduct(params.id as string);
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Alert variant="error">{error}</Alert>
        <div className="mt-4">
          <Link href="/">
            <Button variant="ghost">Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Alert variant="error">Product not found</Alert>
        <div className="mt-4">
          <Link href="/">
            <Button variant="ghost">Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/">
          <Button variant="ghost">Back to Products</Button>
        </Link>
      </div>
      <ProductCard product={product} showDetails />
    </div>
  );
}
