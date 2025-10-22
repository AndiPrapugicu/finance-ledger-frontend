import { useState, useEffect } from 'react';
import { budgetService } from '../services/budgetService';
import type { Budget } from '../services/budgetService';

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedBudgets = await budgetService.getBudgets();
      setBudgets(fetchedBudgets);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch budgets';
      setError(errorMessage);

      // If authentication error, redirect to login or handle accordingly
      if (errorMessage.includes('Authentication required')) {
        // You might want to redirect to login page here
        console.warn('User not authenticated, redirecting to login might be needed');
      }
    } finally {
      setLoading(false);
    }
  };

  const createDefaultBudgets = async () => {
    try {
      setError(null);
      const newBudgets = await budgetService.createDefaultBudgets();
      setBudgets(newBudgets);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create default budgets';
      setError(errorMessage);
    }
  };

  useEffect(() => {
    // Only fetch if we have a token
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      fetchBudgets();
    } else {
      setError('Please log in to view budgets');
      setLoading(false);
    }
  }, []);

  return {
    budgets,
    loading,
    error,
    fetchBudgets,
    createDefaultBudgets,
  };
};