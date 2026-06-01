import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';
import './Toast.scss';

// ── Tipos ──────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error:   (message: string) => void;
  info:    (message: string) => void;
  warning: (message: string) => void;
}

// ── Context ────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

// ── Iconos inline ──────────────────────────────────────────────────────────
const ICONS: Record<ToastType, string> = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
  warning: '⚠',
};

// ── Componente individual de toast ─────────────────────────────────────────
const ToastBubble: React.FC<{ item: ToastItem; onRemove: (id: number) => void }> = ({ item, onRemove }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Pequeño delay para que entre con animación
    const t1 = setTimeout(() => setVisible(true), 10);
    // Empieza a salir a los 3.5s
    const t2 = setTimeout(() => setVisible(false), 3500);
    // Se elimina del DOM tras la animación de salida
    const t3 = setTimeout(() => onRemove(item.id), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [item.id, onRemove]);

  return (
    <div className={`toast toast--${item.type} ${visible ? 'toast--visible' : ''}`} role="alert">
      <span className="toast__icon">{ICONS[item.type]}</span>
      <span className="toast__message">{item.message}</span>
      <button className="toast__close" onClick={() => onRemove(item.id)} aria-label="Cerrar">✕</button>
    </div>
  );
};

// ── Provider ───────────────────────────────────────────────────────────────
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  let nextId = 0;

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + nextId++;
    setToasts(prev => [...prev, { id, type, message }]);
  }, []);

  const ctx: ToastContextValue = {
    showToast,
    success: (msg) => showToast(msg, 'success'),
    error:   (msg) => showToast(msg, 'error'),
    info:    (msg) => showToast(msg, 'info'),
    warning: (msg) => showToast(msg, 'warning'),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map(t => (
          <ToastBubble key={t.id} item={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// ── Hook ───────────────────────────────────────────────────────────────────
export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
};
