import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Clock,
  Shield,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useTacticalStore } from '../../hooks/useTacticalStore';
import { ActiveTab } from './Sidebar';

interface TopBarProps {
  activeTab: ActiveTab;
  setMobileOpen: (open: boolean) => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setMobileOpen,
  onOpenSearch,
  onOpenNotifications,
}) => {
  const { store, activeUser, users, notifications } = useTacticalStore();
  const [timeStr, setTimeStr] = useState<string>('');
  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);

  // Live tactical UTC clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const zulu = now.toISOString().slice(11, 19) + 'Z';
      const local = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setTimeStr(`${zulu} | LOC ${local}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const tabTitles: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Central Command Dashboard',
      subtitle: 'Defensive preparedness, joint operational readiness & verified casualty overview',
    },
    personnel: {
      title: 'Soldier Status & Casualty Management',
      subtitle: 'Personnel directory, casualty incident verification & next-of-kin tracking',
    },
    inventory: {
      title: 'Weapons & Ammunition Inventory',
      subtitle: 'Controlled equipment serial tracking, custody audits & quarantine management',
    },
    geo: {
      title: 'Geographic Intelligence & Infrastructure Risk',
      subtitle: 'Terrain hazards, road accessibility assessments & disaster simulation scenarios',
    },
    logistics: {
      title: 'Logistics & Supply Chain Management',
      subtitle: 'Stock duration forecasting, automated replenishment & convoy dispatch monitoring',
    },
    medical: {
      title: 'Medical & Emergency Management',
      subtitle: 'Echelon hospital bed capacity, blood reserves & medevac evacuation workflows',
    },
    maintenance: {
      title: 'Equipment Maintenance & Readiness',
      subtitle: 'Asset registry, multi-stage repair tickets & certified PMCS inspections',
    },
    training: {
      title: 'Training & Personnel Readiness',
      subtitle: 'Course catalog, qualification expiries & combat readiness scorecards',
    },
    weather: {
      title: 'Weather & Environmental Telemetry',
      subtitle: 'Aviation flight rules (VFR/IFR), ground vehicle mobility index & hazard watches',
    },
    security: {
      title: 'Security & Access Control',
      subtitle: 'Role-based access controls, cryptographic integrity & immutable audit logs',
    },
    reports: {
      title: 'Reports & Strategic Analytics',
      subtitle: 'Standardized operational briefings, CSV data downloads & print summaries',
    },
  };

  const currentTabInfo = tabTitles[activeTab] || tabTitles.dashboard;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#465044] bg-[#151A17]/95 px-4 sm:px-6 backdrop-blur">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded p-2 text-[#A9B39F] hover:bg-[#202821] hover:text-[#E8EBDD] lg:hidden focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-bold text-[#E8EBDD] tracking-wide uppercase font-mono truncate">
              {currentTabInfo.title}
            </h1>
            <span className="hidden sm:inline-block rounded px-1.5 py-0.2 text-[10px] font-mono uppercase bg-[#26382A] text-[#B7AA83] border border-[#465044]">
              LIVE NODE
            </span>
          </div>
          <p className="hidden md:block text-xs text-[#A9B39F] truncate">
            {currentTabInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Search, Clock, Role Selector & Notifications */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 rounded-md border border-[#465044] bg-[#202821] px-2.5 py-1.5 text-xs text-[#A9B39F] hover:border-[#747653] hover:text-[#E8EBDD] transition-colors focus:outline-none"
          title="Search personnel, weapons, supplies, facilities (Ctrl+K)"
        >
          <Search size={14} className="text-[#747653]" />
          <span className="hidden sm:inline">Search Records...</span>
          <kbd className="hidden lg:inline-block rounded bg-[#151A17] px-1.5 py-0.5 text-[10px] font-mono text-[#747653] border border-[#465044]">
            ⌘K
          </kbd>
        </button>

        {/* Tactical Zulu Clock */}
        <div className="hidden xl:flex items-center gap-2 rounded border border-[#465044] bg-[#1c231e] px-2.5 py-1 text-xs font-mono text-[#B7AA83] tabular-nums">
          <Clock size={13} className="text-[#48C774]" />
          <span>{timeStr}</span>
        </div>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative rounded-md border border-[#465044] bg-[#202821] p-2 text-[#A9B39F] hover:bg-[#263128] hover:text-[#E8EBDD] transition-colors focus:outline-none"
          title="Notifications and operational alerts"
        >
          <Bell size={16} />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#FF6464] px-1 text-[10px] font-bold text-white font-mono">
              {unreadNotifications}
            </span>
          )}
        </button>

        {/* Active Role Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 rounded-md border border-[#465044] bg-[#263128] px-2.5 py-1.5 text-xs hover:border-[#B7AA83] transition-colors focus:outline-none"
          >
            <Shield size={14} className="text-[#48C774]" />
            <div className="text-left hidden sm:block">
              <span className="font-semibold text-[#E8EBDD] block leading-tight">
                {activeUser.displayName}
              </span>
              <span className="text-[10px] font-mono text-[#B7AA83] block leading-tight">
                {activeUser.role}
              </span>
            </div>
            <span className="text-[10px] bg-[#414B32] text-[#E8EBDD] px-1.5 py-0.5 rounded font-mono border border-[#747653]">
              SWITCH
            </span>
          </button>

          {/* Role Switching Dropdown Menu */}
          {showRoleMenu && (
            <div
              className="absolute right-0 mt-2 w-72 rounded-lg border border-[#465044] bg-[#202821] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95"
              onMouseLeave={() => setShowRoleMenu(false)}
            >
              <div className="px-2 py-1.5 border-b border-[#465044]/60 mb-1">
                <p className="text-[11px] font-bold font-mono uppercase text-[#B7AA83]">
                  Select Active Personnel Role
                </p>
                <p className="text-[10px] text-[#A9B39F]">
                  Demonstrates real-time RBAC permissions enforcement
                </p>
              </div>

              <div className="space-y-1 max-h-72 overflow-y-auto">
                {users.map((u) => {
                  const isSelected = u.id === activeUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        store.setActiveUser(u.id);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded text-xs transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#414B32] text-[#E8EBDD] font-semibold border-l-2 border-l-[#48C774]'
                          : 'text-[#A9B39F] hover:bg-[#263128] hover:text-[#E8EBDD]'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-[#E8EBDD]">{u.displayName}</div>
                        <div className="text-[11px] text-[#B7AA83] font-mono">{u.role}</div>
                        <div className="text-[10px] text-[#747653]">{u.assignedUnit}</div>
                      </div>
                      {isSelected && <CheckCircle2 size={14} className="text-[#48C774] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-[#465044]/60 mt-1 flex justify-between items-center px-1">
                <button
                  onClick={() => {
                    store.resetToFactoryDemo();
                    setShowRoleMenu(false);
                  }}
                  className="text-[10px] text-[#FF6464] hover:underline flex items-center gap-1"
                  title="Reset modified records back to initial military sample data"
                >
                  <RotateCcw size={10} /> Reset Demo Data
                </button>
                <span className="text-[10px] text-[#A9B39F] font-mono">
                  {activeUser.clearanceLevel}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
