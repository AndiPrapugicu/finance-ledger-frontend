import axios from "axios";
import type { AxiosResponse } from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../constants";
import type {
  Account,
  CreateAccountRequest,
  AccountsApiResponse,
  ApiError,
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
      config.headers.Authorization = `Token ${token}`;
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

export class AccountsService {
  /**
   * Get all accounts for authenticated user
   */
  static async getAccounts(): Promise<Account[]> {
    const response: AxiosResponse<AccountsApiResponse | Account[]> =
      await apiClient.get(API_ENDPOINTS.ACCOUNTS);

    // Handle both paginated and non-paginated responses
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      return response.data.results || [];
    }
  }

  /**
   * Get account by ID (using legacy endpoint for now)
   */
  static async getAccount(id: number): Promise<Account> {
    const response: AxiosResponse<Account> = await apiClient.get(
      API_ENDPOINTS.ACCOUNT_DETAIL(id)
    );
    return response.data;
  }

  /**
   * Create new account for authenticated user
   */
  static async createAccount(
    accountData: CreateAccountRequest
  ): Promise<Account> {
    const response = await apiClient.post(API_ENDPOINTS.ACCOUNTS, accountData);
    return response.data;
  }

  /**
   * Update account
   */
  static async updateAccount(
    id: number,
    accountData: Partial<CreateAccountRequest>
  ): Promise<Account> {
    const response: AxiosResponse<Account> = await apiClient.put(
      API_ENDPOINTS.ACCOUNT_DETAIL(id),
      accountData
    );
    return response.data;
  }

  /**
   * Delete (deactivate) account
   */
  static async deleteAccount(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ACCOUNT_DETAIL(id));
  }

  /**
   * Get hierarchical account structure
   */
  static async getAccountHierarchy(): Promise<Account[]> {
    const response: AxiosResponse<Account[]> = await apiClient.get(
      API_ENDPOINTS.ACCOUNT_HIERARCHY
    );
    return response.data;
  }

  /**
   * Create sample fixture data
   */
  static async createFixtures(): Promise<AccountsApiResponse> {
    const response: AxiosResponse<AccountsApiResponse> = await apiClient.post(
      API_ENDPOINTS.CREATE_FIXTURES
    );
    return response.data;
  }

  /**
   * Get ledger accounts for double-entry transactions
   */
  static async getLedgerAccounts(): Promise<Account[]> {
    const response: AxiosResponse<Account[]> = await apiClient.get(
      API_ENDPOINTS.LEDGER_ACCOUNTS
    );
    return response.data;
  }
  
  /**
   * Get ledger accounts grouped by type with real balances (NEW)
   */
  static async getLedgerAccountsGrouped(): Promise<any> {
    const response = await apiClient.get(API_ENDPOINTS.LEDGER_ACCOUNTS_GROUPED);
    return response.data;
  }
  
  /**
   * Get detailed ledger account information (NEW)
   */
  static async getLedgerAccountDetail(id: number): Promise<any> {
    const response = await apiClient.get(API_ENDPOINTS.LEDGER_ACCOUNT_DETAIL(id));
    return response.data;
  }
}

export default AccountsService;
