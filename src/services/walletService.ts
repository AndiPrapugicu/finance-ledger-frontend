import axios from "axios";
import type { AxiosResponse } from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../constants";
import type {
  Wallet,
  WalletSummary,
  WalletTransaction,
  PaymentMethod,
  AddFundsRequest,
  AddFundsResponse,
  CreatePaymentMethodRequest,
  ApiError
} from "../types";

// Configure axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError: ApiError = {
      message: "An unknown error occurred",
      status: error.response?.status,
    };

    if (error.response) {
      // Server responded with error status
      apiError.message =
        error.response.data?.message ||
        error.response.data?.error ||
        `API Error ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      // Request made but no response
      apiError.message = "Cannot connect to API server. Is it running?";
    } else {
      // Request setup error
      apiError.message = `Request failed: ${error.message}`;
    }
    return Promise.reject(apiError);
  }
);



export class WalletService {
  /**
   * Get user's wallet details
   */
  static async getWallet(): Promise<Wallet> {
    const response: AxiosResponse<Wallet> = await apiClient.get(
      API_ENDPOINTS.WALLET
    );
    return response.data;
  }

  /**
   * Get wallet summary with statistics
   */
  static async getWalletSummary(): Promise<WalletSummary> {
    const response: AxiosResponse<WalletSummary> = await apiClient.get(
      API_ENDPOINTS.WALLET_SUMMARY
    );
    return response.data;
  }

  /**
   * Add funds to wallet
   */
  static async addFunds(request: AddFundsRequest): Promise<AddFundsResponse> {
    const response: AxiosResponse<AddFundsResponse> = await apiClient.post(
      API_ENDPOINTS.WALLET_ADD_FUNDS,
      request
    );
    return response.data;
  }

  /**
   * Get wallet transactions from unified LedgerTransaction system
   */
  static async getWalletTransactions(): Promise<WalletTransaction[]> {
    const response: AxiosResponse<WalletTransaction[]> = await apiClient.get(
      API_ENDPOINTS.WALLET_TRANSACTIONS_LEDGER
    );
    return response.data || [];
  }

  /**
   * Get payment methods
   */
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response: AxiosResponse<PaymentMethod[]> = await apiClient.get(
      API_ENDPOINTS.PAYMENT_METHODS
    );
    return response.data;
  }

  /**
   * Create payment method
   */
  static async createPaymentMethod(
    request: CreatePaymentMethodRequest
  ): Promise<PaymentMethod> {
    const response: AxiosResponse<PaymentMethod> = await apiClient.post(
      API_ENDPOINTS.PAYMENT_METHODS,
      request
    );
    return response.data;
  }

  /**
   * Update payment method
   */
  static async updatePaymentMethod(
    id: number,
    updates: Partial<CreatePaymentMethodRequest>
  ): Promise<PaymentMethod> {
    const response: AxiosResponse<PaymentMethod> = await apiClient.patch(
      `${API_ENDPOINTS.PAYMENT_METHODS}${id}/`,
      updates
    );
    return response.data;
  }

  /**
   * Delete payment method (soft delete)
   */
  static async deletePaymentMethod(id: number): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.PAYMENT_METHODS}${id}/`);
  }

  /**
   * Set payment method as default
   */
  static async setDefaultPaymentMethod(
    id: number
  ): Promise<{ success: boolean; message: string }> {
    const response: AxiosResponse<{ success: boolean; message: string }> =
      await apiClient.post(
        `${API_ENDPOINTS.PAYMENT_METHODS}${id}/set-default/`
      );
    return response.data;
  }
static async transferFunds(payload: {
  walletId: number;
  destinationAccount: number;
  amount: string;
  description?: string;
  paymentMethod?: number;
}): Promise<{ success: boolean; message: string; new_balance: string }> {
  const response = await apiClient.post(API_ENDPOINTS.WALLET_TRANSFER, payload);
  return response.data;
}
}


export default WalletService;
