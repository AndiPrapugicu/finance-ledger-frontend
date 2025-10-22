import { useState,useEffect,useCallback } from "react"; 
import { TransactionsService } from "../services";
import type { Transaction,ApiError } from "../types";

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createFixtures: () => Promise<{ success: boolean; message: string }>;
}

export const useTransactions = (): UseTransactionsReturn => {
  const [transactions,setTransactions] = useState<Transaction[]>([]);
  const [loading,setLoading] = useState<boolean>(true);
  const [error,setError] = useState<string | null>(null);
  
    const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TransactionsService.getTransactions();
      setTransactions(data);
    }
    catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
      console.error("Error fetching transactions:",err);
    }
    finally {
      setLoading(false);
    }
    },[]);
    const createFixtures = useCallback(async (): Promise<{
    success: boolean;
    message: string;
    }> => { 
    try {
      const response = await TransactionsService.createFixtures();
      const successMessage =
        response.message || "Sample transactions created successfully!";
        // Refresh transactions after creating fixtures
        await fetchTransactions();
        return { success: true,message: successMessage };
    }
    catch (err) {
      const apiError = err as ApiError;
      const errorMessage =
        apiError.message || "Failed to create sample transactions";
      console.error("Error creating fixtures:",apiError);
      return { success: false,message: errorMessage };
    }
    },[fetchTransactions]);
    useEffect(() => {
    fetchTransactions();
    },[fetchTransactions]);
    return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    createFixtures,
    };
}