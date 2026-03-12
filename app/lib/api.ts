import {
  User,
  LoginCredentials,
  RegisterData,
  UpdateUserData,
  Product,
  CreateProductData,
  UpdateProductData,
  PaymentIntentRequest,
  PaymentIntentResponse,
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  Plan,
  CreatePlansData,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)["Authorization"] =
        `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "An error occurred");
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // Auth endpoints
  async register(data: RegisterData): Promise<User> {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(
    credentials: LoginCredentials
  ): Promise<{ access_token: string }> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  // User endpoints
  async getUser(id: string): Promise<User> {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    return this.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request(`/users/${id}`, {
      method: "DELETE",
    });
  }

  // Product endpoints
  async getProducts(): Promise<Product[]> {
    return this.request("/products");
  }

  async getProduct(id: string): Promise<Product> {
    return this.request(`/products/${id}`);
  }

  async createProduct(data: CreateProductData): Promise<Product> {
    return this.request("/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: UpdateProductData): Promise<Product> {
    return this.request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    return this.request(`/products/${id}`, {
      method: "DELETE",
    });
  }

  // Order endpoints
  async createPaymentIntent(
    data: PaymentIntentRequest
  ): Promise<PaymentIntentResponse> {
    return this.request("/orders/payment-intent", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createCheckoutSession(
    data: CheckoutSessionRequest
  ): Promise<CheckoutSessionResponse> {
    return this.request("/orders/checkout-session", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Plan endpoints
  async getPlans(): Promise<Plan[]> {
    return this.request("/plans");
  }

  async getPlan(id: string): Promise<Plan> {
    return this.request(`/plans/${id}`);
  }

  async getPlansByProduct(productId: string): Promise<Plan[]> {
    return this.request(`/plans/product/${productId}`);
  }

  async createPlans(data: CreatePlansData): Promise<Plan[]> {
    return this.request("/plans", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
