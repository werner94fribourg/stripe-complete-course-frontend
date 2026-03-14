// User types
export interface User {
  id: string;
  username: string;
  email: string;
  stripeCustomerId: string | null;
  isSeller: boolean;
  stripeConnectAccountId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stripeProductId: string;
  stripePriceId: string;
  stripeRecurringPriceId: string | null;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  isOwner?: boolean;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
}

// Cart types
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// Order types
export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  stripePriceId: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  pending: boolean;
  isFailed: boolean;
  paymentIntentId: string | null;
  checkoutSessionId: string | null;
  stripeCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentIntentRequest {
  userId: string;
  items: OrderItemInput[];
  paymentMethodId?: string;
  idempotencyKey?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  order: Order;
}

export interface PaymentIntentWithMethodResponse {
  paymentIntentId: string;
  status: string;
  requiresAction: boolean;
  clientSecret: string | null;
  order: Order;
}

export interface CheckoutSessionRequest {
  userId: string;
  items: OrderItemInput[];
}

export interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
  order: Order;
}

export type PaymentMethod = "stripe-elements" | "stripe-checkout";

// Plan types
export type RecurringInterval = "day" | "week" | "month" | "year";

export interface PlanRange {
  recurring_interval: RecurringInterval;
  unit_amount: number;
  lookup_key: string;
}

export interface CreatePlansData {
  productId: string;
  ranges: PlanRange[];
}

export interface Plan {
  id: string;
  productId: string;
  recurring_interval: RecurringInterval;
  unit_amount: number;
  lookup_key: string;
  stripePriceId: string;
  createdAt: string;
  updatedAt: string;
}

// Subscription types
export interface Subscription {
  id: string;
  userId: string;
  productId: string;
  planId: string;
  stripeSubscriptionId: string;
  startDate: string;
  endDate: string | null;
  trialPeriodDays: number | null;
  trialEndDate: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  paid: boolean;
  status: string;
  cancelReason: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionData {
  productId: string;
  planId: string;
  startDate: string;
  endDate?: string;
  trialPeriodDays?: number;
  idempotencyKey?: string;
}

export interface CreateSubscriptionResponse {
  subscription: Subscription;
  clientSecret: string | null;
}

// Seller/Marketplace types
export interface ConnectAccountStatus {
  isReady: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}

export interface CreateConnectAccountResponse {
  accountId: string;
  onboardingUrl: string;
}

export interface OnboardingLinkResponse {
  url: string;
}

export interface SellerEarning {
  id: string;
  sellerId: string;
  orderId: string;
  productId: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  paymentIntentId: string;
  stripeTransferId: string | null;
  status: "pending" | "paid" | "failed";
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EarningsSummary {
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  earningsCount: number;
}

export interface Payout {
  id: string;
  sellerId: string;
  totalAmount: number;
  stripeTransferId: string;
  status: "pending" | "completed" | "failed";
  periodStart: string;
  periodEnd: string;
  earningsIds: string[];
  createdAt: string;
  updatedAt: string;
}

// Payment Method types
export interface PaymentMethodSummary {
  id: string;
  type: string;
  isDefault: boolean;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  paypal?: {
    payerEmail: string;
  };
  link?: {
    email: string;
  };
  twint?: Record<string, unknown>;
  createdAt: number;
}

export interface SetupIntentResponse {
  clientSecret: string;
}

// API response types
export interface ApiError {
  message: string;
  statusCode: number;
}
