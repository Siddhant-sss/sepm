import React, { useState } from 'react';
import { Bell, Check, CheckCheck, AlertOctagon, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { TacticalModal } from '../common/TacticalModal';
import { useTacticalStore } from '../../hooks/useTacticalStore';
import { ActiveTab } from '../layout/Sidebar';
import { TacticalButton } from '../common/TacticalButton';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: ActiveTab) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { store, notifications } = useTacticalStore();
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'Critical' | 'Warning' | 'Info'>('ALL');

  const filtered = notifications.filter((n) => {
    if (filterSeverity === 'ALL') return true;
    return n.severity === filterSeverity;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <TacticalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Tactical Notification Center"
      subtitle="Operational alerts, low-stock warnings, weather watches & casualty incidents"
      maxWidth="xl"
      footer={
        <div className="flex w-full items-center justify-between">
          <button
            onClick={() => store.clearAllNotifications()}
            className="text-xs text-[#A9B39F] hover:text-[#E8EBDD] flex items-center gap-1.5 focus:outline-none"
          >
            <CheckCheck size={14} className="text-[#48C774]" /> Mark all as acknowledged
          </button>
          <TacticalButton variant="outline" size="sm" onClick={onClose}>
            Close
          </TacticalButton>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1.5 border-b border-[#465044] pb-3">
          {(['ALL', 'Critical', 'Warning', 'Info'] as const).map((sev) => {
            const isSelected = filterSeverity === sev;
            const count =
              sev === 'ALL'
                ? notifications.length
                : notifications.filter((n) => n.severity === sev).length;
            return (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`rounded px-2.5 py-1 text-xs font-mono font-medium transition-colors ${
                  isSelected
                    ? 'bg-[#414B32] text-[#E8EBDD] border border-[#747653]'
                    : 'text-[#A9B39F] hover:bg-[#263128] hover:text-[#E8EBDD]'
                }`}
              >
                {sev} ({count})
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-[#A9B39F]">
              <p className="text-xs font-mono">No notifications in this category</p>
            </div>
          ) : (
            filtered.map((item) => {
              const SeverityIcon =
                item.severity === 'Critical'
                  ? AlertOctagon
                  : item.severity === 'Warning'
                  ? AlertTriangle
                  : Info;

              const borderStyles =
                item.severity === 'Critical'
                  ? 'border-l-4 border-l-[#FF6464] bg-[#FF6464]/5'
                  : item.severity === 'Warning'
                  ? 'border-l-4 border-l-[#F2B84B] bg-[#F2B84B]/5'
                  : 'border-l-4 border-l-[#62B7E8] bg-[#62B7E8]/5';

              return (
                <div
                  key={item.id}
                  className={`rounded border border-[#465044] p-3 text-xs transition-colors ${borderStyles} ${
                    item.read ? 'opacity-70' : 'opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <SeverityIcon
                        size={16}
                        className={`mt-0.5 shrink-0 ${
                          item.severity === 'Critical'
                            ? 'text-[#FF6464]'
                            : item.severity === 'Warning'
                            ? 'text-[#F2B84B]'
                            : 'text-[#62B7E8]'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#E8EBDD]">{item.title}</span>
                          {!item.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#48C774]" />
                          )}
                        </div>
                        <p className="mt-1 text-[#A9B39F] leading-relaxed">{item.message}</p>
                        <div className="mt-2 flex items-center gap-3 text-[11px] font-mono text-[#747653]">
                          <span>{item.module}</span>
                          <span>•</span>
                          <span>{item.timestamp}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 items-end shrink-0">
                      {!item.read && (
                        <button
                          onClick={() => store.markNotificationAsRead(item.id)}
                          className="rounded p-1 text-[#A9B39F] hover:bg-[#263128] hover:text-[#48C774] transition-colors"
                          title="Acknowledge alert"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      {item.linkModule && (
                        <button
                          onClick={() => {
                            onNavigate(item.linkModule as ActiveTab);
                            onClose();
                          }}
                          className="flex items-center gap-1 text-[11px] text-[#B7AA83] hover:text-[#E8EBDD] font-mono mt-1"
                        >
                          View <ArrowRight size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </TacticalModal>
  );
};
