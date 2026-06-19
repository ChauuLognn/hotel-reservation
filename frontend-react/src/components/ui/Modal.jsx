export default function Modal({ open, onClose, title, footer, children, maxWidth = '560px' }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth, width: '90%' }}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="action-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
