import React, { useState, useEffect } from "react";
import {
  PiggyBank,
  Plus,
  RefreshCw,
  Target,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Loader2,
  Trash2,
} from "lucide-react";
import { NavigationSidebar } from "../components/NavigationSidebar";
import { BudgetModal } from "../components/BudgetModal";
import { BudgetDeleteModal } from "../components/BudgetDeleteModal";
import { useBudgets } from "../hooks/useBudgets";

interface Budget {
  id: string;
  category: string;
  planned_amount: number;
  actual_amount: number;
  period: string;
  status: "on_track" | "over_budget" | "under_budget";
}

export const Budget: React.FC = () => {
  const { budgets, loading, error, fetchBudgets, createDefaultBudgets } = useBudgets();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Create default budgets if user has none
  useEffect(() => {
    if (!loading && budgets.length === 0 && !error) {
      createDefaultBudgets();
    }
  }, [loading, budgets.length, error, createDefaultBudgets]);

  const handleBudgetCreated = () => {
    fetchBudgets(); // Refresh the budget list
  };

  const handleBudgetDeleted = () => {
    fetchBudgets(); // Refresh the budget list
  };

  const getBudgetStatusIcon = (status: Budget["status"]) => {
    switch (status) {
      case "on_track":
        return Target;
      case "over_budget":
        return AlertTriangle;
      case "under_budget":
        return TrendingUp;
      default:
        return Target;
    }
  };

  const getBudgetStatusColor = (status: Budget["status"]) => {
    switch (status) {
      case "on_track":
        return "text-green-400";
      case "over_budget":
        return "text-red-400";
      case "under_budget":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const calculateProgress = (actual: number, planned: number) => {
    return Math.min((actual / planned) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading budgets...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <p>Error loading budgets: {error}</p>
          <button
            onClick={fetchBudgets}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full px-6 py-6">
        <header className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Budget Management
              </h1>
              <p className="text-gray-400">
                Track your spending and stay on budget
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-2">
            <NavigationSidebar />
          </div>

          <div className="col-span-10">
            <div className="mb-6 flex justify-end space-x-4">
              <button
                onClick={fetchBudgets}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                disabled={budgets.length === 0}
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Budget</span>
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-green-700 hover:to-emerald-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>New Budget</span>
              </button>
            </div>

            {/* Rest of your existing JSX remains the same */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">
                        Total Budgets
                      </p>
                      <p className="text-3xl font-bold">{budgets.length}</p>
                    </div>
                    <Target className="w-8 h-8 opacity-80" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">
                        On Track
                      </p>
                      <p className="text-3xl font-bold">
                        {budgets.filter((b) => b.status === "on_track").length}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 opacity-80" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm font-medium">
                        Over Budget
                      </p>
                      <p className="text-3xl font-bold">
                        {
                          budgets.filter((b) => b.status === "over_budget")
                            .length
                        }
                      </p>
                    </div>
                    <AlertTriangle className="w-8 h-8 opacity-80" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">
                        Total Planned
                      </p>
                      <p className="text-3xl font-bold">
                        $
                        {budgets
                          .reduce((sum, b) => sum + b.planned_amount, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 opacity-80" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.map((budget) => (
                  <div
                    key={budget.id}
                    className="bg-gray-800 hover:bg-gray-700 p-6 rounded-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">
                        {budget.category}
                      </h3>
                      {React.createElement(getBudgetStatusIcon(budget.status), {
                        className: `w-6 h-6 ${getBudgetStatusColor(
                          budget.status
                        )}`,
                      })}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Planned:</span>
                        <span className="font-bold text-white">
                          ${budget.planned_amount.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Actual:</span>
                        <span
                          className={`font-bold ${
                            budget.actual_amount > budget.planned_amount
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                        >
                          ${budget.actual_amount.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">
                          Remaining:
                        </span>
                        <span
                          className={`font-bold ${
                            budget.planned_amount - budget.actual_amount >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          $
                          {Math.abs(
                            budget.planned_amount - budget.actual_amount
                          ).toLocaleString()}
                        </span>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-400 text-sm">
                            Progress:
                          </span>
                          <span className="text-white text-sm">
                            {calculateProgress(
                              budget.actual_amount,
                              budget.planned_amount
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              budget.status === "over_budget"
                                ? "bg-red-500"
                                : budget.status === "on_track"
                                ? "bg-green-500"
                                : "bg-blue-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                calculateProgress(
                                  budget.actual_amount,
                                  budget.planned_amount
                                ),
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Modals */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBudgetCreated={handleBudgetCreated}
      />

      <BudgetDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onBudgetDeleted={handleBudgetDeleted}
        budgets={budgets}
      />
    </div>
  );
};

export default Budget;