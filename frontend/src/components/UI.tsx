import React from 'react';
import type { LucideIcon } from 'lucide-react';

export const Loading = ({ text = 'Loading...' }: { text?: string }) => (
  <div className="flex flex-col justify-center items-center h-full w-full min-h-[260px] py-12 text-slate-400">
    <div className="spinner !w-7 !h-7 mb-3 !border-t-blue-500"></div>
    <span className="text-sm font-medium tracking-wide text-slate-400">{text}</span>
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
      'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/25 focus:ring-blue-500 border border-blue-400/20',
    secondary:
      'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 focus:ring-slate-500 shadow-sm',
    glass:
      'bg-white/10 hover:bg-white/15 text-white backdrop-blur-md border border-white/15 hover:border-white/30 focus:ring-white/40 shadow-lg',
    outline:
      'bg-transparent hover:bg-slate-800 text-slate-300 border border-slate-700 focus:ring-slate-500',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500 shadow-rose-500/25 border border-rose-400/20',
    ghost:
      'bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 focus:ring-slate-500',
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
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      dot: 'bg-emerald-400',
      border: 'border-emerald-500/20',
    },
    scheduled: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      dot: 'bg-amber-400',
      border: 'border-amber-500/20',
    },
    processing: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      dot: 'bg-blue-400 animate-ping',
      border: 'border-blue-500/20',
    },
    failed: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      dot: 'bg-rose-400',
      border: 'border-rose-500/20',
    },
  };

  const current = configs[normalized] || {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    dot: 'bg-slate-400',
    border: 'border-slate-500/20',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${current.bg} ${current.text} ${current.border} backdrop-blur-sm`}
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
        <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-blue-400 mb-4 shadow-inner">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
