'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ open, title, description, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      tabIndex={-1}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      {/* Mobile: Full-width bottom sheet | Desktop: Centered dialog */}
      <div className="relative w-full sm:max-w-2xl sm:mx-4 max-h-[95vh] sm:max-h-[90vh] flex flex-col bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 rounded-t-2xl sm:rounded-2xl overflow-hidden">
        {/* Sticky Header */}
        <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-gray-900">
          {/* Mobile drag indicator */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700 sm:hidden" />

          <div className="pt-2 sm:pt-0">
            {title && (
              <h2 id="modal-title" className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ml-2"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 pb-safe">
          {children}
        </div>
      </div>
    </div>
  );
}
