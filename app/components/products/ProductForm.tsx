"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/contexts/AuthContext";
import { Input } from "@/app/components/ui/Input";
import { Button } from "@/app/components/ui/Button";
import { Alert } from "@/app/components/ui/Alert";
import { ConnectAccountStatus } from "@/app/lib/types";

export function ProductForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [connectStatus, setConnectStatus] = useState<ConnectAccountStatus | null>(null);
  const [isCheckingConnect, setIsCheckingConnect] = useState(false);

  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isOwner && isAuthenticated) {
      checkConnectStatus();
    }
  }, [isOwner, isAuthenticated]);

  const checkConnectStatus = async () => {
    setIsCheckingConnect(true);
    try {
      const status = await api.getConnectStatus();
      setConnectStatus(status);
    } catch {
      setConnectStatus(null);
    } finally {
      setIsCheckingConnect(false);
    }
  };

  const handleStartOnboarding = async () => {
    setIsLoading(true);
    try {
      const { onboardingUrl } = await api.createConnectAccount();
      window.location.href = onboardingUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start onboarding");
      setIsLoading(false);
    }
  };

  const handleContinueOnboarding = async () => {
    setIsLoading(true);
    try {
      const { url } = await api.getConnectOnboardingLink();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get onboarding link");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const priceInCents = Math.round(parseFloat(price) * 100);

      if (isNaN(priceInCents) || priceInCents <= 0) {
        throw new Error("Please enter a valid price");
      }

      if (isOwner && (!connectStatus || !connectStatus.isReady)) {
        throw new Error("Please complete seller onboarding before creating a product as owner");
      }

      await api.createProduct({
        name,
        description,
        price: priceInCents,
        isOwner: isOwner || undefined,
      });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  const renderOwnerSection = () => {
    if (!isOwner) return null;

    if (!isAuthenticated) {
      return (
        <Alert variant="error">
          You must be logged in to create a product as owner.
        </Alert>
      );
    }

    if (isCheckingConnect) {
      return (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">Checking seller status...</p>
        </div>
      );
    }

    if (!connectStatus || !connectStatus.isReady) {
      const hasStarted = connectStatus?.detailsSubmitted;

      return (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg space-y-3">
          <p className="text-yellow-800 dark:text-yellow-200 font-medium">
            {hasStarted
              ? "Complete your seller onboarding to sell products"
              : "Become a seller to create products you own"}
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            {hasStarted
              ? "Your seller account setup is incomplete. Please continue the onboarding process."
              : "Set up a seller account to receive payments for your products. The platform takes a 10% fee on each sale, and you'll receive monthly payouts."}
          </p>
          <Button
            type="button"
            onClick={hasStarted ? handleContinueOnboarding : handleStartOnboarding}
            isLoading={isLoading}
          >
            {hasStarted ? "Continue Onboarding" : "Become a Seller"}
          </Button>
        </div>
      );
    }

    return (
      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <p className="text-green-800 dark:text-green-200 font-medium">
          Seller account active
        </p>
        <p className="text-sm text-green-700 dark:text-green-300">
          You can create products as the owner. A 10% platform fee will be deducted from sales.
        </p>
      </div>
    );
  };

  const canSubmit = !isOwner || (connectStatus?.isReady ?? false);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      <Input
        label="Product Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          required
        />
      </div>

      <Input
        label="Price ($)"
        type="number"
        step="0.01"
        min="0.01"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="0.00"
        required
      />

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isOwner"
            checked={isOwner}
            onChange={(e) => setIsOwner(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="isOwner"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            I am the owner/seller of this product
          </label>
        </div>

        {renderOwnerSection()}
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full"
        disabled={!canSubmit}
      >
        Create Product
      </Button>
    </form>
  );
}
