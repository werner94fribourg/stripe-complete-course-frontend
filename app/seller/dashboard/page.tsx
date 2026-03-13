"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/contexts/AuthContext";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { Alert } from "@/app/components/ui/Alert";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import {
  ConnectAccountStatus,
  EarningsSummary,
  SellerEarning,
  Payout,
  Product,
} from "@/app/lib/types";

type Tab = "overview" | "earnings" | "payouts" | "products";

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [connectStatus, setConnectStatus] = useState<ConnectAccountStatus | null>(null);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [earnings, setEarnings] = useState<SellerEarning[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    loadData();
  }, [isAuthenticated, authLoading, router]);

  const loadData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const [statusData, summaryData, earningsData, payoutsData, productsData] = await Promise.all([
        api.getConnectStatus(),
        api.getEarningsSummary(),
        api.getMyEarnings(),
        api.getMyPayouts(),
        api.getMyProducts(),
      ]);
      setConnectStatus(statusData);
      setSummary(summaryData);
      setEarnings(earningsData);
      setPayouts(payoutsData);
      setProducts(productsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!connectStatus?.isReady) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Seller Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Complete your seller onboarding to access your dashboard.
            </p>
            <Button onClick={() => router.push("/seller/onboarding")}>
              Complete Onboarding
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Seller Dashboard
        </h1>
        <Button onClick={() => router.push("/products/new")}>
          Add Product
        </Button>
      </div>

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Earnings</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatPrice(summary?.totalEarnings || 0)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {formatPrice(summary?.pendingEarnings || 0)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Paid Out</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatPrice(summary?.paidEarnings || 0)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Products</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {products.length}
            </p>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        {(["overview", "earnings", "payouts", "products"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Earnings
            </h2>
            {earnings.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No earnings yet
              </p>
            ) : (
              <div className="space-y-3">
                {earnings.slice(0, 5).map((earning) => (
                  <div
                    key={earning.id}
                    className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(earning.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatPrice(earning.netAmount)}
                      </p>
                      <span
                        className={`text-xs ${
                          earning.status === "paid"
                            ? "text-green-600"
                            : earning.status === "pending"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {earning.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Your Products
            </h2>
            {products.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No products yet
                </p>
                <Button size="sm" onClick={() => router.push("/products/new")}>
                  Create Product
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {products.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div>
                      <Link
                        href={`/products/${product.id}`}
                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {product.name}
                      </Link>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Earnings Tab */}
      {activeTab === "earnings" && (
        <div>
          {earnings.length === 0 ? (
            <Card>
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No earnings yet. Start selling products to earn money!
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {earnings.map((earning) => (
                <Card key={earning.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Earning #{earning.id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(earning.createdAt)}
                      </p>
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        <p>Gross: {formatPrice(earning.grossAmount)}</p>
                        <p>Platform fee: -{formatPrice(earning.platformFee)}</p>
                        <p className="font-medium">Net: {formatPrice(earning.netAmount)}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        earning.status === "paid"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : earning.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {earning.status}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payouts Tab */}
      {activeTab === "payouts" && (
        <div>
          <Card className="mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Monthly Payouts
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Payouts are processed on the 1st of each month for earnings above $10.
                </p>
              </div>
            </div>
          </Card>

          {payouts.length === 0 ? (
            <Card>
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No payouts yet. Payouts are processed monthly.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {payouts.map((payout) => (
                <Card key={payout.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Payout #{payout.id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(payout.createdAt)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        Period: {formatDate(payout.periodStart)} - {formatDate(payout.periodEnd)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {formatPrice(payout.totalAmount)}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                          payout.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : payout.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {payout.status}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div>
          {products.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  You haven&apos;t created any products yet.
                </p>
                <Button onClick={() => router.push("/products/new")}>
                  Create Your First Product
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {formatPrice(product.price)}
                    </p>
                    <Link
                      href={`/products/${product.id}/edit`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                    >
                      Edit
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
