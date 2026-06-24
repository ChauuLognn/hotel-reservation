import React, { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  footer?: ReactNode;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({ open, onClose, title, footer, children, maxWidth = '560px' }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-apple-surface-black/40 backdrop-blur-[4px] flex items-center justify-center z-[1000] p-4 transition-opacity duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-apple-canvas rounded-apple-lg border border-apple-hairline overflow-hidden w-full transition-all duration-200 scale-100 flex flex-col max-h-[90vh]"
        style={{ maxWidth }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-apple-divider-soft">
          <h3 className="font-display font-semibold text-lg text-apple-ink">{title}</h3>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center text-apple-ink-muted-80 hover:bg-apple-divider-soft active-scale transition-all"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-apple-ink text-[15px]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-apple-divider-soft bg-apple-surface-pearl flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
