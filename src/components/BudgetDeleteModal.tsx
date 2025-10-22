import React, { useState } from 'react';
import { X, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { budgetService } from '../services/budgetService';
import type { Budget } from '../services/budgetService';

interface BudgetDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBudgetDeleted: () => void;
  budgets: Budget[];
}

export const BudgetDeleteModal: React.FC<BudgetDeleteModalProps> = ({
  isOpen,
  onClose,
  onBudgetDeleted,
  budgets,
}) => {
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!selectedBudgetId) {
      setError('Please select a budget to delete');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await budgetService.deleteBudget(selectedBudgetId);
      onBudgetDeleted();
      onClose();
      setSelectedBudgetId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete budget');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Delete Budget</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-600/20 border border-red-600/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Budget to Delete
            </label>
            <select
              value={selectedBudgetId}
              onChange={(e) => setSelectedBudgetId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">Choose a budget...</option>
              {budgets.map((budget) => (
                <option key={budget.id} value={budget.id}>
                  {budget.category} - ${budget.planned_amount.toLocaleString()} ({budget.period})
                </option>
              ))}
            </select>
          </div>

          {selectedBudgetId && (
            <div className="p-3 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <p className="text-yellow-400 text-sm">
                  This action cannot be undone. The budget will be permanently deleted.
                </p>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading || !selectedBudgetId}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Budget</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};