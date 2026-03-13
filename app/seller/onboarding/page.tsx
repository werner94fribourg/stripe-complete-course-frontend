"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/contexts/AuthContext";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import { Alert } from "@/app/components/ui/Alert";
import { ConnectAccountStatus } from "@/app/lib/types";

export default function SellerOnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [connectStatus, setConnectStatus] = useState<ConnectAccountStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");

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

  const handleStartOnboarding = async () => {
    setIsStarting(true);
    setError("");
    try {
      const { onboardingUrl } = await api.createConnectAccount();
      window.location.href = onboardingUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start onboarding");
      setIsStarting(false);
    }
  };

  const handleContinueOnboarding = async () => {
    setIsStarting(true);
    setError("");
    try {
      const { url } = await api.getConnectOnboardingLink();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get onboarding link");
      setIsStarting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Already fully set up
  if (connectStatus?.isReady) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-6">
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              You&apos;re all set!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your seller account is fully set up. You can now create products as an owner
              and receive payments.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push("/products/new")}>
                Create a Product
              </Button>
              <Button variant="secondary" onClick={() => router.push("/seller/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Onboarding started but not complete
  if (connectStatus?.detailsSubmitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-6">
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Continue Setup
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your seller account setup is incomplete. Please continue to provide the
              required information.
            </p>
            {error && <Alert variant="error" className="mb-4">{error}</Alert>}
            <Button onClick={handleContinueOnboarding} isLoading={isStarting}>
              Continue Onboarding
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Not started yet
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Become a Seller
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Set up your seller account to start earning money from your products.
      </p>

      <Card>
        <div className="py-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            What you&apos;ll need
          </h3>
          <ul className="space-y-3 text-gray-600 dark:text-gray-400 mb-6">
            <li className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Personal information (name, address, date of birth)</span>
            </li>
            <li className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Bank account information for payouts</span>
            </li>
            <li className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Tax identification number (for US sellers)</span>
            </li>
          </ul>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              By becoming a seller, you agree to our terms of service. A 10% platform
              fee will be deducted from each sale, and payouts are processed monthly
              (minimum $10).
            </p>
          </div>

          {error && <Alert variant="error" className="mb-4">{error}</Alert>}

          <Button
            onClick={handleStartOnboarding}
            isLoading={isStarting}
            className="w-full"
          >
            Start Seller Onboarding
          </Button>
        </div>
      </Card>
    </div>
  );
}
