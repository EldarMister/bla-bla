import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function PortalModal({ children, onClose, className = '' }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const modal = (
    <div className={`modal ${className}`} onMouseDown={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}>
      {children}
    </div>
  );

  return createPortal(modal, document.body);
}
