import React from "react";
import type { LucideIcon } from "lucide-react";

interface IconProps {
  icon: LucideIcon;
  className?: string;
  size?: number | string;
}

export const Icon: React.FC<IconProps> = ({
  icon: IconComponent,
  className = "",
  size = 16,
}) => {
  return <IconComponent className={className} size={size} />;
};

export default Icon;
