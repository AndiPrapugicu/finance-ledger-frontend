import React, { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import { ErrorAlert } from "./ui/ErrorAlert";
import { useToast } from "../hooks/useToast";
import { v4 as uuidv4 } from "uuid";
import { TransactionsService } from "../services";
import { API_BASE_URL } from "../constants";
import type { Wallet } from "../types";
import { WalletService} from "../services";
import { 
  Calendar, 
  FileText, 
  Plus, 
  Tag, 
  X, 
  CreditCard, 
  ArrowRightLeft,
  CheckCircle,
  DollarSign,
  Building2
} from "lucide-react";

interface LedgerAccount {
  id: number;
  name: string;
  account_type: string;
  parent: number | null;
  is_active: boolean;
}

const TransactionForm: React.FC = () => {

  const [activeTab, setActiveTab] = useState<"splits" | "walletTransfer">("splits");
  const [transactionDate, setTransactionDate] = useState("");
  const [description, setDescription] = useState("");
  const [splits, setSplits] = useState([
    { id: uuidv4(), accountId: "", amount: "" },
  ]);
  const [tags, setTags] = useState<{ label: string; value: string }[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<LedgerAccount[]>([]);

const [wallet, setWallet] = useState<Wallet | null>(null);
const [transferTarget, setTransferTarget] = useState("");
const [transferAmount, setTransferAmount] = useState("");
const [transferDescription, setTransferDescription] = useState("");
const [paymentMethod, setPaymentMethod] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [necessary, setNecessary] = useState(false);

  const { showToast } = useToast();

  // Fetch ledger accounts for double-entry transactions
  useEffect(() => {
    const fetchLedgerAccounts = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${API_BASE_URL}/accounts/ledger/`, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Failed to fetch ledger accounts");
        const data: LedgerAccount[] = await response.json();
        setAccounts(data);
      } catch (err) {
        console.error("Error fetching ledger accounts:", err);
        setError("Failed to load accounts");
      }
    };
    fetchLedgerAccounts();
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/tags/`);
        if (!response.ok) throw new Error("Failed to fetch tags");
        const data: string[] = await response.json();
        setAllTags(data); // suggestions in your TagInput
      } catch (err) {
        console.error("Error fetching tags:", err);
      }
    };
    fetchTags();
  }, []);
