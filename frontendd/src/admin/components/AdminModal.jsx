import React from 'react';
import '../admin.css';

const AdminModal = ({ title, open, onClose, children, footer }) => {
  if (!open) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        {children}
        <div className="admin-modal-footer">
          {footer}
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
