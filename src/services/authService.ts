import type {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from "../types/auth";

const API_BASE_URL = "https://ledger-backend-6i6b.onrender.com/api";

class AuthService {
  private getAuthHeaders() {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Token ${token}` }),
    };
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();

    // Clear any previous user's cache before storing new token
    this.clearUserCache();

    // Store token in localStorage
    localStorage.setItem("authToken", data.token);

    return data;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    // Add password confirmation for backend validation
    const requestData = {
      ...userData,
      password_confirm: userData.password,
    };

    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    const data = await response.json();

    // Clear any previous cache before storing new token
    this.clearUserCache();

    // Store token in localStorage
    localStorage.setItem("authToken", data.token);

    return data;
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: "POST",
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always remove token from localStorage
      localStorage.removeItem("authToken");
      // Clear any cached data to prevent data leakage between users
      this.clearUserCache();
    }
  }

  private clearUserCache(): void {
    // Clear any cached data that might persist between users
    // Remove any localStorage items that might contain user-specific data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.includes("user") ||
          key.includes("account") ||
          key.includes("transaction") ||
          key.includes("report") ||
          key.includes("cache"))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }

  clearCache(): void {
    this.clearUserCache();
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    return response.json();
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Profile update failed");
    }

    return response.json();
  }

  getStoredToken(): string | null {
    return localStorage.getItem("authToken");
  }

  isTokenValid(): boolean {
    const token = this.getStoredToken();
    if (!token) return false;

    try {
      // Django tokens are typically 40 character hex strings
      return token.length >= 20 && token.length <= 80; // Simple check for token length
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
