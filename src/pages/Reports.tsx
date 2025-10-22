import { useState, useEffect } from "react";
import {
  BarChart3,
  DollarSign,
  TrendingDown,
  Download,
  Calendar,
  Filter,
  TrendingUp,
} from "lucide-react";
import { AccountsService } from "../services";
import { useAuth } from "../hooks/useAuth";
import { NavigationSidebar } from "../components/NavigationSidebar";
import {
  LineChart,
  BarChart,
  PieChart,
  DoughnutChart,
} from "../components/charts";
import { API_BASE_URL } from "../constants/api";
import { ReportCLI } from "../components/ReportCLI";

interface Account {
  id: number;
  name: string;
  account_type: string;
  balance: string;
}

interface ReportData {
  report_id: string;
  report: {
    report_type: string;
    generated_at: string;
    data: CashflowData | object;
  };
  export_csv_url: string;
  export_md_url: string;
}

interface CashflowData {
  summary: {
    total_inflows: number;
    total_outflows: number;
    net_flow: number;
    transaction_count: number;
  };
  inflows: Array<{
    date: string;
    account: string;
    amount: number;
    description: string;
  }>;
  outflows: Array<{
    date: string;
    account: string;
    amount: number;
    description: string;
  }>;
}

const Reports = () => {
  const { token } = useAuth();
  const [selectedReport, setSelectedReport] = useState("cashflow");
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [cashflowData, setCashflowData] = useState<CashflowData | null>(null);
  const [filters, setFilters] = useState({
    start_date: "",
    end_date: "",
    tag: "",
  });

  const reportTypes = [
    {
      id: "cashflow",
      name: "Cashflow Report",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      description: "Income and expense flows",
    },
    {
      id: "balance_sheet",
      name: "Balance Sheet",
      icon: BarChart3,
      color: "from-blue-500 to-cyan-500",
      description: "Assets and liabilities",
    },
  ];

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await AccountsService.getAccounts();
      setAccounts(
        Array.isArray(response)
          ? response
          : (response as { results: Account[] }).results || []
      );
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      // Build query params for filters
      const queryParams = new URLSearchParams();
      if (filters.start_date)
        queryParams.append("start_date", filters.start_date);
      if (filters.end_date) queryParams.append("end_date", filters.end_date);
      if (filters.tag) queryParams.append("tag", filters.tag);

      // Use user-specific endpoint for cashflow reports
      const reportUrl =
        selectedReport === "cashflow"
          ? `${API_BASE_URL}/user/reports/cashflow/?${queryParams.toString()}`
          : `${API_BASE_URL}/reports/${selectedReport}/?${queryParams.toString()}`;

      const response = await fetch(reportUrl, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Report data received:", data);

      setReportData(data);

      // If it's a cashflow report, extract the cashflow data
      if (selectedReport === "cashflow" && data.report && data.report.data) {
        setCashflowData(data.report.data);
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert(
        `Error generating report: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: "csv" | "md") => {
    if (!reportData) {
      alert("Please generate a report first");
      return;
    }

    try {
      // Add small delay to ensure report is saved
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Use the correct URL format that backend expects
      const url = `${API_BASE_URL}/reports/${reportData.report_id}/export/?format=${format}`;
      console.log(`[DEBUG] Exporting to: ${url}`);

      const response = await fetch(url, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[DEBUG] Export error response:`, errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(
            `Export failed: ${response.status} ${response.statusText}`
          );
        }

        throw new Error(errorData.error || "Export failed");
      }

      // Download file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${selectedReport}_report.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      console.log(`[DEBUG] Export ${format} completed successfully`);
    } catch (error) {
      console.error(`[DEBUG] Export error:`, error);
      alert(
        `Error exporting report: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Generate chart data for cashflow visualization
  const getCashflowTrendsData = () => {
    if (!cashflowData) return null;

    // Aggregate daily data for the trend chart
    const dailyData = new Map<string, { inflows: number; outflows: number }>();

    // Process inflows
    cashflowData.inflows.forEach((inflow) => {
      const date = inflow.date;
      if (!dailyData.has(date)) {
        dailyData.set(date, { inflows: 0, outflows: 0 });
      }
      dailyData.get(date)!.inflows += inflow.amount;
    });

    // Process outflows
    cashflowData.outflows.forEach((outflow) => {
      const date = outflow.date;
      if (!dailyData.has(date)) {
        dailyData.set(date, { inflows: 0, outflows: 0 });
      }
      dailyData.get(date)!.outflows += outflow.amount;
    });

    // Sort dates and get last 30 days
    const sortedDates = Array.from(dailyData.keys()).sort().slice(-30);

    return {
      labels: sortedDates,
      datasets: [
        {
          label: "Inflows",
          data: sortedDates.map((date) => dailyData.get(date)?.inflows || 0),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Outflows",
          data: sortedDates.map((date) => dailyData.get(date)?.outflows || 0),
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const getAccountBalancesData = () => {
    if (!accounts.length) return null;

    const accountsByType = accounts.reduce((acc, account) => {
      const type = account.account_type;
      if (!acc[type]) acc[type] = 0;
      acc[type] += parseFloat(account.balance) || 0;
      return acc;
    }, {} as Record<string, number>);

    const colors = [
      "#06B6D4", // cyan
      "#F97316", // orange
      "#EF4444", // red
      "#8B5CF6", // violet
      "#10B981", // emerald
    ];

    return {
      labels: Object.keys(accountsByType).map(
        (type) => type.charAt(0).toUpperCase() + type.slice(1)
      ),
      datasets: [
        {
          label: "Account Balances by Type",
          data: Object.values(accountsByType).map((balance) =>
            Math.abs(balance)
          ),
          backgroundColor: colors.slice(0, Object.keys(accountsByType).length),
          borderColor: colors.slice(0, Object.keys(accountsByType).length),
          borderWidth: 2,
        },
      ],
    };
  };

  const getInflowsOutflowsComparisonData = () => {
    if (!cashflowData) return null;

    return {
      labels: ["Financial Summary"],
      datasets: [
        {
          label: "Inflows",
          data: [cashflowData.summary.total_inflows],
          backgroundColor: "rgba(34, 197, 94, 0.8)",
          borderColor: "rgb(34, 197, 94)",
          borderWidth: 1,
        },
        {
          label: "Outflows",
          data: [cashflowData.summary.total_outflows],
          backgroundColor: "rgba(239, 68, 68, 0.8)",
          borderColor: "rgb(239, 68, 68)",
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full px-6 py-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Financial Reports
              </h1>
              <p className="text-gray-400">
                Generate comprehensive financial reports and insights
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          {/* Navigation Sidebar */}
          <div className="col-span-2">
            <NavigationSidebar />
          </div>

          {/* Main Content */}
          <div className="col-span-10">
            {/* Report Type Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">
                Select Report Type
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {reportTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedReport(type.id)}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      selectedReport === type.id
                        ? `bg-gradient-to-r ${type.color} border-white/50 shadow-2xl`
                        : "bg-white/10 border-white/20 hover:bg-white/20"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <type.icon className="w-12 h-12 text-white" />
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-white">
                          {type.name}
                        </h3>
                        <p className="text-sm text-gray-300">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Filters Section - only show for cashflow */}
            {selectedReport === "cashflow" && (
              <div className="bg-gray-800 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={filters.start_date}
                      onChange={(e) =>
                        setFilters({ ...filters, start_date: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      End Date
                    </label>
                    <input
                      type="date"
                      value={filters.end_date}
                      onChange={(e) =>
                        setFilters({ ...filters, end_date: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tag Filter
                    </label>
                    <input
                      type="text"
                      placeholder="Enter tag..."
                      value={filters.tag}
                      onChange={(e) =>
                        setFilters({ ...filters, tag: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Generate Report Section */}
            <div className="text-center mb-8">
              <button
                onClick={generateReport}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-8 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 text-lg font-semibold mr-4"
              >
                {loading ? "⏳ Generating..." : "Generate Report"}
              </button>

              {reportData && (
                <div className="inline-flex space-x-2 ml-4">
                  <button
                    onClick={() => exportReport("csv")}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-all flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => exportReport("md")}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-all flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export MD</span>
                  </button>
                </div>
              )}
            </div>

            {/* Cashflow Report Results */}
            {selectedReport === "cashflow" && cashflowData && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-xl text-white">
                    <TrendingUp className="w-8 h-8 mb-2" />
                    <div className="text-2xl font-bold">
                      {formatCurrency(cashflowData.summary.total_inflows)}
                    </div>
                    <div className="text-green-100">Total Inflows</div>
                  </div>
                  <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 rounded-xl text-white">
                    <TrendingDown className="w-8 h-8 mb-2" />
                    <div className="text-2xl font-bold">
                      {formatCurrency(cashflowData.summary.total_outflows)}
                    </div>
                    <div className="text-red-100">Total Outflows</div>
                  </div>
                  <div
                    className={`p-6 rounded-xl text-white ${
                      cashflowData.summary.net_flow >= 0
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600"
                        : "bg-gradient-to-r from-orange-600 to-red-600"
                    }`}
                  >
                    <DollarSign className="w-8 h-8 mb-2" />
                    <div className="text-2xl font-bold">
                      {formatCurrency(cashflowData.summary.net_flow)}
                    </div>
                    <div className="text-gray-100">Net Flow</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-xl text-white">
                    <BarChart3 className="w-8 h-8 mb-2" />
                    <div className="text-2xl font-bold">
                      {cashflowData.summary.transaction_count}
                    </div>
                    <div className="text-purple-100">Transactions</div>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Cashflow Trends */}
                  <div className="col-span-2">
                    <div className="bg-gray-800 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Cashflow Trends (Last 30 Days)
                      </h3>
                      {getCashflowTrendsData() && (
                        <LineChart
                          data={getCashflowTrendsData()!}
                          height={300}
                          options={{
                            plugins: {
                              legend: {
                                labels: { color: "#fff", font: { size: 12 } },
                              },
                            },
                            scales: {
                              x: {
                                ticks: { color: "#9CA3AF", font: { size: 10 } },
                                grid: { color: "rgba(156, 163, 175, 0.1)" },
                              },
                              y: {
                                ticks: {
                                  color: "#9CA3AF",
                                  font: { size: 10 },
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

                  {/* Inflows vs Outflows Comparison */}
                  <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Inflows vs Outflows
                    </h3>
                    {getInflowsOutflowsComparisonData() && (
                      <BarChart
                        data={getInflowsOutflowsComparisonData()!}
                        height={250}
                        options={{
                          plugins: {
                            legend: {
                              labels: { color: "#fff", font: { size: 12 } },
                            },
                          },
                          scales: {
                            x: {
                              ticks: { color: "#9CA3AF", font: { size: 10 } },
                              grid: { color: "rgba(156, 163, 175, 0.1)" },
                            },
                            y: {
                              ticks: {
                                color: "#9CA3AF",
                                font: { size: 10 },
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

                  {/* Account Balances by Type */}
                  <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Account Balances by Type
                    </h3>
                    {getAccountBalancesData() && (
                      <DoughnutChart
                        data={getAccountBalancesData()!}
                        height={250}
                        centerText={`${accounts.length} Accounts`}
                        options={{
                          plugins: {
                            legend: {
                              position: "bottom",
                              labels: { color: "#fff", font: { size: 10 } },
                            },
                          },
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Inflows and Outflows Tables */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Inflows */}
                  <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Recent Inflows
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {cashflowData.inflows
                        .slice(0, 10)
                        .map((inflow, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center py-2 border-b border-gray-700"
                          >
                            <div>
                              <div className="text-white font-medium">
                                {inflow.description}
                              </div>
                              <div className="text-gray-400 text-sm">
                                {inflow.account} • {inflow.date}
                              </div>
                            </div>
                            <div className="text-green-400 font-semibold">
                              +{formatCurrency(inflow.amount)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Outflows */}
                  <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
                      <TrendingDown className="w-5 h-5 mr-2" />
                      Recent Outflows
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {cashflowData.outflows
                        .slice(0, 10)
                        .map((outflow, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center py-2 border-b border-gray-700"
                          >
                            <div>
                              <div className="text-white font-medium">
                                {outflow.description}
                              </div>
                              <div className="text-gray-400 text-sm">
                                {outflow.account} • {outflow.date}
                              </div>
                            </div>
                            <div className="text-red-400 font-semibold">
                              -{formatCurrency(outflow.amount)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Balance Sheet Results */}
            {selectedReport === "balance_sheet" && accounts.length > 0 && (
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 rounded-2xl text-white">
                  <div className="text-3xl mb-2">🏦</div>
                  <div className="text-2xl font-bold">
                    {accounts.filter((a) => a.account_type === "ASSET").length}
                  </div>
                  <div className="text-blue-100">Asset Accounts</div>
                </div>
                <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 rounded-2xl text-white">
                  <div className="text-3xl mb-2">💳</div>
                  <div className="text-2xl font-bold">
                    {
                      accounts.filter((a) => a.account_type === "LIABILITY")
                        .length
                    }
                  </div>
                  <div className="text-red-100">Liability Accounts</div>
                </div>
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-2xl text-white">
                  <div className="text-3xl mb-2 flex justify-center">
                    <DollarSign className="w-8 h-8" />
                  </div>
                  <div className="text-2xl font-bold">
                    {accounts.filter((a) => a.account_type === "INCOME").length}
                  </div>
                  <div className="text-green-100">Income Accounts</div>
                </div>
                <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 rounded-2xl text-white">
                  <div className="text-3xl mb-2 flex justify-center">
                    <TrendingDown className="w-8 h-8" />
                  </div>
                  <div className="text-2xl font-bold">
                    {
                      accounts.filter((a) => a.account_type === "EXPENSE")
                        .length
                    }
                  </div>
                  <div className="text-orange-100">Expense Accounts</div>
                </div>
              </div>
            )}

            {/* CLI Export Section */}
            <ReportCLI />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
