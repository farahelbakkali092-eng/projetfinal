import React from 'react';

const AdminTableActions = ({ onEdit, onDelete, deleteLabel = 'Supprimer' }) => {
  const compactStyle = { padding: '7px 14px', fontSize: '0.82rem' };
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap' }}>
      <button className="admin-btn secondary" style={compactStyle} onClick={onEdit}>Modifier</button>
      <button className="admin-btn danger" style={compactStyle} onClick={onDelete}>{deleteLabel}</button>
    </div>
  );
};

export default AdminTableActions;
