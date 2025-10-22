import React from "react";
import { Link, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  DollarSign,
  TrendingUp,
  Calculator,
  Download,
  Home,
  Wallet,
  LogOut,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";

export interface NavigationItem {
  path: string;
  name: string;
  icon: LucideIcon;
  description: string;
  isLogout?: boolean;
}

interface NavigationSidebarProps {
  className?: string;
  quickStats?: {
    accounts: number;
    transactions: number;
    balance: string;
  };
}

export const navigationItems: NavigationItem[] = [
  {
    path: "/",
    name: "Dashboard",
    icon: Home,
    description: "Overview",
  },
  {
    path: "/accounts",
    name: "Accounts",
    icon: Building2,
    description: "Manage Accounts",
  },
  {
    path: "/transactions",
    name: "Transactions",
    icon: DollarSign,
    description: "View Transactions",
  },
  {
    path: "/wallet",
    name: "Wallet",
    icon: Wallet,
    description: "Manage Wallet",
  },
  {
    path: "/reports",
    name: "Reports",
    icon: TrendingUp,
    description: "Financial Reports",
  },
  {
    path: "/budget",
    name: "Budget",
    icon: Calculator,
    description: "Budget Planning",
  },
  {
    path: "/import",
    name: "Import",
    icon: Download,
    description: "Import Data",
  },
{
  path: "/logout",
  name: "Logout",
  icon: LogOut,
  description: "Sign Out",
  isLogout: true,
}
];

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  className = "",
  quickStats,
}) => {
  const location = useLocation();
   const { logout } = useAuth();

  return (
    <div className={`bg-gray-800 rounded-xl p-4 ${className}`}>
      <h3 className="text-white font-semibold mb-4">Navigation</h3>
      <div className="space-y-2">
        {navigationItems.map((item) => (
           item.isLogout ? (
            <button
              key={item.path}
              onClick={logout}
              className="w-full text-left block p-3 rounded-lg transition-all duration-200 text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-200">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </div>
            </button>
          ) : (
          <Link
            key={item.path}
            to={item.path}
            className={`block p-3 rounded-lg transition-all duration-200 group ${
              location.pathname === item.path
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            <div className="flex items-center space-x-3">
              <item.icon
                className={`w-5 h-5 ${
                  location.pathname === item.path
                    ? "text-white"
                    : "text-gray-400 group-hover:text-white"
                }`}
              />
              <div className="flex-1">
                <div
                  className={`font-medium text-sm ${
                    location.pathname === item.path
                      ? "text-white"
                      : "text-gray-200"
                  }`}
                >
                  {item.name}
                </div>
                <div
                  className={`text-xs ${
                    location.pathname === item.path
                      ? "text-gray-100"
                      : "text-gray-500"
                  }`}
                >
                  {item.description}
                </div>
              </div>
            </div>
          </Link>
        )
        ))}
      </div>

      {/* Quick Stats in Sidebar */}
      {quickStats && (
        <div className="mt-6 p-3 bg-gray-900 rounded-lg">
          <h4 className="text-gray-400 text-xs font-semibold mb-2">
            QUICK STATS
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 text-xs">Accounts</span>
              <span className="text-white text-xs font-medium">
                {quickStats.accounts}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-xs">Transactions</span>
              <span className="text-white text-xs font-medium">
                {quickStats.transactions}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-xs">Balance</span>
              <span className="text-cyan-400 text-xs font-medium">
                {quickStats.balance}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationSidebar;
