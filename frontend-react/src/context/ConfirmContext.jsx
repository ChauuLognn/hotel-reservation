import { createContext, useContext, useState, useCallback } from 'react';
import Modal from '../components/ui/Modal';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({
    open: false,
    title: '',
    message: '',
    confirmText: 'Đồng ý',
    cancelText: 'Hủy',
    resolve: null,
  });

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
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
    setState((prev) => ({ ...prev, open: false }));
  };

  const handleConfirm = () => {
    if (state.resolve) state.resolve(true);
    setState((prev) => ({ ...prev, open: false }));
  };

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
      <button className="btn" onClick={handleClose}>
        {state.cancelText}
      </button>
      <button className="btn btn-danger" onClick={handleConfirm}>
        {state.confirmText}
      </button>
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
        <p style={{ color: '#4b5563', fontSize: '0.95rem', margin: 0 }}>{state.message}</p>
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
