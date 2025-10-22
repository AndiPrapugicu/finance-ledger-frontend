export interface Wallet {
  id: number;
  balance: string;
  currency: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  recent_transactions?: WalletTransaction[];
  payment_methods?: PaymentMethod[];
}

export interface PaymentMethod {
  id: number;
  name: string;
  payment_type: 'card' | 'bank' | 'paypal' | 'crypto';
  last_four_digits: string;
  is_default: boolean;
  is_active: boolean;
  card_brand?: string;
  expires_month?: number;
  expires_year?: number;
  created_at: string;
}

export interface WalletTransaction {
  id: string;
  transaction_type: 'deposit' | 'withdrawal' | 'expense' | 'income' | 'refund';
  amount: string;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  balance_after: string;
  payment_method?: number;
  payment_method_name?: string;
  related_transaction_id?: string;
  created_at: string;
  processed_at?: string;
}

export interface WalletSummary {
  balance: string;
  currency: string;
  total_deposits: string;
  total_withdrawals: string;
  payment_methods_count: number;
  recent_transactions: WalletTransaction[];
  wallet_created: string;
  last_transaction?: string;
}

export interface AddFundsRequest {
  amount: string;
  description?: string;
  payment_method_id?: number;
}

export interface CreatePaymentMethodRequest {
  name: string;
  payment_type: 'card' | 'bank' | 'paypal' | 'crypto';
  last_four_digits?: string;
  is_default?: boolean;
  card_brand?: string;
  expires_month?: number;
  expires_year?: number;
}

export interface AddFundsResponse {
  success: boolean;
  message: string;
  new_balance: string;
  transaction_id?: string;
}
export interface WalletTransferRequest {
  walletId: number;
  destinationAccount: number;
  amount: string;
  description?: string;
  paymentMethod?: number;
}

export interface WalletTransferResponse {
  success: boolean;
  message: string;
  new_balance: string;
  transaction_id: string;
}