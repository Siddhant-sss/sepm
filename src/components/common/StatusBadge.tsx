import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Clock,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';

export type StatusVariant =
  | 'success'
  | 'operational'
  | 'active'
  | 'confirmed'
  | 'serviceable'
  | 'adequate'
  | 'cleared'
  | 'warning'
  | 'caution'
  | 'under-inspection'
  | 'restricted'
  | 'reorder'
  | 'surge'
  | 'critical'
  | 'emergency'
  | 'fatal'
  | 'missing'
  | 'deceased'
  | 'shortage'
  | 'blocked'
  | 'info'
  | 'pending'
  | 'unverified'
  | 'in-transit'
  | 'hospitalized'
  | 'neutral'
  | 'on-leave';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  size = 'md',
  className = '',
  showIcon = true,
}) => {
  // Map raw status text if variant not explicitly provided
  const resolvedVariant: StatusVariant =
    variant ||
    (() => {
      const s = status.toLowerCase();
      if (
        s.includes('active') ||
        s.includes('operational') ||
        s.includes('confirmed') ||
        s.includes('serviceable') ||
        s.includes('adequate') ||
        s.includes('cleared') ||
        s.includes('success')
      ) {
        return 'success';
      }
      if (
        s.includes('warning') ||
        s.includes('caution') ||
        s.includes('restricted') ||
        s.includes('inspection') ||
        s.includes('reorder') ||
        s.includes('surge')
      ) {
        return 'warning';
      }
      if (
        s.includes('critical') ||
        s.includes('emergency') ||
        s.includes('fatal') ||
        s.includes('missing') ||
        s.includes('deceased') ||
        s.includes('shortage') ||
        s.includes('blocked') ||
        s.includes('danger')
      ) {
        return 'critical';
      }
      if (
        s.includes('hospital') ||
        s.includes('injured') ||
        s.includes('pending') ||
        s.includes('unverified') ||
        s.includes('transit') ||
        s.includes('info')
      ) {
        return 'info';
      }
      return 'neutral';
    })();

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  const iconSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16;

  let badgeStyles = 'bg-[#202821] text-[#A9B39F] border-[#465044]';
  let IconComponent = HelpCircle;

  switch (resolvedVariant) {
    case 'success':
    case 'operational':
    case 'active':
    case 'confirmed':
    case 'serviceable':
    case 'adequate':
    case 'cleared':
      badgeStyles = 'bg-[#48C774]/15 text-[#48C774] border-[#48C774]/40';
      IconComponent = CheckCircle2;
      break;

    case 'warning':
    case 'caution':
    case 'under-inspection':
    case 'restricted':
    case 'reorder':
    case 'surge':
      badgeStyles = 'bg-[#F2B84B]/15 text-[#F2B84B] border-[#F2B84B]/40';
      IconComponent = AlertTriangle;
      break;

    case 'critical':
    case 'emergency':
    case 'fatal':
    case 'missing':
    case 'deceased':
    case 'shortage':
    case 'blocked':
      badgeStyles = 'bg-[#FF6464]/15 text-[#FF6464] border-[#FF6464]/40 font-medium animate-pulse-subtle';
      IconComponent = AlertOctagon;
      break;

    case 'info':
    case 'pending':
    case 'unverified':
    case 'in-transit':
    case 'hospitalized':
      badgeStyles = 'bg-[#62B7E8]/15 text-[#62B7E8] border-[#62B7E8]/40';
      IconComponent = Info;
      break;

    case 'neutral':
    case 'on-leave':
    default:
      badgeStyles = 'bg-[#26382A]/50 text-[#B7AA83] border-[#465044]';
      IconComponent = Clock;
      break;
  }

  return (
    <span
      className={`inline-flex items-center rounded border font-medium uppercase tracking-wider tabular-nums select-none ${sizeClasses} ${badgeStyles} ${className}`}
    >
      {showIcon && <IconComponent size={iconSize} className="shrink-0" />}
      <span>{status}</span>
    </span>
  );
};
