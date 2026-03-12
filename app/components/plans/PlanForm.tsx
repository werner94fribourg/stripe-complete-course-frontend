"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { Product, RecurringInterval, PlanRange } from "@/app/lib/types";
import { Input } from "@/app/components/ui/Input";
import { Button } from "@/app/components/ui/Button";
import { Alert } from "@/app/components/ui/Alert";

const RECURRING_INTERVALS: { value: RecurringInterval; label: string }[] = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
  { value: "year", label: "Yearly" },
];

interface RangeFormData {
  recurring_interval: RecurringInterval;
  unit_amount: string;
  lookup_key: string;
}

const createEmptyRange = (): RangeFormData => ({
  recurring_interval: "month",
  unit_amount: "",
  lookup_key: "",
});

export function PlanForm() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [ranges, setRanges] = useState<RangeFormData[]>([createEmptyRange()]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.getProducts();
        setProducts(data);
        if (data.length > 0) {
          setSelectedProductId(data[0].id);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load products"
        );
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddRange = () => {
    setRanges([...ranges, createEmptyRange()]);
  };

  const handleRemoveRange = (index: number) => {
    if (ranges.length > 1) {
      setRanges(ranges.filter((_, i) => i !== index));
    }
  };

  const handleRangeChange = (
    index: number,
    field: keyof RangeFormData,
    value: string
  ) => {
    const newRanges = [...ranges];
    newRanges[index] = { ...newRanges[index], [field]: value };
    setRanges(newRanges);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!selectedProductId) {
        throw new Error("Please select a product");
      }

      const planRanges: PlanRange[] = ranges.map((range) => {
        const unitAmount = Math.round(parseFloat(range.unit_amount) * 100);

        if (isNaN(unitAmount) || unitAmount <= 0) {
          throw new Error("Please enter valid prices for all ranges");
        }

        if (!range.lookup_key.trim()) {
          throw new Error("Please enter a lookup key for all ranges");
        }

        return {
          recurring_interval: range.recurring_interval,
          unit_amount: unitAmount,
          lookup_key: range.lookup_key.trim(),
        };
      });

      await api.createPlans({
        productId: selectedProductId,
        ranges: planRanges,
      });

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create plans");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProducts) {
    return (
      <div className="text-center py-4 text-gray-600 dark:text-gray-400">
        Loading products...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Alert variant="warning">
        No products found. Please create a product first before adding plans.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Product
        </label>
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          required
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} - ${(product.price / 100).toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Pricing Plans
          </h3>
          <Button type="button" variant="secondary" size="sm" onClick={handleAddRange}>
            + Add Plan
          </Button>
        </div>

        {ranges.map((range, index) => (
          <div
            key={index}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Plan {index + 1}
              </span>
              {ranges.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveRange(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Billing Interval
                </label>
                <select
                  value={range.recurring_interval}
                  onChange={(e) =>
                    handleRangeChange(
                      index,
                      "recurring_interval",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  required
                >
                  {RECURRING_INTERVALS.map((interval) => (
                    <option key={interval.value} value={interval.value}>
                      {interval.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Price ($)"
                type="number"
                step="0.01"
                min="0.01"
                value={range.unit_amount}
                onChange={(e) =>
                  handleRangeChange(index, "unit_amount", e.target.value)
                }
                placeholder="0.00"
                required
              />

              <Input
                label="Lookup Key"
                type="text"
                value={range.lookup_key}
                onChange={(e) =>
                  handleRangeChange(index, "lookup_key", e.target.value)
                }
                placeholder="e.g., basic_monthly"
                required
              />
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        Create Plans
      </Button>
    </form>
  );
}
