"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { PlanForm } from "@/app/components/plans/PlanForm";
import { Card, CardContent, CardHeader } from "@/app/components/ui/Card";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";

export default function CreatePlanPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Pricing Plans
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Add subscription pricing plans to an existing product.
          </p>
        </CardHeader>
        <CardContent>
          <PlanForm />
        </CardContent>
      </Card>
    </div>
  );
}
