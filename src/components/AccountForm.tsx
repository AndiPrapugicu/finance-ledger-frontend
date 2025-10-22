import React, { useState } from "react";
import { Button } from "./ui/Button";
import { ErrorAlert } from "./ui/ErrorAlert";
import { useToast } from "../hooks/useToast";
import { useAccounts } from "../hooks";
import { AccountsService } from "../services";
import type { AccountType } from "../types";
import { 
  Building2, 
  FileText, 
  CheckCircle, 
  Landmark,
  CreditCard,
  TrendingUp,
  TrendingDown
} from "lucide-react";



const AccountForm: React.FC = () => {
  const [accountName, setAccountName] = useState("");
  const [accounttype, setAccountType] = useState("ASSET"); // default = Asset
  const [error, setError] = useState<string | null>(null);
  const { accounts } = useAccounts();
  const [parent,setParent] = useState<string | null>(null); // optional, no parent selected
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

// Removed unnecessary useEffect that fetched accounts and set parent incorrectly

  const validateForm = (): boolean => {
    if (!accountName.trim()) {
      setError("Account name is required.");
      return false;
    }
    if (!["ASSET", "LIABILITY", "INCOME", "EXPENSE"].includes(accounttype)) {
      setError("Invalid account type.");
      return false;
    }
    if(parent&& !accounts.some((acc)=>acc.id.toString()===parent)){
      setError("Invalid parent account.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        name: accountName.trim(),
        account_type: accounttype  as AccountType,// must be one of "ASSET","LIABILITY","INCOME","EXPENSE"
        parent: parent ? parseInt(parent) : null, // optional
        is_active: true            // default active
      };

      console.log("Submitting payload:", payload); // DEBUG

     await AccountsService.createAccount(payload);
     showToast("Account successfully created!", "success");

      setAccountName("");
      setAccountType("ASSET");
      setParent(null);

      // optional: refresh list of accounts


  } catch (err) {
    setError((err as Error).message || "Failed to create account");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-700 rounded-2xl p-8 shadow-2xl border border-gray-600">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Add New Account</h2>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorAlert message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Name */}
        <div className="space-y-2">
          <label className="block text-gray-300 text-sm font-semibold mb-3">
            Account Name <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-700/50 text-white rounded-xl border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-400"
              placeholder="Enter account name (e.g., Checking Account)"
              required
            />
          </div>
        </div>

        {/* Account Type */}
        <div className="space-y-2">
          <label className="block text-gray-300 text-sm font-semibold mb-3">
            Account Type <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "ASSET", label: "Asset", icon: Landmark, color: "from-green-600 to-emerald-600" },
              { value: "LIABILITY", label: "Liability", icon: CreditCard, color: "from-red-600 to-pink-600" },
              { value: "INCOME", label: "Income", icon: TrendingUp, color: "from-blue-600 to-cyan-600" },
              { value: "EXPENSE", label: "Expense", icon: TrendingDown, color: "from-orange-600 to-red-600" }
            ].map((type) => {
              const Icon = type.icon;
              return (
                <label
                  key={type.value}
                  className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
                    accounttype === type.value
                      ? `border-blue-500 bg-gradient-to-r ${type.color} bg-opacity-20`
                      : "border-gray-600 bg-gray-700/30 hover:border-gray-500"
                  }`}
                >
                  <input
                    type="radio"
                    value={type.value}
                    checked={accounttype === type.value}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="sr-only"
                    required
                  />
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      accounttype === type.value 
                        ? `bg-gradient-to-r ${type.color}`
                        : "bg-gray-600"
                    }`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className={`font-semibold ${
                      accounttype === type.value ? "text-white" : "text-gray-300"
                    }`}>
                      {type.label}
                    </span>
                  </div>
                  {accounttype === type.value && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-5 h-5 text-blue-400" />
                    </div>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Parent Account */}
        <div className="space-y-2">
          <label className="block text-gray-300 text-sm font-semibold mb-3">
            Parent Account
            <span className="text-gray-500 font-normal ml-1">(Optional)</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={parent || ""}
              onChange={(e) => setParent(e.target.value || null)}
              className="w-full pl-12 pr-4 py-4 bg-gray-700/50 text-white rounded-xl border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="" className="bg-gray-700">-- No Parent Account --</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id} className="bg-gray-700">
                  {acc.name} ({acc.account_type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Building2 className="w-5 h-5" />
                <span>Add Account</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AccountForm;