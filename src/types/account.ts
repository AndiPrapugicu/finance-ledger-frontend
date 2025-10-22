export interface Account {
  id: number;
  name: string;
  account_type: AccountType;
  account_type_display: string;
  parent: number | null;
  balance: string;
  is_active: boolean;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export type AccountType =
  | "ASSET"
  | "LIABILITY"
  | "EQUITY"
  | "INCOME"
  | "EXPENSE";

export interface LedgerAccount {
  id: number;
  name: string;
  account_type: AccountType;
  parent: number | null;
  is_active: boolean;
}

export interface CreateAccountRequest {
  name: string;
  account_type: AccountType;
  parent?: number | null;
  is_active?: boolean;
}

export interface AccountsApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
  total_pages: number;
  results: Account[];
}

export interface GroupedAccounts {
  [key: string]: Account[];
}

export interface ApiError {
  message: string;
  status?: number;
}
