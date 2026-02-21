import React from 'react';

const AdminTableActions = ({ onEdit, onDelete, deleteLabel = 'Supprimer' }) => {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <button className="admin-btn secondary" onClick={onEdit}>Modifier</button>
      <button className="admin-btn danger" onClick={onDelete}>{deleteLabel}</button>
    </div>
  );
};

export default AdminTableActions;