useEffect(() => {
  const fetchWallet = async () => {
  try {
    const data = await WalletService.getWallet();
    setWallet(data);
  }
  catch (err) {
    console.error("Error fetching wallet:", err);
  }
  };
  fetchWallet();
}, []);

  const validateForm = (): boolean => {
    if (!transactionDate.trim()) {
      setError("Transaction date is required.");
      return false;
    }
    if (!description.trim()) {
      setError("Description is required.");
      return false;
    }
    if (activeTab === "splits") {
    for (const split of splits) {
      if (!split.accountId) {
        setError("All splits must have an account selected.");
        return false;
      }
      if (isNaN(Number(split.amount)) || Number(split.amount) === 0) {
        setError("All splits must have a valid non-zero amount.");
        return false;
      }

      //de facut aici cu income si expenses positiv si negativ
    }
  }
    if (activeTab === "walletTransfer") {
      if (!transferTarget) {
        setError("Please select a target account.");
        return false;
      }
      if (isNaN(Number(transferAmount)) || Number(transferAmount) <= 0) {
        setError("Transfer amount must be greater than 0.");
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
       if (activeTab === "splits") {
      const payload = {
        date: transactionDate,
        desc: description,
        splits: splits.map((s) => ({
          accountId: Number(s.accountId),
          amount: s.amount,
        })),
        tags: tags.map((t) => t.value),
        necessary: necessary,
      };
      console.log("Submitting payload:", payload); // DEBUG
      await TransactionsService.createTransaction(payload);
    }
    else
    {
         const payload = {
        walletId: Number(wallet?.id),
        destinationAccount: Number(transferTarget),
        amount: transferAmount.toString(),
        description: transferDescription,
        paymentMethod:paymentMethod ? Number(paymentMethod) : undefined
      };
      console.log("Submitting wallet transfer:", payload);
      try{
      await WalletService.transferFunds(payload);
      }
      catch(err){
        console.error("Error during wallet transfer:", err, err instanceof Error ? err.message : err);
        setError("Failed to complete wallet transfer.");
        return;
      }
    }
     

      showToast("Transaction successfully created!", "success");
      setTransactionDate("");
      setDescription("");
      setTags([]);
      setSplits([{ id: uuidv4(), accountId: "", amount: "" }]);
      setTransferTarget("");
      setTransferAmount("");
      setTransferDescription("");
      setPaymentMethod("");
      setNecessary(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSplit = () =>
    setSplits([...splits, { id: uuidv4(), accountId: "", amount: "" }]);

  const handleRemoveSplit = (id: string) =>
    setSplits(splits.filter((split) => split.id !== id));

  const handleSplitChange = (id: string, field: string, value: string) =>
    setSplits(
      splits.map((split) =>
        split.id === id ? { ...split, [field]: value } : split
      )
    );

  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-700 rounded-2xl p-8 shadow-2xl border border-gray-600">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
          <ArrowRightLeft className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">Create New Transaction</h2>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorAlert message={error} />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-700/50 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab("splits")}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            activeTab === "splits"
              ? "bg-purple-600 text-white shadow-lg"
              : "text-gray-300 hover:text-white hover:bg-gray-600"
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Splits Transaction</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("walletTransfer")}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
            activeTab === "walletTransfer"
              ? "bg-indigo-600 text-white shadow-lg"
              : "text-gray-300 hover:text-white hover:bg-gray-600"
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>Wallet Transfer</span>
          </div>
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transaction Date */}
        <div className="space-y-2">
          <label className="block text-gray-300 text-sm font-semibold mb-3">
            Transaction Date <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-700/50 text-white rounded-xl border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-gray-300 text-sm font-semibold mb-3">
            Description <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <FileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-700/50 text-white rounded-xl border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 placeholder-gray-400"
              placeholder="Enter transaction description"
              required
            />
          </div>
        </div>

        {/* Splits Section */}
        {activeTab === "splits" && (
          <div className="p-6 bg-gray-700/30 rounded-xl border border-gray-600/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                <label className="text-gray-300 text-lg font-semibold">Account Splits</label>
              </div>
              <button
                type="button"
                onClick={handleAddSplit}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Split</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {splits.map((split) => (
                <div key={split.id} className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                  <div className="flex-1">
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        value={split.accountId}
                        onChange={(e) =>
                          handleSplitChange(split.id, "accountId", e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all duration-200 appearance-none cursor-pointer"
                        required
                      >
                        <option value="">Select Account</option>
                        {accounts.map((account: LedgerAccount) => (
                          <option key={account.id} value={account.id} className="bg-gray-700">
                            {account.name} ({account.account_type})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="w-32">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        value={split.amount}
                        onChange={(e) =>
                          handleSplitChange(split.id, "amount", e.target.value)
                        }
                        className="w-full pl-9 pr-3 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all duration-200 placeholder-gray-400"
                        placeholder="0.00"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                  
                  {splits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSplit(split.id)}
                      className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wallet Transfer Section */}
        {activeTab === "walletTransfer" && (
          <div className="p-6 bg-gray-700/30 rounded-xl border border-gray-600/50">
            <div className="flex items-center space-x-2 mb-6">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              <h3 className="text-gray-300 text-lg font-semibold">Transfer Details</h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-gray-300 text-sm font-semibold">
                  Transfer To Account <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={transferTarget}
                    onChange={(e) => setTransferTarget(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-700/50 text-white rounded-xl border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 appearance-none cursor-pointer"
                    required
                  >
                     <option value="">Select Target Account</option>
                    {accounts.map((account: LedgerAccount) => (
                      <option key={account.id} value={account.id} className="bg-gray-700">
                        {account.name} ({account.account_type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-gray-300 text-sm font-semibold">
                  Amount <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-700/50 text-white rounded-xl border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder-gray-400"
                    placeholder="Enter transfer amount"
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tags Section */}
        <div className="space-y-2">
          <label className="block text-gray-300 text-sm font-semibold mb-3">
            Tags
            <span className="text-gray-500 font-normal ml-1">(Optional)</span>
          </label>
          <div className="relative">
            <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Type a tag and press Enter"
              className="w-full pl-12 pr-4 py-4 bg-gray-700/50 text-white rounded-xl border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-400"
              list="tag-suggestions"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  e.preventDefault();
                  const newTag = e.currentTarget.value.trim();
                  if (!tags.map((t) => t.value).includes(newTag)) {
                    setTags((tags) => [
                      ...tags,
                      { label: newTag, value: newTag },
                    ]);
                  }
                  e.currentTarget.value = "";
                }
              }}
            />
          </div>
          <datalist id="tag-suggestions">
            {allTags.map((tag) => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {tags.map((tag) => (
                <span
                  key={tag.value}
                  className="flex items-center bg-blue-600/20 text-blue-300 px-3 py-2 rounded-full text-sm border border-blue-600/30"
                >
                  <Tag className="w-3 h-3 mr-2" />
                  {tag.label}
                  <button
                    type="button"
                    onClick={() =>
                      setTags(tags.filter((t) => t.value !== tag.value))
                    }
                    className="ml-2 text-blue-300 hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Necessary Checkbox */}
        <div className="flex items-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/50">
          <input
            type="checkbox"
            id="necessary"
            checked={necessary}
            onChange={(e) => setNecessary(e.target.checked)}
            className="w-5 h-5 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
          />
          <label htmlFor="necessary" className="ml-3 text-gray-300 font-medium cursor-pointer flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
            Mark as necessary expense
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 text-lg font-semibold transition-all duration-200 ${
              activeTab === "splits" 
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" 
                : "bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
            } text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Creating Transaction...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Create Transaction</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
