export const API_BASE_URL = "http://127.0.0.1:8000/api";

export const API_ENDPOINTS = {
  // User-specific endpoints (require authentication)
  ACCOUNTS: "/user/accounts/",
  LEDGER_ACCOUNTS: "/accounts/ledger/", // For double-entry transactions
  LEDGER_ACCOUNTS_GROUPED: "/ledger/accounts/grouped/", // NEW: Ledger accounts with real balances grouped by type
  LEDGER_ACCOUNT_DETAIL: (id: number) => `/ledger/accounts/${id}/`, // NEW: Detailed ledger account info
  TRANSACTIONS: "/transactions/ledger/", // Changed to use ledger transactions
  CREATE_TRANSACTION: "/transactions/double-entry/",
  DASHBOARD: "/user/dashboard/",
  REPORTS: "/user/reports/",

  // Wallet endpoints
  WALLET: "/user/wallet/",
  WALLET_SUMMARY: "/user/wallet/summary/",
  WALLET_ADD_FUNDS: "/user/wallet/add-funds/",
  WALLET_TRANSACTIONS: "/user/wallet/transactions/",
  WALLET_TRANSACTIONS_LEDGER: "/user/wallet/transactions/ledger/", // Unified endpoint using LedgerTransaction
  PAYMENT_METHODS: "/user/payment-methods/",
  WALLET_TRANSFER: "/user/wallet/transfer/",

  // Legacy endpoints (some may not require auth)
  LEGACY_TRANSACTIONS: "/transactions/list/",
  ACCOUNT_DETAIL: (id: number) => `/accounts/${id}/`,
  ACCOUNT_HIERARCHY: "/accounts/hierarchy/",
  CREATE_FIXTURES: "/accounts/fixtures/",
  // CREATE_TRANSACTION_FIXTURES: "/transactions/fixtures/", // Not implemented in backend
} as const;
