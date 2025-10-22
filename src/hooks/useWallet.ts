import { useState, useEffect, useCallback } from "react";
import { WalletService } from "../services";
import type { 
  Wallet, 
  WalletSummary, 
  WalletTransaction, 
  PaymentMethod,
  AddFundsRequest,
  CreatePaymentMethodRequest,
  ApiError 
} from "../types";

interface UseWalletReturn {
  // Wallet data
  wallet: Wallet | null;
  walletSummary: WalletSummary | null;
  transactions: WalletTransaction[];
  paymentMethods: PaymentMethod[];
  
  // Loading states
  loading: boolean;
  transactionsLoading: boolean;
  paymentMethodsLoading: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  refetchWallet: () => Promise<void>;
  refetchSummary: () => Promise<void>;
  refetchTransactions: () => Promise<void>;
  refetchPaymentMethods: () => Promise<void>;
  addFunds: (request: AddFundsRequest) => Promise<{ success: boolean; message: string }>;
  createPaymentMethod: (request: CreatePaymentMethodRequest) => Promise<{ success: boolean; message: string }>;
  deletePaymentMethod: (id: number) => Promise<{ success: boolean; message: string }>;
  setDefaultPaymentMethod: (id: number) => Promise<{ success: boolean; message: string }>;
}

export const useWallet = (): UseWalletReturn => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [transactionsLoading, setTransactionsLoading] = useState<boolean>(false);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await WalletService.getWallet();
      setWallet(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
      console.error("Error fetching wallet:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWalletSummary = useCallback(async () => {
    try {
      setError(null);
      const data = await WalletService.getWalletSummary();
      setWalletSummary(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
      console.error("Error fetching wallet summary:", err);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      setTransactionsLoading(true);
      setError(null);
      const data = await WalletService.getWalletTransactions();
      setTransactions(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
      console.error("Error fetching wallet transactions:", err);
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setPaymentMethodsLoading(true);
      setError(null);
      const data = await WalletService.getPaymentMethods();
      setPaymentMethods(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
      console.error("Error fetching payment methods:", err);
    } finally {
      setPaymentMethodsLoading(false);
    }
  }, []);

  const addFunds = useCallback(async (request: AddFundsRequest): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      const response = await WalletService.addFunds(request);
      // Refresh wallet data after adding funds
      await Promise.all([fetchWallet(), fetchWalletSummary(), fetchTransactions()]);
      return { success: true, message: response.message };
    } catch (err) {
      const apiError = err as ApiError;
      console.error("Error adding funds:", apiError);
      return { success: false, message: apiError.message };
    }
  }, [fetchWallet, fetchWalletSummary, fetchTransactions]);

  const createPaymentMethod = useCallback(async (request: CreatePaymentMethodRequest): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      await WalletService.createPaymentMethod(request);
      // Refresh payment methods after creating
      await fetchPaymentMethods();
      return { success: true, message: "Payment method added successfully!" };
    } catch (err) {
      const apiError = err as ApiError;
      console.error("Error creating payment method:", apiError);
      return { success: false, message: apiError.message };
    }
  }, [fetchPaymentMethods]);

  const deletePaymentMethod = useCallback(async (id: number): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      await WalletService.deletePaymentMethod(id);
      // Refresh payment methods after deleting
      await fetchPaymentMethods();
      return { success: true, message: "Payment method removed successfully!" };
    } catch (err) {
      const apiError = err as ApiError;
      console.error("Error deleting payment method:", apiError);
      return { success: false, message: apiError.message };
    }
  }, [fetchPaymentMethods]);

  const setDefaultPaymentMethod = useCallback(async (id: number): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      const response = await WalletService.setDefaultPaymentMethod(id);
      // Refresh payment methods after setting default
      await fetchPaymentMethods();
      return { success: true, message: response.message };
    } catch (err) {
      const apiError = err as ApiError;
      console.error("Error setting default payment method:", apiError);
      return { success: false, message: apiError.message };
    }
  }, [fetchPaymentMethods]);

  // Initial data fetch
  useEffect(() => {
    fetchWallet();
    fetchWalletSummary();
  }, [fetchWallet, fetchWalletSummary]);

  return {
    // Data
    wallet,
    walletSummary,
    transactions,
    paymentMethods,
    
    // Loading states
    loading,
    transactionsLoading,
    paymentMethodsLoading,
    
    // Error state
    error,
    
    // Actions
    refetchWallet: fetchWallet,
    refetchSummary: fetchWalletSummary,
    refetchTransactions: fetchTransactions,
    refetchPaymentMethods: fetchPaymentMethods,
    addFunds,
    createPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
  };
};