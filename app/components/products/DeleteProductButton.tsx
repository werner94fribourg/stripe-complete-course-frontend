"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { Button } from "@/app/components/ui/Button";
import { Alert } from "@/app/components/ui/Alert";

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

export function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleDelete = async () => {
    setIsLoading(true);
    setError("");

    try {
      await api.deleteProduct(productId);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
      setIsLoading(false);
    }
  };

  if (isConfirming) {
    return (
      <div className="space-y-3">
        {error && <Alert variant="error">{error}</Alert>}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to delete &quot;{productName}&quot;? This action
          cannot be undone.
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsConfirming(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isLoading}
          >
            Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button variant="danger" onClick={() => setIsConfirming(true)}>
      Delete Product
    </Button>
  );
}
