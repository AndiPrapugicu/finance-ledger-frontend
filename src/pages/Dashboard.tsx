import React, { useState, useEffect, useCallback } from "react";
import {
  Gem,
  House,
  User,
  Car,
  BarChart3,
  FileSpreadsheet,
  Settings,
} from "lucide-react";
import { NavigationSidebar } from "../components/NavigationSidebar";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorAlert } from "../components/ui/ErrorAlert";
import {
  LineChart,
  BarChart,
  PieChart,
  DoughnutChart,
  chartTheme,
} from "../components/charts";
import { FinancialGoalsSettings } from "../components/FinancialGoalsSettings";
import { useAuth } from "../hooks/useAuth";
import { API_BASE_URL } from "../constants/api";

interface DashboardData {
  total_accounts: number;
  total_transactions: number;
  total_balance: number;
  total_net_worth?: number;
  account_summary: Array<{
    account_type: string;
    count: number;
    balance: number;
  }>;
  recent_transactions: Array<{
    id: string;
    description: string;
    date: string;
    is_reconciled: boolean;
  }>;
  monthly_summary: Array<{
    month: string;
    income: number;
    expenses: number;
    net: number;
  }>;
  wallet?: {
    balance: number;
    currency: string;
    available_balance: number;
  };
  financial_goals?: {
    income_goal: number;
    monthly_budget: number;
    monthly_income: number;
    monthly_expenses: number;
    income_progress_percentage: number;
    expense_progress_percentage: number;
    remaining_income_needed: number;
    remaining_budget: number;
    // New financial metrics
    savings_rate: number;
    monthly_savings: number;
    ytd_income: number;
    ytd_expenses: number;
    ytd_net: number;
    budget_variance: number;
    budget_variance_percentage: number;
    income_variance: number;
    income_variance_percentage: number;
  };
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [showGoalsSettings, setShowGoalsSettings] = useState<boolean>(false);

