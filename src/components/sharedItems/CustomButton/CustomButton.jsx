import React from "react";

const CustomButton = ({
  children,
  onClick,
  type = "button",
  variant = "primary", // primary, secondary, outline, danger etc.
  size = "md", // sm, md, lg
  icon: Icon, // optional icon
  disabled = false,
  loading = false,
  className = "",
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-[#0F5EF6] text-white hover:bg-[#0b4cd1] focus:ring-[#0F5EF6]",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
    outline:
      "border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 focus:ring-gray-400",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${(disabled || loading) ? "opacity-60 cursor-not-allowed" : ""} 
        ${className}
      `}
    >
      {loading ? (
        <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 mr-2"></span>
      ) : Icon ? (
        <Icon className="mr-2" />
      ) : null}
      {children}
    </button>
  );
};

export default CustomButton;
