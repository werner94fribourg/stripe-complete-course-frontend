"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/app/lib/api";
import { Plan } from "@/app/lib/types";
import { Button } from "@/app/components/ui/Button";

interface RentButtonProps {
  productId: string;
}

export function RentButton({ productId }: RentButtonProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await api.getPlansByProduct(productId);
        setPlans(data);
      } catch {
        // Silently fail - no plans means no rent button
        setPlans([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlans();
  }, [productId]);

  // Don't render anything while loading or if no plans
  if (isLoading || plans.length === 0) {
    return null;
  }

  return (
    <Link href={`/rent/${productId}`} className="w-full">
      <Button variant="secondary" className="w-full">
        Rent
      </Button>
    </Link>
  );
}
