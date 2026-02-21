import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './admin.css';

const AdminHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const onLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div style={{
      background: 'var(--bg-header)',
      borderBottom: '1px solid var(--border-light)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backdropFilter: 'blur(10px)'
    }}>
      <div className="admin-container" style={{ paddingTop: 14, paddingBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--burgundy)' }}>
              Administration
            </div>
            <div className="admin-muted">Connecté: {user?.email}</div>
          </div>
          <div />
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
