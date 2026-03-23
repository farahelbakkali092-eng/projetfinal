import React from 'react';

const AdminTableActions = ({ onEdit, onDelete, deleteLabel = 'Supprimer' }) => {
  return (
    <div className="admin-table-actions">
      <button className="admin-btn secondary admin-btn--sm" onClick={onEdit}>Modifier</button>
      <button className="admin-btn danger admin-btn--sm" onClick={onDelete}>{deleteLabel}</button>
    </div>
  );
};

export default AdminTableActions;
