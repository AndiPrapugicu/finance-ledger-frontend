import React from "react";

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = "Connection Error",
  message,
  onRetry,
}) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <div className="text-red-600 mr-3 mt-0.5">⚠️</div>
        <div className="flex-1">
          <h3 className="text-red-800 font-medium text-sm mb-1">{title}</h3>
          <p className="text-red-700 text-sm mb-3">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
