import React from 'react';

interface TacticalCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  badge?: React.ReactNode;
  raised?: boolean;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}

export const TacticalCard: React.FC<TacticalCardProps> = ({
  children,
  title,
  subtitle,
  headerAction,
  badge,
  raised = false,
  className = '',
  bodyClassName = '',
  noPadding = false,
}) => {
  const bgClass = raised ? 'bg-[#263128]' : 'bg-[#202821]';

  return (
    <div
      className={`rounded-lg border border-[#465044] ${bgClass} text-[#E8EBDD] overflow-hidden transition-all duration-150 ${className}`}
    >
      {(title || headerAction || badge) && (
        <div className="flex items-center justify-between border-b border-[#465044]/60 px-4 py-3 bg-[#1c231e]">
          <div className="flex items-center gap-2">
            <div>
              {title && (
                <h3 className="text-sm font-semibold tracking-wide text-[#E8EBDD] uppercase font-mono">
                  {title}
                </h3>
              )}
              {subtitle && <p className="text-xs text-[#A9B39F]">{subtitle}</p>}
            </div>
            {badge && <div>{badge}</div>}
          </div>
          {headerAction && <div className="flex items-center gap-2">{headerAction}</div>}
        </div>
      )}
      <div className={`${noPadding ? '' : 'p-4 sm:p-5'} ${bodyClassName}`}>{children}</div>
    </div>
  );
};
