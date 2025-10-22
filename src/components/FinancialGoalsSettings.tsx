import React, { useState } from 'react';
import { Target, DollarSign, Settings } from 'lucide-react';
import { useFinancialGoals } from '../hooks/useFinancialGoals';

interface FinancialGoalsSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FinancialGoalsSettings: React.FC<FinancialGoalsSettingsProps> = ({
  isOpen,
  onClose,
}) => {
  const { goals, updateGoals, loading, error, refetch } = useFinancialGoals(false); // Don't fetch immediately
  const [incomeGoal, setIncomeGoal] = useState(3000);
  const [expenseBudget, setExpenseBudget] = useState(2500);
  const [saving, setSaving] = useState(false);

  // Load goals when modal opens
  React.useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen]); // Remove refetch from dependencies to prevent infinite loop

  // Update local state when goals are loaded
  React.useEffect(() => {
    if (goals) {
      setIncomeGoal(goals.monthly_income_goal);
      setExpenseBudget(goals.monthly_expense_budget);
    }
  }, [goals]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateGoals({
        monthly_income_goal: incomeGoal,
        monthly_expense_budget: expenseBudget,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save financial goals:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Financial Goals</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Monthly Income Goal */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Monthly Income Goal</span>
              </div>
            </label>
            <input
              type="number"
              value={incomeGoal}
              onChange={(e) => setIncomeGoal(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="Enter your monthly income goal"
              min="0"
              step="100"
            />
            <p className="text-gray-400 text-xs mt-1">
              This helps track your progress toward earning goals
            </p>
          </div>

          {/* Monthly Expense Budget */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Monthly Expense Budget</span>
              </div>
            </label>
            <input
              type="number"
              value={expenseBudget}
              onChange={(e) => setExpenseBudget(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="Enter your monthly spending budget"
              min="0"
              step="100"
            />
            <p className="text-gray-400 text-xs mt-1">
              Set a limit for your monthly expenses to stay on track
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Goals'}
          </button>
        </div>
      </div>
    </div>
  );
};