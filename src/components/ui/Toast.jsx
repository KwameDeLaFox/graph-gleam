import React, { useState, useEffect } from 'react';

// Toast Context for global toast management
const ToastContext = React.createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 200);
  };

  const getToastStyles = () => {
    const baseStyles = "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-200 ease-in-out max-w-sm";
    
    if (!isVisible) {
      return `${baseStyles} translate-x-full opacity-0`;
    }

    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-50 border border-green-200 text-green-800 translate-x-0 opacity-100`;
      case 'error':
        return `${baseStyles} bg-red-50 border border-red-200 text-red-800 translate-x-0 opacity-100`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border border-yellow-200 text-yellow-800 translate-x-0 opacity-100`;
      case 'info':
        return `${baseStyles} bg-blue-50 border border-blue-200 text-blue-800 translate-x-0 opacity-100`;
      default:
        return `${baseStyles} bg-gray-50 border border-gray-200 text-gray-800 translate-x-0 opacity-100`;
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div className={getToastStyles()}>
      <span className="text-lg flex-shrink-0">{getIcon()}</span>
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={handleRemove}
        className="text-gray-400 hover:text-gray-600 flex-shrink-0 text-lg leading-none"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default Toast; 