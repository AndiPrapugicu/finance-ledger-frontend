import React, { useState, useEffect } from "react";
import {
  Wallet as WalletIcon,
  Plus,
  CreditCard,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Eye,
  EyeOff,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { NavigationSidebar } from "../components/NavigationSidebar";
import { LoadingSpinner, ErrorAlert, Button, Card } from "../components";
import { useWallet, useToast } from "../hooks";
import { WalletService } from "../services";

const Wallet: React.FC = () => {
  const {
    wallet,
    walletSummary,
    transactions,
    paymentMethods,
    loading,
    transactionsLoading,
    paymentMethodsLoading,
    error,
    refetchWallet,
    refetchTransactions,
    refetchPaymentMethods,
    addFunds,
    createPaymentMethod,
    setDefaultPaymentMethod,
  } = useWallet();

  const { showToast } = useToast();

  const [showBalance, setShowBalance] = useState(true);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);

  // Add funds form state
  const [addFundsForm, setAddFundsForm] = useState({
    amount: "",
    description: "",
    payment_method_id: "",
  });

  // Payment method form state
  const [paymentMethodForm, setPaymentMethodForm] = useState<{
    name: string;
    payment_type: "card" | "bank" | "paypal" | "crypto";
    card_number: string;
    last_four_digits: string;
    card_brand: string;
    expires_month: string;
    expires_year: string;
    cvv: string;
    is_default: boolean;
  }>({
    name: "",
    payment_type: "card",
    card_number: "",
    last_four_digits: "",
    card_brand: "",
    expires_month: "",
    expires_year: "",
    cvv: "",
    is_default: false,
  });

  useEffect(() => {
    // Load transactions and payment methods when component mounts
    refetchTransactions();
    refetchPaymentMethods();
  }, [refetchTransactions, refetchPaymentMethods]);

  // Helper function to format card number (add spaces every 4 digits)
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "").replace(/\D/g, "");
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(" ").substring(0, 19); // Max 16 digits + 3 spaces
  };

  // Helper function to detect card brand from number
  const detectCardBrand = (cardNumber: string) => {
    const cleaned = cardNumber.replace(/\s/g, "");
    
    if (/^4/.test(cleaned)) return "Visa";
    if (/^5[1-5]/.test(cleaned)) return "Mastercard";
    if (/^3[47]/.test(cleaned)) return "American Express";
    if (/^6(?:011|5)/.test(cleaned)) return "Discover";
    if (/^(?:2131|1800|35)/.test(cleaned)) return "JCB";
    
    // If not recognized, return "Other" for validation purposes
    return cleaned.length >= 13 ? "Other" : "";
  };

  // Handle card number input with auto-formatting and brand detection
  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    const cleaned = formatted.replace(/\s/g, "");
    const lastFour = cleaned.slice(-4);
    const brand = detectCardBrand(cleaned);
    
    setPaymentMethodForm({
      ...paymentMethodForm,
      card_number: formatted,
      last_four_digits: lastFour,
      card_brand: brand || paymentMethodForm.card_brand,
    });
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: wallet?.currency || "USD",
    }).format(numAmount);
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addFundsForm.amount || parseFloat(addFundsForm.amount) <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    const result = await addFunds({
      amount: addFundsForm.amount,
      description: addFundsForm.description || "Funds added",
      payment_method_id: addFundsForm.payment_method_id
        ? parseInt(addFundsForm.payment_method_id)
        : undefined,
    });

    if (result.success) {
      showToast(result.message, "success");
      setShowAddFunds(false);
      setAddFundsForm({ amount: "", description: "", payment_method_id: "" });
    } else {
      showToast(result.message, "error");
    }
  };

  const handleCreatePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentMethodForm.name) {
      showToast("Please enter a payment method name", "error");
      return;
    }

    // Validate card details if payment type is card
    if (paymentMethodForm.payment_type === "card") {
      const cardNumber = paymentMethodForm.card_number.replace(/\s/g, "");
      
      if (cardNumber.length < 13 || cardNumber.length > 19) {
        showToast("Invalid card number length", "error");
        return;
      }
      
      if (!paymentMethodForm.expires_month || !paymentMethodForm.expires_year) {
        showToast("Please enter card expiry date", "error");
        return;
      }
      
      if (!paymentMethodForm.cvv || paymentMethodForm.cvv.length < 3) {
        showToast("Please enter valid CVV", "error");
        return;
      }
      
      // Validate expiry date is not in the past
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const expiryYear = parseInt(paymentMethodForm.expires_year);
      const expiryMonth = parseInt(paymentMethodForm.expires_month);
      
      if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        showToast("Card has expired", "error");
        return;
      }
    }

    // Debug: Log what we're sending
    const payload = {
      name: paymentMethodForm.name,
      payment_type: paymentMethodForm.payment_type,
      last_four_digits: paymentMethodForm.last_four_digits,
      card_brand: paymentMethodForm.card_brand,
      expires_month: paymentMethodForm.expires_month
        ? parseInt(paymentMethodForm.expires_month)
        : undefined,
      expires_year: paymentMethodForm.expires_year
        ? parseInt(paymentMethodForm.expires_year)
        : undefined,
      is_default: paymentMethodForm.is_default,
    };
    
    console.log("[DEBUG] Creating payment method with payload:", payload);
    
    const result = await createPaymentMethod(payload);

    if (result.success) {
      showToast(result.message, "success");
      setShowAddPaymentMethod(false);
      setPaymentMethodForm({
        name: "",
        payment_type: "card",
        card_number: "",
        last_four_digits: "",
        card_brand: "",
        expires_month: "",
        expires_year: "",
        cvv: "",
        is_default: false,
      });
    } else {
      showToast(result.message, "error");
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="w-4 h-4 text-green-400" />;
      case "withdrawal":
        return <ArrowUpRight className="w-4 h-4 text-red-400" />;
      case "income":
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "expense":
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "deposit":
      case "income":
        return "text-green-400";
      case "withdrawal":
      case "expense":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <LoadingSpinner message="Loading wallet..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="px-6 py-8">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <WalletIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Digital Wallet</h1>
              <p className="text-gray-400">Manage your funds and payments</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => refetchWallet()}
              variant="secondary"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </header>

        {error && <ErrorAlert message={error} />}

        <div className="grid grid-cols-12 gap-6">
          {/* Navigation Sidebar */}
          <div className="col-span-2">
            <NavigationSidebar />
          </div>

          {/* Main Content */}
          <div className="col-span-10">
            {/* Wallet Balance Card */}
            <Card className="mb-8 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <WalletIcon className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">Wallet Balance</h2>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title={showBalance ? "Hide balance" : "Show balance"}
                    >
                      {showBalance ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <p className="text-blue-100 text-sm mb-2">
                      Available Balance
                    </p>
                    <p className="text-4xl font-bold">
                      {showBalance
                        ? formatCurrency(wallet?.balance || "0")
                        : "••••••"}
                    </p>
                  </div>

                  {walletSummary && (
                    <>
                      <div>
                        <p className="text-blue-100 text-sm mb-2">
                          Total Deposits
                        </p>
                        <p className="text-2xl font-semibold text-green-200">
                          {showBalance
                            ? formatCurrency(walletSummary.total_deposits)
                            : "••••••"}
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-100 text-sm mb-2">
                          Total Spent
                        </p>
                        <p className="text-2xl font-semibold text-red-200">
                          {showBalance
                            ? formatCurrency(walletSummary.total_withdrawals)
                            : "••••••"}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-4 mt-8">
                  <Button
                    onClick={() => setShowAddFunds(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Funds
                  </Button>
                  <Button
                    onClick={() => setShowAddPaymentMethod(true)}
                    variant="secondary"
                    className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <Card className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-700 border border-gray-600 shadow-xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                      Recent Transactions
                    </h3>
                    <Button
                      onClick={() => refetchTransactions()}
                      variant="secondary"
                      size="sm"
                      disabled={transactionsLoading}
                      className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-300"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${
                          transactionsLoading ? "animate-spin" : ""
                        }`}
                      />
                    </Button>
                  </div>

                  {transactionsLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="sm" />
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <DollarSign className="w-8 h-8 opacity-50" />
                      </div>
                      <p className="text-lg font-medium mb-2">No transactions yet</p>
                      <p className="text-sm text-gray-500">Add funds to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {transactions.slice(0, 5).map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl border border-gray-600/30 hover:bg-gray-700/70 transition-all duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                              {getTransactionIcon(transaction.transaction_type)}
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {transaction.description}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {new Date(
                                  transaction.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-semibold text-lg ${getTransactionColor(
                                transaction.transaction_type
                              )}`}
                            >
                              {transaction.transaction_type === "withdrawal" ||
                              transaction.transaction_type === "expense"
                                ? "-"
                                : "+"}
                              {formatCurrency(transaction.amount)}
                            </p>
                            <p className="text-gray-400 text-sm capitalize">
                              {transaction.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Payment Methods */}
              <Card className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-700 border border-gray-600 shadow-xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                        <CreditCard className="w-4 h-4 text-white" />
                      </div>
                      Payment Methods
                    </h3>
                    <Button
                      onClick={() => refetchPaymentMethods()}
                      variant="secondary"
                      size="sm"
                      disabled={paymentMethodsLoading}
                      className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-300"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${
                          paymentMethodsLoading ? "animate-spin" : ""
                        }`}
                      />
                    </Button>
                  </div>

                  {paymentMethodsLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="sm" />
                    </div>
                  ) : paymentMethods.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="w-8 h-8 opacity-50" />
                      </div>
                      <p className="text-lg font-medium mb-2">No payment methods</p>
                      <p className="text-sm text-gray-500">
                        Add a payment method to get started
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {paymentMethods.map((method) => {
                        // Check if card is expired
                        const isExpired = method.expires_month && method.expires_year 
                          ? (() => {
                              const currentDate = new Date();
                              const expiryDate = new Date(method.expires_year, method.expires_month - 1);
                              return expiryDate < currentDate;
                            })()
                          : false;
                        
                        return (
                          <div
                            key={method.id}
                            className={`p-4 rounded-xl border transition-all duration-200 ${
                              method.is_default
                                ? "border-blue-500 bg-blue-500/10 shadow-lg"
                                : isExpired
                                ? "border-red-500/30 bg-red-500/5"
                                : "border-gray-600/50 bg-gray-700/30 hover:bg-gray-700/50"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  method.is_default 
                                    ? "bg-blue-500" 
                                    : isExpired
                                    ? "bg-red-500/50"
                                    : "bg-gray-600"
                                }`}>
                                  <CreditCard className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <p className="text-white font-medium truncate">
                                      {method.name}
                                    </p>
                                    {isExpired && (
                                      <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-xs rounded font-medium flex-shrink-0">
                                        Expired
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-400 text-sm">
                                    {method.card_brand && `${method.card_brand} `}
                                    {method.payment_type === "card" &&
                                      method.last_four_digits &&
                                      `•••• ${method.last_four_digits}`}
                                  </p>
                                  {method.expires_month && method.expires_year && (
                                    <p className={`text-xs mt-1 ${
                                      isExpired ? "text-red-400" : "text-gray-500"
                                    }`}>
                                      Expires {String(method.expires_month).padStart(2, '0')}/{String(method.expires_year).slice(-2)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
                                {method.is_default && (
                                  <span className="px-3 py-1 bg-blue-500 text-blue-100 text-xs rounded-full font-medium">
                                    Default
                                  </span>
                                )}
                                {!method.is_default && (
                                  <button
                                    onClick={() =>
                                      setDefaultPaymentMethod(method.id)
                                    }
                                    className="px-3 py-1 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                                  >
                                    Set Default
                                  </button>
                                )}
                                <button
                                  onClick={async () => {
                                    if (window.confirm(`Are you sure you want to delete "${method.name}"?`)) {
                                      try {
                                        await WalletService.deletePaymentMethod(method.id);
                                        showToast("Payment method deleted successfully", "success");
                                        refetchPaymentMethods();
                                      } catch (error) {
                                        showToast("Failed to delete payment method", "error");
                                      }
                                    }
                                  }}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                  title="Delete payment method"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-700 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-600">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Add Funds</h3>
              </div>
              <button
                onClick={() => setShowAddFunds(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddFunds} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-gray-300 text-sm font-semibold mb-3">
                  Amount <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg font-semibold">
                    $
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={addFundsForm.amount}
                    onChange={(e) =>
                      setAddFundsForm({ ...addFundsForm, amount: e.target.value })
                    }
                    className="w-full pl-8 pr-4 py-4 bg-gray-700/50 text-white text-lg rounded-xl border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 placeholder-gray-400"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-gray-300 text-sm font-semibold mb-3">
                  Description
                  <span className="text-gray-500 font-normal ml-1">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={addFundsForm.description}
                  onChange={(e) =>
                    setAddFundsForm({
                      ...addFundsForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-4 bg-gray-700/50 text-white rounded-xl border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-400"
                  placeholder="Enter description (e.g., Salary deposit)"
                />
              </div>
              
              {paymentMethods.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-gray-300 text-sm font-semibold mb-3">
                    Payment Method
                    <span className="text-gray-500 font-normal ml-1">(Optional)</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={addFundsForm.payment_method_id}
                      onChange={(e) =>
                        setAddFundsForm({
                          ...addFundsForm,
                          payment_method_id: e.target.value,
                        })
                      }
                      className="w-full pl-12 pr-4 py-4 bg-gray-700/50 text-white rounded-xl border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="">Choose payment method</option>
                      {paymentMethods.map((method) => (
                        <option key={method.id} value={method.id} className="bg-gray-700">
                          {method.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-4 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddFunds(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600 py-3 text-base font-medium"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 text-base font-semibold shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Funds
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      {showAddPaymentMethod && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-700 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-600">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Add Payment Method</h3>
              </div>
              <button
                onClick={() => setShowAddPaymentMethod(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreatePaymentMethod} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-gray-300 text-sm font-semibold mb-3">
                  Payment Method Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={paymentMethodForm.name}
                  onChange={(e) =>
                    setPaymentMethodForm({
                      ...paymentMethodForm,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-4 bg-gray-700/50 text-white rounded-xl border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-400"
                  placeholder="e.g., My Visa Card, Main Bank Account"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-gray-300 text-sm font-semibold mb-3">
                  Payment Type <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={paymentMethodForm.payment_type}
                    onChange={(e) =>
                      setPaymentMethodForm({
                        ...paymentMethodForm,
                        payment_type: e.target.value as
                          | "card"
                          | "bank"
                          | "paypal"
                          | "crypto",
                      })
                    }
                    className="w-full pl-12 pr-4 py-4 bg-gray-700/50 text-white rounded-xl border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="card" className="bg-gray-700">Credit/Debit Card</option>
                    <option value="bank" className="bg-gray-700">Bank Account</option>
                    <option value="paypal" className="bg-gray-700">PayPal</option>
                    <option value="crypto" className="bg-gray-700">Cryptocurrency</option>
                  </select>
                </div>
              </div>
              
              {paymentMethodForm.payment_type === "card" && (
                <div className="space-y-4 p-5 bg-gray-700/30 rounded-xl border border-gray-600/50">
                  <div className="flex items-center space-x-2 text-sm text-blue-300 mb-2">
                    <CreditCard className="w-4 h-4" />
                    <span className="font-semibold">Card Details</span>
                  </div>
                  
                  {/* Card Number */}
                  <div className="space-y-2">
                    <label className="block text-gray-300 text-sm font-semibold">
                      Card Number <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={paymentMethodForm.card_number}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        maxLength={19}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-400 text-sm font-mono"
                        placeholder="1234 5678 9012 3456"
                        required={paymentMethodForm.payment_type === "card"}
                      />
                      {paymentMethodForm.card_brand && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded font-semibold">
                            {paymentMethodForm.card_brand}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 ml-1">
                      Card brand will be auto-detected from the number
                    </p>
                  </div>
                  
                  {/* Expiry Date and CVV */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <label className="block text-gray-300 text-sm font-semibold">
                        Month <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={paymentMethodForm.expires_month}
                        onChange={(e) =>
                          setPaymentMethodForm({
                            ...paymentMethodForm,
                            expires_month: e.target.value,
                          })
                        }
                        className="w-full px-3 py-3 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-sm"
                        required={paymentMethodForm.payment_type === "card"}
                      >
                        <option value="">MM</option>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = String(i + 1).padStart(2, '0');
                          return (
                            <option key={month} value={month} className="bg-gray-700">
                              {month}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-gray-300 text-sm font-semibold">
                        Year <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={paymentMethodForm.expires_year}
                        onChange={(e) =>
                          setPaymentMethodForm({
                            ...paymentMethodForm,
                            expires_year: e.target.value,
                          })
                        }
                        className="w-full px-3 py-3 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-sm"
                        required={paymentMethodForm.payment_type === "card"}
                      >
                        <option value="">YY</option>
                        {Array.from({ length: 15 }, (_, i) => {
                          const year = new Date().getFullYear() + i;
                          return (
                            <option key={year} value={String(year)} className="bg-gray-700">
                              {String(year).slice(-2)}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-gray-300 text-sm font-semibold">
                        CVV <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={paymentMethodForm.cvv}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          setPaymentMethodForm({
                            ...paymentMethodForm,
                            cvv: value,
                          });
                        }}
                        className="w-full px-3 py-3 bg-gray-700/50 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-400 text-sm font-mono"
                        placeholder="123"
                        required={paymentMethodForm.payment_type === "card"}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/50">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={paymentMethodForm.is_default}
                  onChange={(e) =>
                    setPaymentMethodForm({
                      ...paymentMethodForm,
                      is_default: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="is_default" className="ml-3 text-gray-300 font-medium cursor-pointer">
                  Set as default payment method
                </label>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddPaymentMethod(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600 py-3 text-base font-medium"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 text-base font-semibold shadow-lg"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Add Method
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
