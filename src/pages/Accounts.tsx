import React, { useState } from "react";
import {
  Building2,
  Plus,
  RefreshCw,
  Wallet,
  TrendingUp,
  BarChart3,
  X,
  ShieldOff,
} from "lucide-react";
import AccountForm from "../components/AccountForm";
import { NavigationSidebar } from "../components/NavigationSidebar";
import { useAccounts, useToast } from "../hooks";
import { LoadingSpinner, ErrorAlert } from "../components";
import { AccountList } from "../temp_components/accounts_temp";
import { AccountsService } from "../services";
import type { Account } from "../types";

const Accounts: React.FC = () => {
  const { accounts, loading, error, refetch, createFixtures, totalBalance } = useAccounts();
  const { showToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [deactivating, setDeactivating] = useState(false);

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
    showToast("Accounts refreshed successfully!", "success");
  };


  const groupAccountsByType = () => {
    if (!Array.isArray(accounts)) {
      return {};
    }
    
    const grouped = accounts.reduce((acc, account) => {
      if (!acc[account.account_type]) {
        acc[account.account_type] = [];
      }
      acc[account.account_type].push(account);
      return acc;
    }, {} as Record<string, typeof accounts>);
    return grouped;
  };
  const handleAccountClick = (account: Account) => {
    console.log("Clicked account:", account);
    // optionally: navigate or show account details
  };

  const handleDeactivate = async () => {
    if (!selectedAccountId) return;
    try {
      setDeactivating(true);
      await AccountsService.deleteAccount(selectedAccountId);
      showToast("Account deactivated.", "success");
      await refetch();
      setSelectedAccountId(null);
      setShowDeactivateModal(false);
    } catch (e) {
      showToast("Failed to deactivate account.", "error");
    } finally {
      setDeactivating(false);
    }
  };

  const activeAccounts = (accounts || []).filter(a => a.is_active);
  // inactiveAccounts not currently used in UI

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <LoadingSpinner message="Loading accounts..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full px-6 py-6">
        <header className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Account Management
              </h1>
              <p className="text-gray-400">
                Manage your financial accounts and view balances
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
                onClick={handleRefresh}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-blue-700 hover:to-cyan-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>New Account</span>
              </button>
              <button
                onClick={handleCreateFixtures}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg transition-all hover:from-purple-700 hover:to-pink-700"
              >
                Create Test Data
              </button>
              <button
                onClick={() => setShowDeactivateModal(true)}
                className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-red-700 hover:to-orange-700 transition-all"
                disabled={activeAccounts.length === 0}
              >
                <ShieldOff className="w-4 h-4" />
                <span>Deactivate</span>
              </button>
            </div>

            {error && <ErrorAlert message={error} onRetry={refetch} />}

            {showForm && (
              <div className="bg-gray-800 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Account
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <AccountForm />
              </div>
            )}

            {Array.isArray(accounts) && accounts.length === 0 && !error ? (
              <div className="bg-gray-800 rounded-xl p-8 text-center">
                <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No accounts found
                </h3>
                <p className="text-gray-400 mb-4">
                  Create your first account to get started
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2 rounded-lg"
                >
                  Create Account
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">
                          Total Accounts
                        </p>
                        <p className="text-3xl font-bold">{Array.isArray(accounts) ? accounts.length : 0}</p>
                      </div>
                      <Building2 className="w-8 h-8 opacity-80" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">
                          Active Accounts
                        </p>
                        <p className="text-3xl font-bold">
                          {Array.isArray(accounts) ? accounts.filter((a) => a.is_active).length : 0}
                        </p>
                      </div>
                      <Wallet className="w-8 h-8 opacity-80" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">
                          Account Types
                        </p>
                        <p className="text-3xl font-bold">
                          {Object.keys(groupAccountsByType()).length}
                        </p>
                      </div>
                      <BarChart3 className="w-8 h-8 opacity-80" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 rounded-xl text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm font-medium">
                          Total Balance
                        </p>
                        <p className="text-3xl font-bold">
                          ${totalBalance.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 opacity-80" />
                    </div>
                  </div>
                </div>
                <AccountList
                  accounts={accounts}
                  onAccountClick={handleAccountClick}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !deactivating && setShowDeactivateModal(false)}
          />
          <div className="relative bg-gray-800 w-full max-w-lg rounded-xl p-6 shadow-xl border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <ShieldOff className="w-5 h-5 mr-2 text-red-400" />
                Deactivate Account
              </h3>
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="text-gray-400 hover:text-white"
                disabled={deactivating}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {activeAccounts.length === 0 ? (
              <p className="text-gray-400 text-sm">
                No active accounts available.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {activeAccounts.map(acc => (
                    <button
                      key={acc.id}
                      onClick={() => setSelectedAccountId(acc.id!)}
                      className={`w-full text-left px-4 py-2 rounded-lg border transition ${
                        selectedAccountId === acc.id
                          ? "bg-red-600/20 border-red-500 text-red-200"
                          : "bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-200"
                      }`}
                    >
                      <span className="font-medium">{acc.name}</span>
                      <span className="ml-2 text-xs uppercase text-gray-400">
                        {acc.account_type}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    onClick={() => setShowDeactivateModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200"
                    disabled={deactivating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeactivate}
                    disabled={!selectedAccountId || deactivating}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                      !selectedAccountId || deactivating
                        ? "bg-red-900/40 text-red-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                    }`}
                  >
                    <ShieldOff className="w-4 h-4" />
                    <span>
                      {deactivating ? "Deactivating..." : "Deactivate"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
