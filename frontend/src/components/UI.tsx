import React from 'react';
import type { LucideIcon } from 'lucide-react';

export const Loading = ({ text = 'Loading...' }: { text?: string }) => (
  <div className="flex flex-col justify-center items-center h-full w-full min-h-[260px] py-12 text-slate-500 dark:text-slate-400">
    <div className="spinner !w-7 !h-7 mb-3 !border-t-blue-600"></div>
    <span className="text-sm font-medium tracking-wide">{text}</span>
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'glass';
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
    'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl active:scale-[0.98]';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5 shadow-lg',
  };

  const variantClasses = {
    primary:
      'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 focus:ring-blue-500 border border-blue-500/30',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300/80 shadow-sm dark:bg-slate-800/90 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 focus:ring-slate-400',
    glass:
      'bg-white/80 hover:bg-white text-slate-800 border border-slate-200 shadow-sm backdrop-blur-md dark:bg-white/10 dark:hover:bg-white/15 dark:text-white dark:border-white/15 focus:ring-blue-500',
    outline:
      'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-700 focus:ring-slate-400',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/25 border border-rose-500/30 focus:ring-rose-500',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:text-slate-400 dark:hover:text-slate-200 focus:ring-slate-400',
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
      bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
      text: '',
      dot: 'bg-emerald-500 dark:bg-emerald-400',
      border: 'border-emerald-200/80 dark:border-emerald-500/20',
    },
    scheduled: {
      bg: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
      text: '',
      dot: 'bg-amber-500 dark:bg-amber-400',
      border: 'border-amber-200/80 dark:border-amber-500/20',
    },
    processing: {
      bg: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
      text: '',
      dot: 'bg-blue-500 dark:bg-blue-400 animate-ping',
      border: 'border-blue-200/80 dark:border-blue-500/20',
    },
    failed: {
      bg: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
      text: '',
      dot: 'bg-rose-500 dark:bg-rose-400',
      border: 'border-rose-200/80 dark:border-rose-500/20',
    },
  };

  const current = configs[normalized] || {
    bg: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400',
    text: '',
    dot: 'bg-slate-400',
    border: 'border-slate-200 dark:border-slate-500/20',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.bg} ${current.border} backdrop-blur-sm`}
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
        <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-sm">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
