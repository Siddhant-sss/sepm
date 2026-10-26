import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface TacticalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  isAlert?: boolean;
}

export const TacticalModal: React.FC<TacticalModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'lg',
  isAlert = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#151A17]/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidthClasses} rounded-lg border border-[#465044] bg-[#202821] text-[#E8EBDD] shadow-2xl z-10 overflow-hidden transform transition-all duration-150 animate-in fade-in zoom-in-95`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#465044] px-5 py-4 bg-[#1a211b]">
          <div className="flex items-center gap-2.5">
            {isAlert && <AlertTriangle className="text-[#F2B84B] shrink-0" size={20} />}
            <div>
              <h3 className="text-base font-semibold tracking-wide text-[#E8EBDD] uppercase font-mono">
                {title}
              </h3>
              {subtitle && <p className="text-xs text-[#A9B39F] mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-[#A9B39F] hover:bg-[#263128] hover:text-[#E8EBDD] focus:outline-none focus:ring-1 focus:ring-[#B7AA83]"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[75vh] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-[#465044] px-5 py-3.5 bg-[#1a211b]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
