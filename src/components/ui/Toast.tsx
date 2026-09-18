'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import clsx from 'clsx';

interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'error';
}

interface ToastApi {
  /** The verb that fired the action should match the verb in the toast ("Publish" → "Published"). */
  notify: (message: string, tone?: Toast['tone']) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const api = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-72 flex-col gap-2"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              'rounded-md border px-3 py-2 text-sm shadow-lg',
              toast.tone === 'success'
                ? 'border-line bg-raised text-ink'
                : 'border-danger/40 bg-danger/15 text-ink',
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}
