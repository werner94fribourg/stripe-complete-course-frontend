"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/contexts/AuthContext";
import { Product } from "@/app/lib/types";
import { UpdateProductForm } from "@/app/components/products/UpdateProductForm";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { Alert } from "@/app/components/ui/Alert";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

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
  }, [params.id, isAuthenticated, authLoading, router]);

  if (authLoading || isLoading) {
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
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/products/${product.id}`}>
          <Button variant="ghost">Back to Product</Button>
        </Link>
      </div>

      <Card>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Edit Product
        </h1>
        <UpdateProductForm product={product} />
      </Card>
    </div>
  );
}
