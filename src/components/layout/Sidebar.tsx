import React from 'react';
import {
  LayoutDashboard,
  Users,
  Crosshair,
  MapPin,
  Truck,
  HeartPulse,
  Wrench,
  GraduationCap,
  CloudLightning,
  ShieldAlert,
  FileBarChart2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import { useTacticalStore } from '../../hooks/useTacticalStore';

export type ActiveTab =
  | 'dashboard'
  | 'personnel'
  | 'inventory'
  | 'geo'
  | 'logistics'
  | 'medical'
  | 'maintenance'
  | 'training'
  | 'weather'
  | 'security'
  | 'reports';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const { store, activeUser, notifications, casualties, supplies, maintenanceAssets } = useTacticalStore();

  // Compute meaningful badge indicators
  const unreadCount = notifications.filter((n) => !n.read).length;
  const unverifiedCasualties = casualties.filter((c) => c.verificationStatus === 'Unverified').length;
  const criticalSupplies = supplies.filter((s) => s.replenishmentStatus === 'Critical Shortage').length;
  const overdueMaintenance = maintenanceAssets.filter((a) => a.overdue).length;

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Command Dashboard',
      shortLabel: 'Dashboard',
      icon: LayoutDashboard,
      badge: unreadCount > 0 ? `${unreadCount}` : undefined,
      badgeColor: 'bg-[#FF6464] text-white',
    },
    {
      id: 'personnel' as ActiveTab,
      label: 'Soldier Status & Casualties',
      shortLabel: 'Personnel',
      icon: Users,
      badge: unverifiedCasualties > 0 ? `${unverifiedCasualties} Unver.` : undefined,
      badgeColor: 'bg-[#F2B84B] text-[#151A17]',
    },
    {
      id: 'inventory' as ActiveTab,
      label: 'Weapons & Ammunition',
      shortLabel: 'Inventory',
      icon: Crosshair,
    },
    {
      id: 'geo' as ActiveTab,
      label: 'Geographic Analysis',
      shortLabel: 'Geo Intel',
      icon: MapPin,
    },
    {
      id: 'logistics' as ActiveTab,
      label: 'Logistics & Supply Chain',
      shortLabel: 'Logistics',
      icon: Truck,
      badge: criticalSupplies > 0 ? `${criticalSupplies} Low` : undefined,
      badgeColor: 'bg-[#FF6464] text-white',
    },
    {
      id: 'medical' as ActiveTab,
      label: 'Medical & Emergency',
      shortLabel: 'Medical',
      icon: HeartPulse,
    },
    {
      id: 'maintenance' as ActiveTab,
      label: 'Equipment Maintenance',
      shortLabel: 'Maintenance',
      icon: Wrench,
      badge: overdueMaintenance > 0 ? `${overdueMaintenance} Overdue` : undefined,
      badgeColor: 'bg-[#F2B84B] text-[#151A17]',
    },
    {
      id: 'training' as ActiveTab,
      label: 'Training & Readiness',
      shortLabel: 'Training',
      icon: GraduationCap,
    },
    {
      id: 'weather' as ActiveTab,
      label: 'Weather & Environment',
      shortLabel: 'Weather',
      icon: CloudLightning,
    },
    {
      id: 'security' as ActiveTab,
      label: 'Security & Access Control',
      shortLabel: 'Security',
      icon: ShieldAlert,
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Reports & Analytics',
      shortLabel: 'Reports',
      icon: FileBarChart2,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#151A17]/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-[#26382A] border-r border-[#465044] transition-all duration-200 select-none ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header with subtle tactical camo highlight */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-[#465044] woodland-camo-subtle">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#414B32] border border-[#747653] text-[#48C774] shadow-tactical">
              <ShieldCheck size={22} />
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="text-xs font-bold font-mono tracking-widest text-[#B7AA83] uppercase block leading-none">
                  DEFENSE COMMAND
                </span>
                <span className="text-sm font-semibold tracking-wide text-[#E8EBDD] truncate block">
                  MMS TAC-CENTER
                </span>
              </div>
            )}
          </div>
          {/* Collapse Toggle for Desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded hover:bg-[#414B32] text-[#A9B39F] hover:text-[#E8EBDD] transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Operational Status Pill */}
        <div className="px-3 py-2 border-b border-[#465044]/50 bg-[#1f2e22]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#48C774] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#48C774]"></span>
            </span>
            {!collapsed && (
              <div className="flex items-center justify-between w-full text-[11px] font-mono text-[#A9B39F]">
                <span>DEFCON 4 • SECURE</span>
                <span className="text-[#48C774]">ENCRYPTED</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium tracking-wide transition-all duration-150 relative ${
                  isActive
                    ? 'bg-[#414B32] text-[#E8EBDD] shadow-sm font-semibold border-l-4 border-l-[#B7AA83]'
                    : 'text-[#A9B39F] hover:bg-[#202821]/60 hover:text-[#E8EBDD]'
                }`}
              >
                <Icon size={18} className={`shrink-0 ${isActive ? 'text-[#48C774]' : 'text-[#747653]'}`} />
                {!collapsed && <span className="truncate text-left">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span
                    className={`ml-auto text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
                {collapsed && item.badge && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#FF6464]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card in Sidebar Bottom */}
        <div className="p-3 border-t border-[#465044] bg-[#202821]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[#414B32] text-[#E8EBDD] font-mono text-xs font-bold border border-[#747653]">
              {activeUser.rank.slice(0, 3).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="truncate text-left flex-1">
                <p className="text-xs font-semibold text-[#E8EBDD] truncate">{activeUser.displayName}</p>
                <p className="text-[11px] text-[#B7AA83] font-mono truncate">{activeUser.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
