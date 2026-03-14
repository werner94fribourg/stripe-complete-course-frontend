"use client";

import { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/app/lib/stripe";
import { api } from "@/app/lib/api";
import { generateIdempotencyKey } from "@/app/lib/idempotency";
import { useAuth } from "@/app/contexts/AuthContext";
import { Product, Plan } from "@/app/lib/types";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Alert } from "@/app/components/ui/Alert";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { RentalPaymentForm } from "./RentalPaymentForm";

const INTERVAL_LABELS: Record<string, string> = {
  day: "Daily",
  week: "Weekly",
  month: "Monthly",
  year: "Yearly",
};

export default function RentPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [productData, plansData] = await Promise.all([
          api.getProduct(productId),
          api.getPlansByProduct(productId),
        ]);
        setProduct(productData);
        setPlans(plansData);

        if (plansData.length > 0) {
          setSelectedPlanId(plansData[0].id);
        }

        // Set default start date to today
        const today = new Date().toISOString().split("T")[0];
        setStartDate(today);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [productId, isAuthenticated, authLoading, router]);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (!selectedPlanId || !startDate) {
        throw new Error("Please select a plan and start date");
      }

      const idempotencyKey = generateIdempotencyKey("sub");
      const response = await api.createSubscription({
        productId,
        planId: selectedPlanId,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        idempotencyKey,
      });

      if (response.clientSecret) {
        setClientSecret(response.clientSecret);
      } else {
        // Subscription created without payment needed (e.g., trial)
        router.push("/profile?tab=subscriptions");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create subscription"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product || plans.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Alert variant="error">
          {error || "This product is not available for rental"}
        </Alert>
      </div>
    );
  }

  // Show payment form if we have a client secret
  if (clientSecret) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Complete Payment
        </h1>

        <Card className="mb-6">
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-400">
              Renting: <span className="font-semibold">{product.name}</span>
            </p>
            {selectedPlan && (
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                ${formatPrice(selectedPlan.unit_amount)} /{" "}
                {selectedPlan.recurring_interval}
              </p>
            )}
          </div>

          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: { theme: "stripe" },
            }}
          >
            <RentalPaymentForm />
          </Elements>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Rent {product.name}
      </h1>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Plan Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Plan
            </label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {INTERVAL_LABELS[plan.recurring_interval] ||
                    plan.recurring_interval}{" "}
                  - ${formatPrice(plan.unit_amount)}/{plan.recurring_interval}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* End Date (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date (Optional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Leave empty for ongoing subscription
            </p>
          </div>

          {/* Price Display */}
          {selectedPlan && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Price per {selectedPlan.recurring_interval}
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  ${formatPrice(selectedPlan.unit_amount)}
                </span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full"
          >
            Continue to Payment
          </Button>
        </form>
      </Card>
    </div>
  );
}
