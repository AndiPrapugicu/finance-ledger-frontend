import React from "react";
import type { Account, AccountType } from "../../types";
import {
  getAccountTypeIcon,
  getAccountTypeColor,
  formatAccountTypeName,
} from "../../utils";
import { AccountItem } from "./AccountItem";

interface AccountGroupProps {
  accountType: string;
  accounts: Account[];
  onAccountClick?: (account: Account) => void;
}

export const AccountGroup: React.FC<AccountGroupProps> = ({
  accountType,
  accounts,
  onAccountClick,
}) => {
  const icon = getAccountTypeIcon(accountType as AccountType);
  const colorClasses = getAccountTypeColor(accountType as AccountType);
  const displayName = formatAccountTypeName(accountType);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className={`p-4 ${colorClasses} border-b`}>
        <h3 className="text-lg font-semibold flex items-center">
          <span className="mr-2 text-xl">{icon}</span>
          {displayName}
          <span className="ml-2 text-sm opacity-75">({accounts.length})</span>
        </h3>
      </div>
      <div>
        {accounts.map((account) => (
          <AccountItem
            key={account.id}
            account={account}
            onClick={onAccountClick}
          />
        ))}
      </div>
    </div>
  );
};
