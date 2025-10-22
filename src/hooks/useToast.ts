import React from "react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  showToast: (message: string, type: Toast["type"]) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export const useToast = (): ToastContextType => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export { ToastContext };
export type { Toast, ToastContextType };
