"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/app/lib/stripe";
import { api } from "@/app/lib/api";
import { useAuth } from "@/app/contexts/AuthContext";
import { Order, Subscription, PaymentMethodSummary } from "@/app/lib/types";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import { Button } from "@/app/components/ui/Button";
import { Alert } from "@/app/components/ui/Alert";
import { LoadingSpinner } from "@/app/components/ui/LoadingSpinner";
import {
  PaymentMethodCard,
  AddPaymentMethodForm,
} from "@/app/components/payment-methods";

type Tab = "profile" | "purchases" | "subscriptions" | "payment-methods";

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  // Tab state
  const initialTab = (searchParams.get("tab") as Tab) || "profile";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  // Profile form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Purchases state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [subscriptionsError, setSubscriptionsError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodSummary[]>(
    [],
  );
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
  const [paymentMethodsError, setPaymentMethodsError] = useState("");
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [setupIntentClientSecret, setSetupIntentClientSecret] = useState("");
  const [deletingPmId, setDeletingPmId] = useState<string | null>(null);
  const [settingDefaultPmId, setSettingDefaultPmId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user, isAuthenticated, authLoading, router]);

  // Fetch orders when purchases tab is active
  useEffect(() => {
    if (activeTab === "purchases" && isAuthenticated) {
      fetchOrders();
    }
  }, [activeTab, isAuthenticated]);

  // Fetch subscriptions when subscriptions tab is active
  useEffect(() => {
    if (activeTab === "subscriptions" && isAuthenticated) {
      fetchSubscriptions();
    }
  }, [activeTab, isAuthenticated]);

  // Fetch payment methods when payment-methods tab is active
  useEffect(() => {
    if (activeTab === "payment-methods" && isAuthenticated) {
      fetchPaymentMethods();
    }
  }, [activeTab, isAuthenticated]);

  // Check for setup success in URL
  useEffect(() => {
    const setup = searchParams.get("setup");
    if (setup === "success") {
      setShowAddPaymentMethod(false);
      setSetupIntentClientSecret("");
      if (activeTab === "payment-methods") {
        fetchPaymentMethods();
      }
    }
  }, [searchParams, activeTab]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const data = await api.getMyOrders();
      setOrders(data);
    } catch (err) {
      setOrdersError(
        err instanceof Error ? err.message : "Failed to load orders",
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    setSubscriptionsLoading(true);
    setSubscriptionsError("");
    try {
      const data = await api.getMySubscriptions();
      setSubscriptions(data);
    } catch (err) {
      setSubscriptionsError(
        err instanceof Error ? err.message : "Failed to load subscriptions",
      );
    } finally {
      setSubscriptionsLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    setPaymentMethodsLoading(true);
    setPaymentMethodsError("");
    try {
      const data = await api.getPaymentMethods();
      setPaymentMethods(data);
    } catch (err) {
      setPaymentMethodsError(
        err instanceof Error ? err.message : "Failed to load payment methods",
      );
    } finally {
      setPaymentMethodsLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      const { clientSecret } = await api.createSetupIntent();
      setSetupIntentClientSecret(clientSecret);
      setShowAddPaymentMethod(true);
    } catch (err) {
      setPaymentMethodsError(
        err instanceof Error ? err.message : "Failed to start setup",
      );
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    setDeletingPmId(id);
    try {
      await api.deletePaymentMethod(id);
      await fetchPaymentMethods();
    } catch (err) {
      setPaymentMethodsError(
        err instanceof Error ? err.message : "Failed to delete payment method",
      );
    } finally {
      setDeletingPmId(null);
    }
  };

  const handleSetDefaultPaymentMethod = async (id: string) => {
    setSettingDefaultPmId(id);
    try {
      await api.setDefaultPaymentMethod(id);
      await fetchPaymentMethods();
    } catch (err) {
      setPaymentMethodsError(
        err instanceof Error ? err.message : "Failed to set default",
      );
    } finally {
      setSettingDefaultPmId(null);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsUpdating(true);

    try {
      const updateData: {
        username?: string;
        email?: string;
        password?: string;
      } = {};

      if (username !== user?.username) {
        updateData.username = username;
      }
      if (email !== user?.email) {
        updateData.email = email;
      }
      if (password) {
        updateData.password = password;
      }

      if (Object.keys(updateData).length === 0) {
        setError("No changes to save");
        setIsUpdating(false);
        return;
      }

      await api.updateUser(user!.id, updateData);
      setSuccess("Profile updated successfully");
      setPassword("");
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setError("");
    setIsDeleting(true);

    try {
      await api.deleteUser(user!.id);
      logout();
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
      setIsDeleting(false);
    }
  };

  const handleCancelSubscription = async (
    subscriptionId: string,
    immediately: boolean,
  ) => {
    setCancellingId(subscriptionId);
    try {
      await api.cancelSubscription(subscriptionId, immediately);
      // Refresh subscriptions
      await fetchSubscriptions();
    } catch (err) {
      setSubscriptionsError(
        err instanceof Error ? err.message : "Failed to cancel subscription",
      );
    } finally {
      setCancellingId(null);
    }
  };

  const changeTab = (tab: Tab) => {
    setActiveTab(tab);
    router.push(`/profile?tab=${tab}`, { scroll: false });
  };

  if (authLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatPrice = (cents: number) => (cents / 100).toFixed(2);
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString();

  console.log(paymentMethods);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        My Account
      </h1>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        {(
          ["profile", "purchases", "subscriptions", "payment-methods"] as Tab[]
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => changeTab(tab)}
            className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {tab === "payment-methods"
              ? "Payment Methods"
              : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <>
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Account Information
            </h2>

            {error && (
              <Alert variant="error" className="mb-4">
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success" className="mb-4">
                {success}
              </Alert>
            )}

            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <Input
                  label="Username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Input
                  label="New Password (leave blank to keep current)"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                />

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setUsername(user.username);
                      setEmail(user.email);
                      setPassword("");
                      setError("");
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isUpdating}
                    className="flex-1"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    Username
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {user.username}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white">{user.email}</p>
                </div>

                <Button onClick={() => setIsEditing(true)} className="w-full">
                  Edit Profile
                </Button>
              </div>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Danger Zone
            </h2>

            {showDeleteConfirm ? (
              <div className="space-y-4">
                <Alert variant="warning">
                  Are you sure you want to delete your account? This action
                  cannot be undone and will remove all your data.
                </Alert>
                <div className="flex gap-4">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleDelete}
                    isLoading={isDeleting}
                    className="flex-1"
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full"
              >
                Delete Account
              </Button>
            )}
          </Card>
        </>
      )}

      {/* Purchases Tab */}
      {activeTab === "purchases" && (
        <div>
          {ordersLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : ordersError ? (
            <Alert variant="error">{ordersError}</Alert>
          ) : orders.length === 0 ? (
            <Card>
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No purchases yet
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Order #{order.id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(order.createdAt)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {order.items.length} item(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">
                        ${formatPrice(order.total)}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                          order.pending
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : order.isFailed
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }`}
                      >
                        {order.pending
                          ? "Pending"
                          : order.isFailed
                            ? "Failed"
                            : "Completed"}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === "subscriptions" && (
        <div>
          {subscriptionsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : subscriptionsError ? (
            <Alert variant="error">{subscriptionsError}</Alert>
          ) : subscriptions.length === 0 ? (
            <Card>
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No subscriptions yet
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <Card key={subscription.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Subscription #{subscription.id.slice(-8)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Started: {formatDate(subscription.startDate)}
                        {subscription.endDate &&
                          ` | Ends: ${formatDate(subscription.endDate)}`}
                      </p>
                      {subscription.currentPeriodEnd && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          Current period ends:{" "}
                          {formatDate(subscription.currentPeriodEnd)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          subscription.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : subscription.status === "trialing"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : subscription.status === "canceled"
                                ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                : subscription.status === "past_due"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {subscription.status.charAt(0).toUpperCase() +
                          subscription.status.slice(1).replace("_", " ")}
                      </span>
                      {subscription.status === "active" && (
                        <div className="mt-2">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() =>
                              handleCancelSubscription(subscription.id, false)
                            }
                            isLoading={cancellingId === subscription.id}
                            disabled={cancellingId !== null}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeTab === "payment-methods" && (
        <div>
          {paymentMethodsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : paymentMethodsError ? (
            <Alert variant="error">{paymentMethodsError}</Alert>
          ) : showAddPaymentMethod && setupIntentClientSecret ? (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Add Payment Method
              </h2>
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: setupIntentClientSecret,
                  appearance: { theme: "stripe" },
                }}
              >
                <AddPaymentMethodForm
                  onSuccess={() => {
                    setShowAddPaymentMethod(false);
                    setSetupIntentClientSecret("");
                    fetchPaymentMethods();
                  }}
                  onCancel={() => {
                    setShowAddPaymentMethod(false);
                    setSetupIntentClientSecret("");
                  }}
                />
              </Elements>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Saved Payment Methods
                </h2>
                <Button onClick={handleAddPaymentMethod}>
                  Add Payment Method
                </Button>
              </div>

              {paymentMethods.length === 0 ? (
                <Card className="p-6">
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    No saved payment methods. Add one to speed up checkout.
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((pm) => (
                    <PaymentMethodCard
                      key={pm.id}
                      paymentMethod={pm}
                      onDelete={handleDeletePaymentMethod}
                      onSetDefault={handleSetDefaultPaymentMethod}
                      isDeleting={deletingPmId === pm.id}
                      isSettingDefault={settingDefaultPmId === pm.id}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
