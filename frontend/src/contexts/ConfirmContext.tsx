import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Modal from '@components/ui/Modal';
import Button from '@components/ui/Button';

interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  resolve: ((value: boolean) => void) | null;
}

interface ConfirmContextType {
  confirm: (options?: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfirmState>({
    open: false,
    title: '',
    message: '',
    confirmText: 'Đồng ý',
    cancelText: 'Hủy',
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions = {}) => {
    return new Promise<boolean>((resolve) => {
      setState({
        open: true,
        title: options.title || 'Xác nhận',
        message: options.message || 'Bạn có chắc chắn muốn thực hiện hành động này?',
        confirmText: options.confirmText || 'Đồng ý',
        cancelText: options.cancelText || 'Hủy',
        resolve,
      });
    });
  }, []);

  const handleClose = () => {
    if (state.resolve) state.resolve(false);
    setState((prev) => ({ ...prev, open: false, resolve: null }));
  };

  const handleConfirm = () => {
    if (state.resolve) state.resolve(true);
    setState((prev) => ({ ...prev, open: false, resolve: null }));
  };

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="pearl-capsule" onClick={handleClose}>
        {state.cancelText}
      </Button>
      <Button variant="danger" onClick={handleConfirm}>
        {state.confirmText}
      </Button>
    </div>
  );

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Modal
        open={state.open}
        onClose={handleClose}
        title={state.title}
        footer={footer}
      >
        <p className="text-apple-ink-muted-80 text-[15px] leading-relaxed">{state.message}</p>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context.confirm;
}
