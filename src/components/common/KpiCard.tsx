import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'critical' | 'info';
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  onClick?: () => void;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  trend,
  onClick,
  className = '',
}) => {
  const variantStyles = {
    default: {
      accentBorder: 'border-l-4 border-l-[#747653]',
      iconBg: 'bg-[#26382A] text-[#B7AA83]',
      valueColor: 'text-[#E8EBDD]',
    },
    success: {
      accentBorder: 'border-l-4 border-l-[#48C774]',
      iconBg: 'bg-[#48C774]/15 text-[#48C774]',
      valueColor: 'text-[#48C774]',
    },
    warning: {
      accentBorder: 'border-l-4 border-l-[#F2B84B]',
      iconBg: 'bg-[#F2B84B]/15 text-[#F2B84B]',
      valueColor: 'text-[#F2B84B]',
    },
    critical: {
      accentBorder: 'border-l-4 border-l-[#FF6464]',
      iconBg: 'bg-[#FF6464]/15 text-[#FF6464]',
      valueColor: 'text-[#FF6464]',
    },
    info: {
      accentBorder: 'border-l-4 border-l-[#62B7E8]',
      iconBg: 'bg-[#62B7E8]/15 text-[#62B7E8]',
      valueColor: 'text-[#62B7E8]',
    },
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-[#465044] bg-[#202821] p-4 sm:p-5 transition-all duration-150 ${
        variantStyles.accentBorder
      } ${
        onClick ? 'cursor-pointer hover:bg-[#263128] hover:border-[#747653]' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-[#A9B39F] font-mono">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight tabular-nums ${variantStyles.valueColor}`}
            >
              {value}
            </span>
            {trend && (
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? 'text-[#48C774]' : 'text-[#FF6464]'
                }`}
              >
                {trend.value} {trend.label && <span className="text-[#A9B39F]">{trend.label}</span>}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-[#A9B39F]">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-md ${variantStyles.iconBg} shrink-0`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};
