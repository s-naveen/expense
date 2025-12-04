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
      className="fixed inset-0 z-50 flex min-h-full items-start justify-center overflow-y-auto px-3 py-6 sm:items-center sm:px-6 sm:py-8"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      tabIndex={-1}
    >
      <div
        className="absolute inset-0 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm animate-overlay-in"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[calc(100vh-4rem)] animate-modal-in">
        <div className="relative flex max-h-[calc(100vh-4rem)] flex-col overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
          <div className="absolute inset-x-0 -top-32 h-64 bg-gradient-to-br from-indigo-500/15 via-blue-500/10 to-purple-500/25 blur-3xl"></div>

          <div className="relative border-b border-gray-100/70 px-6 pt-6 pb-4 sm:px-8 sm:pt-8 dark:border-gray-800/80">
            <div className="flex flex-wrap items-start justify-between gap-4">
              {title && (
                <div className="max-w-xl">
                  <h2 id="modal-title" className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                  </h2>
                  {description && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {description}
                    </p>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-full bg-white/90 dark:bg-gray-800/70 p-2.5 text-gray-600 hover:text-gray-900 hover:shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="relative flex-1 min-h-0 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
            <div className="mx-auto w-full max-w-4xl">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
