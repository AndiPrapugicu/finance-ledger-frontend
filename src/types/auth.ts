export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  preferences?: {
    theme: 'light' | 'dark';
    currency: string;
    dateFormat: string;
    notifications: boolean;
  };
  financialSettings?: {
    defaultCurrency: string;
    fiscalYearStart: string;
    budgetAlerts: boolean;
  };
  date_joined: string;
  last_login?: string;
  total_balance?: number;
  total_accounts?: number;
  total_transactions?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthError {
  message: string;
  field?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
}