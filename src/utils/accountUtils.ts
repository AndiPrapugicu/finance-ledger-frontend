import type { Account, AccountType, GroupedAccounts } from "../types";
import { ACCOUNT_TYPE_ICONS, ACCOUNT_TYPE_COLORS } from "../constants";

/**
 * Format currency amount
 */
export const formatCurrency = (amount: string | number): string => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numAmount);
};

/**
 * Get icon for account type
 */
export const getAccountTypeIcon = (accountType: AccountType): string => {
  return ACCOUNT_TYPE_ICONS[accountType] || "📁";
};

/**
 * Get color classes for account type
 */
export const getAccountTypeColor = (accountType: AccountType): string => {
  return ACCOUNT_TYPE_COLORS[accountType] || "text-gray-600 bg-gray-50";
};

/**
 * Group accounts by type
 */
export const groupAccountsByType = (accounts: Account[]): GroupedAccounts => {
  return accounts.reduce((acc, account) => {
    if (!acc[account.account_type]) {
      acc[account.account_type] = [];
    }
    acc[account.account_type].push(account);
    return acc;
  }, {} as GroupedAccounts);
};

/**
 * Format account type display name
 */
export const formatAccountTypeName = (type: string): string => {
  return type.charAt(0) + type.slice(1).toLowerCase();
};
