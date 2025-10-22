import { useState, useEffect, useCallback } from "react";
import { AccountsService } from "../services";
import type { Account, ApiError } from "../types";

interface UseAccountsReturn {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createFixtures: () => Promise<{ success: boolean; message: string }>;
  getAccountById: (id: number) => Account | undefined;
  totalBalance: number;
}

export const useAccounts = (): UseAccountsReturn => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use new ledger accounts endpoint with real balances
  const groupedData = await AccountsService.getLedgerAccountsGrouped();
      
      // Flatten grouped accounts into a single array for backwards compatibility
      const allAccounts: Account[] = [];
  Object.entries(groupedData.accounts).forEach(([_type, accounts]: [string, any]) => {
        accounts.forEach((acc: any) => {
          allAccounts.push({
            id: acc.id,
            name: acc.name,
            account_type: acc.account_type,
            account_type_display: acc.account_type_display || acc.account_type,
            full_name: acc.full_name || acc.name,
            balance: acc.balance,
            is_active: acc.is_active,
            parent: acc.parent_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        });
      });
      
      setAccounts(allAccounts);
      // Use groupedData.totals.ASSET (sum of asset balances) if provided, else compute from flattened list
      if (groupedData && groupedData.totals && typeof groupedData.totals.ASSET !== 'undefined') {
        setTotalBalance(Number(groupedData.totals.ASSET) || 0);
      } else {
        const computed = allAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance || '0'), 0);
        setTotalBalance(Number(computed) || 0);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
      console.error("Error fetching accounts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAccountById = useCallback(
    (id: number): Account | undefined => {
      return accounts.find((account) => account.id === id);
    },
    [accounts]
  );

  const createFixtures = useCallback(async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
  await AccountsService.createFixtures();
      const successMessage =
        "Sample accounts created successfully!";

      // Refresh accounts after creating fixtures
      await fetchAccounts();

      return { success: true, message: successMessage };
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage =
        apiError.message || "Failed to create sample accounts";
      console.error("Error creating fixtures:", apiError);

      return { success: false, message: errorMessage };
    }
  }, [fetchAccounts]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    loading,
    error,
    totalBalance,
    refetch: fetchAccounts,
    createFixtures,
    getAccountById,
  };
};