  const { token, isAuthenticated } = useAuth();

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Token ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/user/dashboard/`, {
        headers,
      });

    if (!response.ok) {
      let errMsg = "";
      try {
        const errData = await response.json();
        errMsg = JSON.stringify(errData);
      } catch {
        errMsg = await response.text();
      }
      throw new Error(`Dashboard fetch failed: ${response.status} ${errMsg}`);
    }

      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchDashboardData();
    }
  }, [isAuthenticated, token, fetchDashboardData]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Generate chart data from API data
  const getIncomeExpensesData = () => {
    if (!data?.monthly_summary) return null;

    const last6Months = data.monthly_summary.slice(-6);
    return {
      labels: last6Months.map((month) => month.month),
      datasets: [
        {
          label: "Income",
          data: last6Months.map((month) => month.income),
          borderColor: chartTheme.colors.success,
          backgroundColor: "rgba(16, 185, 129, 0.1)", // emerald with opacity
          fill: true,
          tension: 0.4,
        },
        {
          label: "Expenses",
          data: last6Months.map((month) => Math.abs(month.expenses)),
          borderColor: chartTheme.colors.danger,
          backgroundColor: "rgba(239, 68, 68, 0.1)", // red with opacity
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const getAccountTypesData = () => {
    if (!data?.account_summary) return null;

    return {
      labels: data.account_summary.map(
        (acc) =>
          acc.account_type.charAt(0).toUpperCase() + acc.account_type.slice(1)
      ),
      datasets: [
        {
          label: "Account Balances",
          data: data.account_summary.map((acc) => Math.abs(acc.balance)),
          backgroundColor: chartTheme.palettes.accountTypes.slice(
            0,
            data.account_summary.length
          ),
          borderColor: chartTheme.palettes.accountTypes.slice(
            0,
            data.account_summary.length
          ),
          borderWidth: 2,
        },
      ],
    };
  };

  const getSpendingCategoriesData = () => {
    if (!data?.account_summary) return null;

    // Use real account data instead of hardcoded values
    const accountTypes = data.account_summary.slice(0, 5);
    const labels = accountTypes.map(
      (account) =>
        account.account_type.charAt(0).toUpperCase() +
        account.account_type.slice(1)
    );
    const amounts = accountTypes.map((account) => Math.abs(account.balance));

    return {
      labels: labels,
      datasets: [
        {
          label: "Account Balances",
          data: amounts,
          backgroundColor: chartTheme.palettes.categories.slice(
            0,
            accountTypes.length
          ),
          borderColor: chartTheme.palettes.categories.slice(
            0,
            accountTypes.length
          ),
          borderWidth: 2,
        },
      ],
    };
  };

  const getSpendingBreakdownData = () => {
    if (!data?.account_summary) return null;

    // Show all account types for spending breakdown, not just expenses
    const accountsForChart = data.account_summary.filter(
      (account) =>
        account.balance > 0 &&
        account.account_type.toLowerCase() !== "liability"
    );

    if (accountsForChart.length === 0) return null;

    const labels = accountsForChart.map(
      (account) =>
        account.account_type.charAt(0).toUpperCase() +
        account.account_type.slice(1)
    );
    const amounts = accountsForChart.map((account) => account.balance);

    return {
      labels: labels,
      datasets: [
        {
          label: "Account Breakdown",
          data: amounts,
          backgroundColor: [
            chartTheme.colors.danger,
            chartTheme.colors.warning,
            chartTheme.colors.info,
            chartTheme.colors.secondary,
            chartTheme.colors.success,
          ].slice(0, accountsForChart.length),
          borderColor: Array(accountsForChart.length).fill("#1f2937"),
          borderWidth: 2,
        },
      ],
    };
  };

  const getMonthlyTrendsData = () => {
    if (!data?.monthly_summary) return null;

    const last12Months = data.monthly_summary.slice(-12);
    return {
      labels: last12Months.map((month) => month.month),
      datasets: [
        {
          label: "Net Income",
          data: last12Months.map((month) => month.net),
          backgroundColor: last12Months.map((month) =>
            month.net >= 0
              ? chartTheme.colors.success
              : chartTheme.colors.danger
          ),
          borderColor: last12Months.map((month) =>
            month.net >= 0
              ? chartTheme.colors.success
              : chartTheme.colors.danger
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="w-full mx-auto">
          <ErrorAlert message={error} onRetry={fetchDashboardData} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full px-6 py-6">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">FL</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Personal Finance Ledger
              </h1>
              <p className="text-gray-400">Available Balance</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white">
              <span className="text-gray-400 text-sm">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          {/* Navigation Sidebar */}
          <div className="col-span-2">
            <NavigationSidebar
              quickStats={{
                accounts: data?.total_accounts || 0,
                transactions: data?.total_transactions || 0,
                balance: formatCurrency(data?.total_balance || 0),
              }}
            />
          </div>

          {/* Main Content */}
          <div className="col-span-10">
            {/* Balance Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              {/* Available Balance */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-gray-400 text-sm mb-2">
                  Available Balance
                </h3>
                <div className="text-3xl font-bold text-cyan-400 mb-4">
                  {formatCurrency(data?.wallet?.available_balance || 0)}
                </div>
                <div className="flex items-center justify-center">
                  <Gem className="w-6 h-6 text-cyan-400" />
                </div>
              </div>

              {/* Total Net Worth */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
                <h3 className="text-white text-sm mb-2">Total Net Worth</h3>
                <div className="text-3xl font-bold mb-4">
                  {formatCurrency(
                    data?.total_net_worth || data?.total_balance || 0
                  )}
                </div>
              </div>

              {/* Spending Categories */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-gray-400 text-sm mb-2">
                  Spending Categories
                </h3>
                <div className="h-32 mb-4">
                  {getSpendingCategoriesData() ? (
                    <PieChart
                      data={getSpendingCategoriesData()!}
                      height={128}
                      options={{
                        plugins: {
                          legend: {
                            display: false,
                          },
                          title: { display: false },
                        },
                      }}
                    />
                  ) : (
                    <div className="text-gray-500 text-sm text-center">
                      <div>Debug: No chart data</div>
                      <div>Accounts: {data?.account_summary?.length || 0}</div>
                    </div>
                  )}
                </div>
                <div className="space-y-2 text-xs">
                  {data?.account_summary?.slice(0, 4).map((account) => (
                    <div
                      key={account.account_type}
                      className="flex justify-between"
                    >
                      <span className="text-gray-400 capitalize">
                        {account.account_type}
                      </span>
                      <span className="text-white">
                        ${account.balance.toLocaleString()}
                      </span>
                    </div>
                  )) || (
                    <div className="text-gray-400 text-center py-2">
                      No account data available
                    </div>
                  )}
                </div>
              </div>

              {/* Spendings */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-gray-400 text-sm mb-2">Spendings</h3>
                <div className="text-2xl font-bold text-white mb-4">
                  $
                  {data?.financial_goals?.monthly_expenses?.toLocaleString() ||
                    "0"}
                </div>
                <div className="h-32 flex items-center justify-center">
                  {getSpendingBreakdownData() ? (
                    <DoughnutChart
                      data={getSpendingBreakdownData()!}
                      height={128}
                      options={{
                        plugins: {
                          legend: {
                            display: false,
                          },
                          title: {
                            display: false,
                          },
                        },
                        cutout: "70%",
                        maintainAspectRatio: false,
                      }}
                    />
                  ) : (
                    <div className="text-gray-500 text-sm">
                      <div>
                        Debug: {data?.account_summary?.length || 0} accounts
                      </div>
                      <div>
                        Spending data:{" "}
                        {getSpendingBreakdownData()
                          ? "Available"
                          : "Not available"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* Income Chart */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-gray-400 text-sm mb-4">Monthly Trends</h3>
                <div className="text-2xl font-bold text-white mb-4">
                  {formatCurrency(
                    data?.monthly_summary?.slice(-1)[0]?.net || 0
                  )}
                </div>
                <div className="h-24">
                  {getMonthlyTrendsData() && (
                    <BarChart
                      data={getMonthlyTrendsData()!}
                      height={96}
                      options={{
                        plugins: {
                          legend: { display: false },
                          title: { display: false },
                        },
                        scales: {
                          x: { display: false },
                          y: { display: false },
                        },
                        elements: {
                          bar: { borderRadius: 2 },
                        },
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Spending Categories */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-gray-400 text-sm mb-4">Account Balances</h3>
                <div className="space-y-3">
                  {data?.account_summary?.slice(0, 3).map((account) => {
                    // Map account types to appropriate icons and colors
                    const getAccountDisplay = (accountType: string) => {
                      const type = accountType.toLowerCase();
                      switch (type) {
                        case "asset":
                          return { icon: House, color: "bg-cyan-500" };
                        case "liability":
                          return { icon: User, color: "bg-red-500" };
                        case "expense":
                          return { icon: Car, color: "bg-orange-500" };
                        case "income":
                          return { icon: Gem, color: "bg-green-500" };
                        case "equity":
                          return { icon: BarChart3, color: "bg-purple-500" };
                        default:
                          return { icon: User, color: "bg-gray-500" };
                      }
                    };

                    const { icon: Icon, color } = getAccountDisplay(
                      account.account_type
                    );

                    return (
                      <div
                        key={account.account_type}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}
                          >
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="text-white text-sm capitalize">
                              {account.account_type}
                            </div>
                          </div>
                        </div>
                        <div className="text-white font-semibold">
                          ${account.balance.toLocaleString()}
                        </div>
                      </div>
                    );
                  }) || (
                    <div className="text-gray-400 text-center py-4">
                      No account data available
                    </div>
                  )}
                </div>
              </div>

              {/* Income Goal Progress */}
              <div className="bg-gray-800 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-gray-400 text-sm">Income Goal</h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-cyan-400 font-bold">
                      {data?.financial_goals?.income_progress_percentage
                        ? `${Math.round(
                            data.financial_goals.income_progress_percentage
                          )}%`
                        : "0%"}
                    </span>
                    <button
                      onClick={() => setShowGoalsSettings(true)}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                      title="Financial Goals Settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-white text-sm mb-2">Progress to month</div>
                <div className="text-white font-semibold">
                  $
                  {data?.financial_goals?.monthly_income?.toLocaleString() ||
                    "0"}{" "}
                  / $
                  {data?.financial_goals?.income_goal?.toLocaleString() || "0"}
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full mt-3">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        data?.financial_goals?.income_progress_percentage || 0,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Financial Metrics Row */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              {/* Savings Rate */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
                <h3 className="text-green-100 text-sm mb-2">Savings Rate</h3>
                <div className="text-3xl font-bold mb-2">
                  {data?.financial_goals?.savings_rate?.toFixed(1) || "0.0"}%
                </div>
                <div className="text-green-100 text-xs">
                  $
                  {data?.financial_goals?.monthly_savings?.toLocaleString() ||
                    "0"}{" "}
                  saved this month
                </div>
              </div>

              {/* YTD Income */}
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
                <h3 className="text-blue-100 text-sm mb-2">YTD Income</h3>
                <div className="text-3xl font-bold mb-2">
                  {formatCurrency(data?.financial_goals?.ytd_income || 0)}
                </div>
                <div className="text-blue-100 text-xs">
                  Year to date earnings
                </div>
              </div>

              {/* YTD Expenses */}
              <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-xl p-6 text-white">
                <h3 className="text-red-100 text-sm mb-2">YTD Expenses</h3>
                <div className="text-3xl font-bold mb-2">
                  {formatCurrency(data?.financial_goals?.ytd_expenses || 0)}
                </div>
                <div className="text-red-100 text-xs">
                  Year to date spending
                </div>
              </div>

              {/* YTD Savings */}
              <div
                className={`rounded-xl p-6 text-white ${
                  (data?.financial_goals?.ytd_net || 0) >= 0
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                    : "bg-gradient-to-r from-orange-600 to-red-600"
                }`}
              >
                <h3 className="text-purple-100 text-sm mb-2">
                  YTD Net Savings
                </h3>
                <div className="text-3xl font-bold mb-2">
                  {formatCurrency(data?.financial_goals?.ytd_net || 0)}
                </div>
                <div className="text-purple-100 text-xs">
                  {(data?.financial_goals?.ytd_net || 0) >= 0
                    ? "Building wealth"
                    : "Spending more than earning"}
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-4 gap-6">
              {/* Income & Expenses Chart */}
              <div className="col-span-2 bg-gray-800 rounded-xl p-6">
                <h3 className="text-gray-400 text-sm mb-4">
                  Income & Expenses Trends
                </h3>
                <div className="flex justify-between mb-4">
                  <div>
                    <div className="text-white font-bold text-xl">
                      {formatCurrency(
                        Math.max(
                          ...(data?.monthly_summary?.map((m) =>
                            Math.abs(m.expenses)
                          ) || [0])
                        )
                      )}
                    </div>
                    <div className="text-red-400 text-xs">Max. Expenses</div>
                  </div>
                  <div>
                    <div className="text-white font-bold text-xl">
                      {formatCurrency(
                        Math.max(
                          ...(data?.monthly_summary?.map((m) => m.income) || [
                            0,
                          ])
                        )
                      )}
                    </div>
                    <div className="text-green-400 text-xs">Max. Income</div>
                  </div>
                </div>
                <div className="h-32">
                  {getIncomeExpensesData() && (
                    <LineChart
                      data={getIncomeExpensesData()!}
                      height={128}
                      options={{
                        plugins: {
                          legend: {
                            display: true,
                            position: "top",
                            labels: { color: "#fff", font: { size: 10 } },
                          },
                          title: { display: false },
                        },
                        scales: {
                          x: {
                            ticks: { color: "#9CA3AF", font: { size: 9 } },
                            grid: { color: "rgba(156, 163, 175, 0.1)" },
                          },
                          y: {
                            ticks: {
                              color: "#9CA3AF",
                              font: { size: 9 },
                              callback: function (value: string | number) {
                                return typeof value === "number"
                                  ? `$${(value / 1000).toFixed(0)}k`
                                  : value;
                              },
                            },
                            grid: { color: "rgba(156, 163, 175, 0.1)" },
                          },
                        },
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Account Types Pie Chart */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-gray-400 text-sm mb-4">Account Types</h3>
                <div className="h-32 mb-4">
                  {getAccountTypesData() ? (
                    <DoughnutChart
                      data={getAccountTypesData()!}
                      height={128}
                      centerText={`${data?.total_accounts || 0} Accounts`}
                      options={{
                        plugins: {
                          legend: {
                            display: false,
                          },
                          title: { display: false },
                        },
                      }}
                    />
                  ) : (
                    <div className="text-gray-500 text-sm text-center">
                      <div>Debug: Account Types</div>
                      <div>
                        Data:{" "}
                        {getAccountTypesData() ? "Available" : "Not available"}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2 text-xs">
                  {data?.account_summary?.map((account, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-400 capitalize">
                        {account.account_type}
                      </span>
                      <span className="text-white">
                        {formatCurrency(Math.abs(account.balance))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-gray-400 text-sm mb-4">Notification</h3>
                <div className="space-y-4">
                  <div className="bg-orange-500 bg-opacity-20 border-l-4 border-orange-500 p-3 rounded">
                    <div className="text-orange-400 text-xs font-semibold">
                      {data?.total_transactions || 0} transactions recorded.
                      Check your balance regularly.
                    </div>
                  </div>

                  <div className="text-white text-sm font-semibold mb-2">
                    Account Summary
                  </div>

                  <div className="space-y-2">
                    {data?.account_summary?.map((account, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-400 text-xs capitalize">
                          {account.count} {account.account_type} account
                          {account.count !== 1 ? "s" : ""}
                        </span>
                        <span className="text-white text-xs">
                          {formatCurrency(Math.abs(account.balance))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Goals Settings Modal */}
      <FinancialGoalsSettings
        isOpen={showGoalsSettings}
        onClose={() => {
          setShowGoalsSettings(false);
          // Refresh dashboard data after settings change
          fetchDashboardData();
        }}
      />
    </div>
  );
};

export default Dashboard;
