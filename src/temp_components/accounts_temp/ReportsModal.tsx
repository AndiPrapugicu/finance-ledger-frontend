import React from "react";
import { formatCurrency, getAccountTypeIcon } from "../../utils";
import type { Account } from "../../types";
import { Button, Card } from "../../components/ui";

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
}

export const ReportsModal: React.FC<ReportsModalProps> = ({
  isOpen,
  onClose,
  accounts,
}) => {
  if (!isOpen) return null;

  console.log(
    "📊 ReportsModal is rendering! isOpen:",
    isOpen,
    "accounts:",
    accounts.length
  );

  // Calculate summary statistics
  const summary = accounts.reduce(
    (acc, account) => {
      const balance = parseFloat(account.balance);
      switch (account.account_type) {
        case "ASSET":
          acc.assets += balance;
          break;
        case "LIABILITY":
          acc.liabilities += balance;
          break;
        case "INCOME":
          acc.income += balance;
          break;
        case "EXPENSE":
          acc.expenses += balance;
          break;
        case "EQUITY":
          acc.equity += balance;
          break;
      }
      return acc;
    },
    {
      assets: 0,
      liabilities: 0,
      income: 0,
      expenses: 0,
      equity: 0,
    }
  );

  const netWorth = summary.assets - summary.liabilities;

  const reportItems = [
    {
      label: "Assets",
      value: summary.assets,
      icon: "💰",
      color: "text-green-600",
    },
    {
      label: "Liabilities",
      value: summary.liabilities,
      icon: "💳",
      color: "text-red-600",
    },
    {
      label: "Net Worth",
      value: netWorth,
      icon: "📊",
      color: netWorth >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      label: "Income",
      value: summary.income,
      icon: "💵",
      color: "text-purple-600",
    },
    {
      label: "Expenses",
      value: summary.expenses,
      icon: "💸",
      color: "text-orange-600",
    },
    {
      label: "Equity",
      value: summary.equity,
      icon: "🏦",
      color: "text-blue-600",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              📊 Financial Reports
            </h2>
            <p className="text-gray-600">Overview of your financial position</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {reportItems.map((item) => (
              <div
                key={item.label}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{item.icon}</span>
                    <span className="font-medium text-gray-900">
                      {item.label}
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${item.color}`}>
                    {formatCurrency(item.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Account Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Account Details ({accounts.length} accounts)
            </h3>
            <div className="space-y-2">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-3">
                      {getAccountTypeIcon(account.account_type)}
                    </span>
                    <div>
                      <span className="font-medium text-gray-900">
                        {account.name}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({account.account_type_display})
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-medium text-gray-900">
                    {formatCurrency(account.balance)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button
              variant="success"
              onClick={() => {
                // TODO: Implement export functionality
                alert("Export functionality coming in D7-D9!");
              }}
              className="flex-1"
            >
              📄 Export Report
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
