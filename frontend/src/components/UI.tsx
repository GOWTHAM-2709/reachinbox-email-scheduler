import React from 'react';
import type { LucideIcon } from 'lucide-react';

export const Loading = ({ text = 'Loading...' }: { text?: string }) => (
  <div className="flex flex-col justify-center items-center h-full w-full min-h-[240px] py-12 text-slate-500">
    <div className="spinner !w-6 !h-6 mb-3"></div>
    <span className="text-sm font-medium">{text}</span>
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-lg shadow-sm';

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-4 py-2.5 gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-blue-500/20 active:bg-blue-800',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300/80 hover:border-slate-300 focus:ring-slate-400 active:bg-slate-100',
    outline:
      'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300 focus:ring-slate-400',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-rose-500/20 active:bg-rose-800',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 shadow-none focus:ring-slate-400',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <div className="spinner !w-4 !h-4 !border-t-current mr-1"></div> : null}
      {children}
    </button>
  );
};

export const Badge: React.FC<{ status: string }> = ({ status }) => {
  const normalized = status.toLowerCase();

  const configs: Record<string, { bg: string; text: string; dot: string; border: string }> = {
    sent: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
      border: 'border-emerald-200/70',
    },
    scheduled: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
      border: 'border-amber-200/70',
    },
    processing: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      dot: 'bg-blue-500 animate-pulse',
      border: 'border-blue-200/70',
    },
    failed: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      dot: 'bg-rose-500',
      border: 'border-rose-200/70',
    },
  };

  const current = configs[normalized] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
    border: 'border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.bg} ${current.text} ${current.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
      <span className="capitalize">{status}</span>
    </span>
  );
};

export const EmptyState: React.FC<{
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ icon: Icon, title, description, actionLabel, onAction }) => {
  return (
    <div className="text-center py-16 px-4">
      {Icon && (
        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
