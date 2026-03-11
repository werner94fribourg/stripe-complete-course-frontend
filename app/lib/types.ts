// User types
export interface User {
  id: string;
  username: string;
  email: string;
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

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
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
export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface PaymentIntentRequest {
  orderId: string;
  userId: string;
  items: OrderItem[];
}

export interface PaymentIntentResponse {
  clientSecret: string;
}

// API response types
export interface ApiError {
  message: string;
  statusCode: number;
}
