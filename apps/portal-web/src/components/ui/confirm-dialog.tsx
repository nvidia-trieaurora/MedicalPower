'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType>({ confirm: async () => false });

export function useConfirm() { return useContext(ConfirmContext); }

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((v: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleClose = (result: boolean) => {
    setOpen(false);
    resolver?.(result);
    setResolver(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 ${
                options?.variant === 'destructive' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
              }`}>
                <AlertTriangle className={`h-5 w-5 ${
                  options?.variant === 'destructive' ? 'text-red-600' : 'text-amber-600'
                }`} />
              </div>
              <div>
                <DialogTitle>{options?.title}</DialogTitle>
                <DialogDescription className="mt-1">{options?.message}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => handleClose(false)}>
              {options?.cancelLabel || 'Hủy'}
            </Button>
            <Button
              variant={options?.variant === 'destructive' ? 'destructive' : 'default'}
              onClick={() => handleClose(true)}
            >
              {options?.confirmLabel || 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}
