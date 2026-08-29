import React from 'react';

export const Loading = () => (
  <div className="flex justify-center items-center h-full w-full min-h-[200px]">
    <div className="spinner"></div>
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', isLoading, className = '', ...props }) => {
  const baseClasses = "px-4 py-2 rounded-md font-medium flex justify-center items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  
  let variantClasses = "";
  if (variant === 'primary') {
    variantClasses = "bg-blue-600 text-white hover:bg-blue-700";
  } else if (variant === 'secondary') {
    variantClasses = "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50";
  } else if (variant === 'danger') {
    variantClasses = "bg-red-600 text-white hover:bg-red-700";
  }

  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? <div className="spinner !w-5 !h-5 !border-t-white mr-2"></div> : null}
      {children}
    </button>
  );
};

export const Badge: React.FC<{ status: string }> = ({ status }) => {
  const normalized = status.toLowerCase();
  let color = "bg-gray-100 text-gray-800";
  
  if (normalized === 'sent') color = "bg-green-100 text-green-800";
  if (normalized === 'failed') color = "bg-red-100 text-red-800";
  if (normalized === 'processing') color = "bg-blue-100 text-blue-800";
  if (normalized === 'scheduled') color = "bg-yellow-100 text-yellow-800";

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
      {status}
    </span>
  );
};
