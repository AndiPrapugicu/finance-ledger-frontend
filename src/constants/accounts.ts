import type { AccountType } from "../types";

export const ACCOUNT_TYPE_ICONS: Record<AccountType, string> = {
  ASSET: "💰",
  LIABILITY: "💳",
  EQUITY: "🏦",
  INCOME: "💵",
  EXPENSE: "💸",
};

export const ACCOUNT_TYPE_COLORS: Record<AccountType, string> = {
  ASSET: "text-green-600 bg-green-50",
  LIABILITY: "text-red-600 bg-red-50",
  EQUITY: "text-blue-600 bg-blue-50",
  INCOME: "text-purple-600 bg-purple-50",
  EXPENSE: "text-orange-600 bg-orange-50",
};
