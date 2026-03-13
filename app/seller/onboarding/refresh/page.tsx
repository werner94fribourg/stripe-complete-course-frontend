"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";

export default function OnboardingRefreshPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/seller/onboarding");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        Refreshing onboarding session...
      </p>
    </div>
  );
}
