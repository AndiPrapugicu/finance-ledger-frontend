import React, { useState } from "react";
import type { Account, AccountType } from "../../types";
import { groupAccountsByType } from "../../utils";
import { ChevronDown, ChevronRight, Wallet, CreditCard, TrendingUp, TrendingDown, Landmark, BarChart3 } from "lucide-react";

interface AccountListProps {
  accounts: Account[];
  onAccountClick?: (account: Account) => void;
}

export const AccountList: React.FC<AccountListProps> = ({
  accounts,
  onAccountClick,
}) => {
  const groupedAccounts = groupAccountsByType(accounts);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<Account[]>([]);
  const [expandedAccounts, setExpandedAccounts] = useState<string[]>([]);

  const toggleGroup = (accountType: string) => {
    setExpandedGroups((prev) =>
      prev.includes(accountType)
        ? prev.filter((type) => type !== accountType)
        : [...prev, accountType]
    );
  };

  const toggleAccount = (accountId: string) => {
    setExpandedAccounts((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId]
    );
  };

  const buildBreadcrumbs = (account: Account, allAccounts: Account[]) => {
    const path: Account[] = [];
    let current: Account | undefined = account;
    while (current) {
      path.unshift(current);
      current = current.parent
        ? allAccounts.find((a) => a.id === current?.parent)
        : undefined;
    }
    setBreadcrumbs(path);
  };

  const renderAccountCard = (
    account: Account,
    level = 0,
    allAccounts: Account[] = accounts
  ) => {
    const children = allAccounts.filter((a) => a.parent === account.id);
    const isExpanded = expandedAccounts.includes(account.id.toString());

    const AccountTypeIcon = (() => {
      switch ((account.account_type || '').toUpperCase()) {
        case 'ASSET': return Wallet;
        case 'LIABILITY': return CreditCard;
        case 'INCOME': return TrendingUp;
        case 'EXPENSE': return TrendingDown;
        case 'EQUITY': return Landmark;
        default: return BarChart3;
      }
    })();

    return (
      <div key={account.id} className={`ml-${level * 4}`}>
        <div
          className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
          onClick={() => {
            toggleAccount(account.id.toString());
            buildBreadcrumbs(account, allAccounts);
            onAccountClick?.(account);
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className="mr-3 text-gray-300">
                <AccountTypeIcon className="w-5 h-5" />
              </span>
              {children.length > 0 && (
                <span className="mr-2">
                  {isExpanded ? "▼" : "▶"}
                </span>
              )}
              <h3 className="font-bold text-white text-lg">{account.name}</h3>
            </div>
            <div className="text-right">
              <span
                className={`font-bold text-lg ${
                  parseFloat(account.balance || "0") >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                ${parseFloat(account.balance || "0").toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>{account.account_type.toLowerCase()}</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                account.is_active
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {account.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {isExpanded && children.length > 0 && (
          <div className="mt-2">
            {children.map((child) => renderAccountCard(child, level + 1, allAccounts))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      {breadcrumbs.length > 0 && (
        <div className="text-sm text-gray-600 mb-2">
          {breadcrumbs.map((acc, idx) => (
            <span key={acc.id}>
              {idx > 0 && " > "}
              {acc.name}
            </span>
          ))}
        </div>
      )}

      {/* Account Groups */}
      {Object.entries(groupedAccounts).map(([accountType, typeAccounts]) => {
        const isGroupExpanded = expandedGroups.includes(accountType);

        return (
          <div key={accountType} className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              {accountType.charAt(0).toUpperCase() + accountType.slice(1).toLowerCase()}{" "}
              Accounts
              <span className="ml-3 text-sm font-normal bg-gray-700 px-3 py-1 rounded-full">
                {typeAccounts.length}
              </span>
              <button
                onClick={() => toggleGroup(accountType)}
                className="ml-auto text-gray-400 hover:text-white"
              >
                {isGroupExpanded ? <ChevronDown /> : <ChevronRight />}
              </button>
            </h2>

            {isGroupExpanded && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {typeAccounts.map((account) => renderAccountCard(account))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
