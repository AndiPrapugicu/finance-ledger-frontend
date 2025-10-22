import React, { useState } from "react";
import {
  ArrowUpDown,
  Plus,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Filter,
} from "lucide-react";
import { NavigationSidebar } from "../components/NavigationSidebar";
import { useTransactions, useToast } from "../hooks";
import { LoadingSpinner, ErrorAlert } from "../components";
import TransactionForm from "../components/TransactionForm";

const Transactions: React.FC = () => {
  const { transactions, loading, error, refetch, createFixtures } =
    useTransactions();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  );

  // filtre
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );
  const [startDate, setStartDate] = useState<string>(""); // format YYYY-MM-DD
  const [endDate, setEndDate] = useState<string>("");
  const [minAmount, setMinAmount] = useState<number | "">("");
  const [maxAmount, setMaxAmount] = useState<number | "">("");
  const [searchText, setSearchText] = useState<string>("");

  const handleCreateFixtures = async () => {
    const result = await createFixtures();
    if (result.success) {
      showToast(result.message, "success");
    } else {
      showToast(result.message, "error");
    }
  };

  const handleRefresh = async () => {
    await refetch();
    showToast("Transactions refreshed successfully!", "success");
  };

  const getTransactionAmount = (
    splits: { amount: string; accountId: number; accountType?: string }[]
  ) => {
    // Determine transaction type based on account types involved
    const hasExpenseAccount = splits.some(
      (split) => split.accountType === "EXPENSE"
    );
    const hasIncomeAccount = splits.some(
      (split) => split.accountType === "INCOME"
    );

    if (hasExpenseAccount) {
      // This is an expense transaction - find the ASSET split (usually negative) and show as negative
      const assetSplit = splits.find((split) => split.accountType === "ASSET");
      if (assetSplit) {
        // If ASSET split is negative, show it as negative (expense)
        // If ASSET split is positive, make it negative for display
        const amount = parseFloat(assetSplit.amount);
        return amount < 0 ? amount : -Math.abs(amount);
      }
      // Fallback: find the expense split and show as negative
      const expenseSplit = splits.find(
        (split) => split.accountType === "EXPENSE"
      );
      return expenseSplit ? -Math.abs(parseFloat(expenseSplit.amount)) : 0;
    } else if (hasIncomeAccount) {
      // This is an income transaction - find the positive amount and keep it positive
      const assetSplit = splits.find(
        (split) => split.accountType === "ASSET" && parseFloat(split.amount) > 0
      );
      return assetSplit ? Math.abs(parseFloat(assetSplit.amount)) : 0;
    }

    // Fallback: for old transactions without accountType info
    // If there's both positive and negative splits, it's likely an expense transaction
    const expenseSplit = splits.find((split) => parseFloat(split.amount) < 0);
    const incomeSplit = splits.find((split) => parseFloat(split.amount) > 0);

    if (expenseSplit && incomeSplit) {
      // Both positive and negative splits - this is an expense transaction
      // Show the absolute value of the positive split but make it negative for display
      return -Math.abs(parseFloat(incomeSplit.amount));
    } else if (incomeSplit) {
      // Only positive splits - likely income
      return parseFloat(incomeSplit.amount);
    } else if (expenseSplit) {
      // Only negative splits
      return parseFloat(expenseSplit.amount);
    }

    return splits.reduce((sum, split) => sum + parseFloat(split.amount), 0);
  };

  const getTransactionIcon = (
    splits: { amount: string; accountId: number; accountType?: string }[]
  ) => {
    // Use account type to determine transaction type
    const hasExpenseAccount = splits.some(
      (split) => split.accountType === "EXPENSE"
    );
    return hasExpenseAccount ? ArrowDownLeft : ArrowUpRight;
  };

  const getTransactionColor = (
    splits: { amount: string; accountId: number; accountType?: string }[]
  ) => {
    // Use account type to determine transaction type
    const hasExpenseAccount = splits.some(
      (split) => split.accountType === "EXPENSE"
    );
    return hasExpenseAccount ? "text-red-400" : "text-green-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <LoadingSpinner message="Loading transactions..." />
      </div>
    );
  }
  const filteredTransactions = transactions.filter((transaction) => {
    const hasExpenseAccount = transaction.splits.some(
      (split) => split.accountType === "EXPENSE"
    );
    // Type filter
    if (filterType === "income" && hasExpenseAccount) return false;
    if (filterType === "expense" && !hasExpenseAccount) return false;

    // Account filter
    if (selectedAccountId && transaction.account_id !== selectedAccountId)
      return false;

    // Date filter
    const txDate = new Date(transaction.date);
    if (startDate && txDate < new Date(startDate)) return false;
    if (endDate && txDate > new Date(endDate)) return false;

    // Amount filter
    const amount = getTransactionAmount(transaction.splits);
    if (minAmount !== "" && amount < minAmount) return false;
    if (maxAmount !== "" && amount > maxAmount) return false;

    // Search filter
    if (
      searchText &&
      !transaction.desc.toLowerCase().includes(searchText.toLowerCase())
    )
      return false;

    return true;
  });
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full px-6 py-6">
        <header className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <ArrowUpDown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Transaction Management
              </h1>
              <p className="text-gray-400">
                Track and manage your financial transactions
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-2">
            <NavigationSidebar />
          </div>

          <div className="col-span-10">
            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-800 rounded-lg p-1 flex">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      filterType === "all"
                        ? "bg-purple-600 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterType("income")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      filterType === "income"
                        ? "bg-green-600 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    Income
                  </button>
                  <button
                    onClick={() => setFilterType("expense")}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      filterType === "expense"
                        ? "bg-red-600 text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    Expenses
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleRefresh}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Transaction</span>
                </button>
                <button
                  onClick={handleCreateFixtures}
                  className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-lg transition-all hover:from-orange-700 hover:to-red-700"
                >
                  Create Test Data
                </button>
              </div>
            </div>
            {/* Filters Panel */}
            <div className="mb-6">
              <div className="mb-4 flex flex-wrap gap-4 items-end">
                <select
                  value={selectedAccountId || ""}
                  onChange={(e) =>
                    setSelectedAccountId(Number(e.target.value) || null)
                  }
                  className="bg-gray-700 text-white p-2 rounded"
                >
                  <option value="">All Accounts</option>
                  {transactions.map((t) => {
                    // Get the main account name from splits (usually the ASSET account)
                    const mainAccount = t.splits?.find(
                      (split) => split.accountType === "ASSET"
                    );
                    const accountName =
                      mainAccount?.accountName || "Unknown Account";
                    return (
                      <option key={t.account_id} value={t.account_id}>
                        {accountName}
                      </option>
                    );
                  })}
                </select>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-gray-700 text-white p-2 rounded"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-gray-700 text-white p-2 rounded"
                  placeholder="End Date"
                />

                <input
                  type="number"
                  value={minAmount}
                  onChange={(e) =>
                    setMinAmount(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="bg-gray-700 text-white p-2 rounded"
                  placeholder="Min Amount"
                />
                <input
                  type="number"
                  value={maxAmount}
                  onChange={(e) =>
                    setMaxAmount(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="bg-gray-700 text-white p-2 rounded"
                  placeholder="Max Amount"
                />

                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="bg-gray-700 text-white p-2 rounded"
                  placeholder="Search Description"
                />

                <button
                  onClick={() => {
                    setSelectedAccountId(null);
                    setStartDate("");
                    setEndDate("");
                    setMinAmount("");
                    setMaxAmount("");
                    setSearchText("");
                  }}
                  className="bg-red-600 px-3 py-2 rounded text-white hover:bg-red-700"
                >
                  Clear Filters
                </button>
              </div>
            </div>
            {error && <ErrorAlert message={error} onRetry={refetch} />}

            {showForm && (
              <div className="bg-gray-800 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Transaction
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <TransactionForm />
              </div>
            )}

            {filteredTransactions.length === 0 && !error ? (
              <div className="bg-gray-800 rounded-xl p-8 text-center">
                <ArrowUpDown className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No transactions found
                </h3>
                <p className="text-gray-400 mb-4">
                  {filterType === "all"
                    ? "Create your first transaction to get started"
                    : `No ${filterType} transactions found`}
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg"
                >
                  Create Transaction
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">
                          Total Transactions
                        </p>
                        <p className="text-3xl font-bold">
                          {transactions.length}
                        </p>
                      </div>
                      <ArrowUpDown className="w-8 h-8 opacity-80" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">
                          Income
                        </p>
                        <p className="text-3xl font-bold">
                          {
                            transactions.filter((t) =>
                              t.splits.some(
                                (split) => split.accountType === "INCOME"
                              )
                            ).length
                          }
                        </p>
                      </div>
                      <ArrowUpRight className="w-8 h-8 opacity-80" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100 text-sm font-medium">
                          Expenses
                        </p>
                        <p className="text-3xl font-bold">
                          {
                            transactions.filter((t) =>
                              t.splits.some(
                                (split) => split.accountType === "EXPENSE"
                              )
                            ).length
                          }
                        </p>
                      </div>
                      <ArrowDownLeft className="w-8 h-8 opacity-80" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">
                          Net Amount
                        </p>
                        <p className="text-3xl font-bold">
                          $
                          {transactions
                            .reduce(
                              (sum, t) => sum + getTransactionAmount(t.splits),
                              0
                            )
                            .toLocaleString()}
                        </p>
                      </div>
                      <Calendar className="w-8 h-8 opacity-80" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <Filter className="w-6 h-6 mr-3 text-purple-400" />
                    {filterType === "all"
                      ? "All Transactions"
                      : filterType === "income"
                      ? "Income Transactions"
                      : "Expense Transactions"}
                    <span className="ml-3 text-sm font-normal bg-gray-700 px-3 py-1 rounded-full">
                      {filteredTransactions.length}
                    </span>
                  </h2>

                  <div className="space-y-4">
                    {filteredTransactions.map((transaction) => {
                      const amount = getTransactionAmount(transaction.splits);
                      return (
                        <div
                          key={transaction.id}
                          className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition-all duration-300"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {React.createElement(
                                getTransactionIcon(transaction.splits),
                                {
                                  className: `w-6 h-6 ${getTransactionColor(
                                    transaction.splits
                                  )}`,
                                }
                              )}
                              <div>
                                <h3 className="text-white font-semibold">
                                  {transaction.desc}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                  {transaction.splits?.find(
                                    (split) => split.accountType === "ASSET"
                                  )?.accountName || "Unknown Account"}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <p
                                className={`text-lg font-bold ${getTransactionColor(
                                  transaction.splits
                                )}`}
                              >
                                {amount >= 0 ? "+" : ""}$
                                {Math.abs(amount).toLocaleString()}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {transaction.date}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
