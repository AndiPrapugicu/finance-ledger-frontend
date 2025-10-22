import { useState, useEffect, useCallback } from 'react';
import { financialGoalsService } from '../services/financialGoalsService';
import type { 
  FinancialGoals, 
  UpdateFinancialGoalsRequest 
} from '../services/financialGoalsService';

interface UseFinancialGoalsReturn {
  goals: FinancialGoals | null;
  loading: boolean;
  error: string | null;
  updateGoals: (goals: UpdateFinancialGoalsRequest) => Promise<void>;
  setIncomeGoal: (amount: number) => Promise<void>;
  setExpenseBudget: (amount: number) => Promise<void>;
  toggleIncomeGoal: (enabled: boolean) => Promise<void>;
  toggleBudgetAlerts: (enabled: boolean) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useFinancialGoals = (fetchImmediately = true): UseFinancialGoalsReturn => {
  const [goals, setGoals] = useState<FinancialGoals | null>(null);
  const [loading, setLoading] = useState(fetchImmediately);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financialGoalsService.getFinancialGoals();
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch financial goals');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGoals = async (updatedGoals: UpdateFinancialGoalsRequest) => {
    try {
      setError(null);
      const data = await financialGoalsService.updateFinancialGoals(updatedGoals);
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update financial goals');
      throw err;
    }
  };

  const setIncomeGoal = async (amount: number) => {
    try {
      setError(null);
      const data = await financialGoalsService.setIncomeGoal(amount);
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set income goal');
      throw err;
    }
  };

  const setExpenseBudget = async (amount: number) => {
    try {
      setError(null);
      const data = await financialGoalsService.setExpenseBudget(amount);
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set expense budget');
      throw err;
    }
  };

  const toggleIncomeGoal = async (enabled: boolean) => {
    try {
      setError(null);
      const data = await financialGoalsService.toggleIncomeGoal(enabled);
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle income goal');
      throw err;
    }
  };

  const toggleBudgetAlerts = async (enabled: boolean) => {
    try {
      setError(null);
      const data = await financialGoalsService.toggleBudgetAlerts(enabled);
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle budget alerts');
      throw err;
    }
  };

  useEffect(() => {
    if (fetchImmediately) {
      fetchGoals();
    }
  }, [fetchImmediately, fetchGoals]);

  return {
    goals,
    loading,
    error,
    updateGoals,
    setIncomeGoal,
    setExpenseBudget,
    toggleIncomeGoal,
    toggleBudgetAlerts,
    refetch: fetchGoals,
  };
};