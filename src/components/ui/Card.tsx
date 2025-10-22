import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

const paddingClasses = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  padding = "md",
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
};
