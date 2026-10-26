import React from 'react';
import { LucideIcon } from 'lucide-react';

interface TacticalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const TacticalButton: React.FC<TacticalButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded-md font-medium',
    md: 'text-sm px-3.5 py-2 gap-2 rounded-md font-medium',
    lg: 'text-base px-5 py-2.5 gap-2.5 rounded-lg font-semibold',
  }[size];

  const variantStyles = {
    primary:
      'bg-[#414B32] hover:bg-[#525e3f] text-[#E8EBDD] border border-[#747653]/60 focus:ring-2 focus:ring-[#B7AA83] shadow-sm',
    secondary:
      'bg-[#263128] hover:bg-[#202821] text-[#E8EBDD] border border-[#465044] focus:ring-2 focus:ring-[#747653]',
    danger:
      'bg-[#FF6464]/20 hover:bg-[#FF6464]/30 text-[#FF6464] border border-[#FF6464]/60 focus:ring-2 focus:ring-[#FF6464]',
    warning:
      'bg-[#F2B84B]/20 hover:bg-[#F2B84B]/30 text-[#F2B84B] border border-[#F2B84B]/60 focus:ring-2 focus:ring-[#F2B84B]',
    outline:
      'bg-transparent hover:bg-[#263128] text-[#E8EBDD] border border-[#465044] focus:ring-2 focus:ring-[#B7AA83]',
    ghost:
      'bg-transparent hover:bg-[#263128] text-[#A9B39F] hover:text-[#E8EBDD] focus:ring-1 focus:ring-[#465044]',
  }[variant];

  const iconSize = size === 'sm' ? 14 : size === 'md' ? 16 : 18;

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all duration-150 focus:outline-none select-none disabled:opacity-50 disabled:cursor-not-allowed ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block animate-spin mr-1">⟳</span>
      ) : (
        Icon && iconPosition === 'left' && <Icon size={iconSize} className="shrink-0" />
      )}
      {children}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon size={iconSize} className="shrink-0" />
      )}
    </button>
  );
};
