import axios from "axios";
import type { AxiosResponse } from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../constants";
import type {
  Transaction,
  CreateTransactionRequest,
  ApiError,
  TransactionsApiResponse,
} from "../types";

interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

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
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Token ${token}`;
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
        }
        else if (error.request) {
            // Request made but no response
            apiError.message = "Cannot connect to API server. Is it running?";
        } else {
            // Request setup error
            apiError.message = `Request failed: ${error.message}`;
        }
        return Promise.reject(apiError);
    }
);
export class TransactionsService {
    /**
     * Get all transactions
     */
    static async getTransactions(): Promise<Transaction[]> {
        const response: AxiosResponse<PaginatedResponse<Transaction>> = await apiClient.get(
            API_ENDPOINTS.TRANSACTIONS
        );
        // Handle paginated response from backend
        return response.data.results || [];
    }
    /**
     * Get transaction by ID
     */
    static async getTransaction(id: number): Promise<Transaction> {
        const response: AxiosResponse<Transaction> = await apiClient.get(
            `${API_ENDPOINTS.TRANSACTIONS}${id}/`
        );
        return response.data;
    }
    static async createFixtures(): Promise<TransactionsApiResponse> {
        // Transaction fixtures not implemented in backend
        return Promise.reject({
            message: "Transaction fixtures creation is not implemented yet",
            status: 501
        } as ApiError);
    }
    /**
     * Create a new transaction
     */ 
    static async createTransaction(
        payload: CreateTransactionRequest
    ): Promise<Transaction> {
        const response: AxiosResponse<Transaction> = await apiClient.post(
            API_ENDPOINTS.CREATE_TRANSACTION,
            payload
        );
        return response.data;
    }
    /**
     * Delete transaction by ID
     */
    static async deleteTransaction(id: number): Promise<void> {
        await apiClient.delete(`${API_ENDPOINTS.TRANSACTIONS}${id}/`);
    }
    /**
     * Update transaction by ID
     */
    static async updateTransaction( 
        id: number,
        payload: Partial<CreateTransactionRequest>
    ): Promise<Transaction> {
        const response: AxiosResponse<Transaction> = await apiClient.put(
            `${API_ENDPOINTS.TRANSACTIONS}${id}/`,
            payload
        );
        return response.data;
    }
}
export default TransactionsService;