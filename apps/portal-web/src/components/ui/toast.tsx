'use client';

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons: Record<ToastType, typeof Info> = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: XCircle };

const colors: Record<ToastType, string> = {
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  success: 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  error: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const Icon = icons[toast.type];
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-right-full duration-300 ${colors[toast.type]}`}>
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.message && <p className="mt-0.5 text-xs opacity-80">{toast.message}</p>}
      </div>
      <button onClick={() => onDismiss(toast.id)} className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-4), { ...toast, id }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
