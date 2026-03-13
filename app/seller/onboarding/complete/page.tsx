"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/contexts/AuthContext";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { ConnectAccountStatus } from "@/app/lib/types";

export default function OnboardingCompletePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [connectStatus, setConnectStatus] = useState<ConnectAccountStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    checkStatus();
  }, [isAuthenticated, authLoading, router]);

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      const status = await api.getConnectStatus();
      setConnectStatus(status);
    } catch {
      setConnectStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Checking your account status...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <div className="text-center py-6">
          {connectStatus?.isReady ? (
            <>
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Onboarding Complete!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Congratulations! Your seller account is now fully set up. You can start
                creating products and earning money.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => router.push("/products/new")}>
                  Create Your First Product
                </Button>
                <Button variant="secondary" onClick={() => router.push("/seller/dashboard")}>
                  Go to Dashboard
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Almost There!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your account setup is not yet complete. Please continue with the onboarding
                process to finish setting up your seller account.
              </p>
              <Button onClick={() => router.push("/seller/onboarding")}>
                Continue Onboarding
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
