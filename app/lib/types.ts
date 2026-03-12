// User types
export interface User {
  id: string;
  username: string;
  email: string;
  stripeCustomerId: string | null;
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
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
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
}

export interface PaymentIntentResponse {
  clientSecret: string;
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

// API response types
export interface ApiError {
  message: string;
  statusCode: number;
}
