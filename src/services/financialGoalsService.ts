import axios from 'axios';
import { API_BASE_URL } from '../constants/api';

export interface FinancialGoals {
  monthly_income_goal: number;
  monthly_expense_budget: number;
  currency: string;
  income_goal_enabled: boolean;
  budget_alerts_enabled: boolean;
}

export interface UpdateFinancialGoalsRequest {
  monthly_income_goal?: number;
  monthly_expense_budget?: number;
  currency?: string;
  income_goal_enabled?: boolean;
  budget_alerts_enabled?: boolean;
}

// Configure axios instance with auth interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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
    if (error.response?.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class FinancialGoalsService {
  private baseURL = '/user/financial-goals/';

  /**
   * Get user's financial goals
   */
  async getFinancialGoals(): Promise<FinancialGoals> {
    const response = await apiClient.get(this.baseURL);
    return response.data;
  }

  /**
   * Update user's financial goals
   */
  async updateFinancialGoals(goals: UpdateFinancialGoalsRequest): Promise<FinancialGoals> {
    const response = await apiClient.patch(this.baseURL, goals);
    return response.data;
  }

  /**
   * Set monthly income goal
   */
  async setIncomeGoal(amount: number): Promise<FinancialGoals> {
    return this.updateFinancialGoals({ monthly_income_goal: amount });
  }

  /**
   * Set monthly expense budget
   */
  async setExpenseBudget(amount: number): Promise<FinancialGoals> {
    return this.updateFinancialGoals({ monthly_expense_budget: amount });
  }

  /**
   * Toggle income goal tracking
   */
  async toggleIncomeGoal(enabled: boolean): Promise<FinancialGoals> {
    return this.updateFinancialGoals({ income_goal_enabled: enabled });
  }

  /**
   * Toggle budget alerts
   */
  async toggleBudgetAlerts(enabled: boolean): Promise<FinancialGoals> {
    return this.updateFinancialGoals({ budget_alerts_enabled: enabled });
  }
}

export const financialGoalsService = new FinancialGoalsService();