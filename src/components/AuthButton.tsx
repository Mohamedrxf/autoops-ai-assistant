// /src/components/AuthButton.tsx

import React from "react";
import { motion } from "framer-motion";

interface AuthButtonProps {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  type?: "button" | "submit";
  icon?: React.ReactNode;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  label,
  onClick,
  variant = "primary",
  type = "button",
  icon,
}) => {
  const isPrimary = variant === "primary";

  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
        isPrimary
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
          : "bg-slate-700 border border-gray-600 text-white hover:bg-slate-600 hover:border-gray-500"
      }`}
    >
      {icon && <span>{icon}</span>}
      {label}
    </motion.button>
  );
};
