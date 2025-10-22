import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  message = "Loading...",
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div
        className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]} mb-4`}
      />
      {message && <p className="text-gray-600 text-sm">{message}</p>}
    </div>
  );
};
