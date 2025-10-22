// frontend/src/services/budgetService.ts
import { API_BASE_URL } from '../constants/api';

export interface Budget {
  id: string;
  category: string;
  planned_amount: number;
  actual_amount: number;
  period: string;
  status: "on_track" | "over_budget" | "under_budget";
}

export interface CreateBudgetRequest {
  category: string;
  amount: number;
  period: string;
}

class BudgetService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }

    return {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getBudgets(): Promise<Budget[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/budgets/`, {
        headers: this.getAuthHeaders(),
      });

      if (response.status === 401) {
        throw new Error('Authentication required. Please log in.');
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch budgets: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch budgets');
    }
  }

  async createBudget(budget: CreateBudgetRequest): Promise<Budget> {
    try {
      const response = await fetch(`${API_BASE_URL}/budgets/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(budget),
      });

      if (response.status === 401) {
        throw new Error('Authentication required. Please log in.');
      }

      if (!response.ok) {
        throw new Error(`Failed to create budget: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create budget');
    }
  }

  async deleteBudget(budgetId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/budgets/${budgetId}/`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (response.status === 401) {
        throw new Error('Authentication required. Please log in.');
      }

      if (!response.ok) {
        throw new Error(`Failed to delete budget: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to delete budget');
    }
  }

  async createDefaultBudgets(): Promise<Budget[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/budgets/create-defaults/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (response.status === 401) {
        throw new Error('Authentication required. Please log in.');
      }

      if (!response.ok) {
        throw new Error(`Failed to create default budgets: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create default budgets');
    }
  }
}

export const budgetService = new BudgetService();