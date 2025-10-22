import React, { useState } from "react";
import { AccountsService } from "../../services";
import { useToast } from "../../hooks";
import type { AccountType, CreateAccountRequest } from "../../types";
import { Button, Card } from "../../components/ui";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountCreated: () => void;
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  isOpen,
  onClose,
  onAccountCreated,
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<CreateAccountRequest>({
    name: "",
    account_type: "ASSET",
    parent: null,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  const accountTypes: { value: AccountType; label: string; icon: string }[] = [
    { value: "ASSET", label: "Asset", icon: "💰" },
    { value: "LIABILITY", label: "Liability", icon: "💳" },
    { value: "EQUITY", label: "Equity", icon: "🏦" },
    { value: "INCOME", label: "Income", icon: "💵" },
    { value: "EXPENSE", label: "Expense", icon: "💸" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast("Account name is required", "error");
      return;
    }

    setLoading(true);
    try {
      const newAccount = await AccountsService.createAccount(formData);
      showToast(
        `Account "${newAccount.name}" created successfully!`,
        "success"
      );
      onAccountCreated();
      onClose();
      // Reset form
      setFormData({
        name: "",
        account_type: "ASSET",
        parent: null,
        is_active: true,
      });
    } catch (error) {
      const apiError = error as { message?: string };
      showToast(apiError.message || "Failed to create account", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateAccountRequest,
    value: string | boolean | number | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  console.log("🚀 CreateAccountModal is rendering! isOpen:", isOpen);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem",
      }}
    >
      <div className="w-full max-w-md">
        <Card>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ➕ Create New Account
            </h2>
            <p className="text-gray-600">
              Add a new account to your financial ledger
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Checking Account, Office Supplies"
                required
              />
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type *
              </label>
              <select
                value={formData.account_type}
                onChange={(e) =>
                  handleInputChange(
                    "account_type",
                    e.target.value as AccountType
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {accountTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  handleInputChange("is_active", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="is_active"
                className="ml-2 block text-sm text-gray-700"
              >
                Active account
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Creating..." : "Create Account"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
