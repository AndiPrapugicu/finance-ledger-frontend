import React from "react";
import type { Account } from "../../types";
import { formatCurrency } from "../../utils";

interface AccountItemProps {
  account: Account;
  onClick?: (account: Account) => void;z
}

export const AccountItem: React.FC<AccountItemProps> = ({
  account,
  onClick,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(account);
    }
  };

  return (
    <div
      className={`
        p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0
        ${onClick ? "cursor-pointer" : ""}
      `}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 flex items-center">
            {account.parent && (
              <span className="ml-6 text-gray-400 mr-2">↳</span>
            )}
            {account.name}
          </h4>
          <p className="text-sm text-gray-500 mt-1">{account.full_name}</p>
        </div>
        <div className="text-right ml-4">
          <p className="font-mono text-lg font-medium text-gray-900">
            {formatCurrency(account.balance)}
          </p>
          <p className="text-xs text-gray-500">ID: {account.id}</p>
        </div>
      </div>
    </div>
  );
};
