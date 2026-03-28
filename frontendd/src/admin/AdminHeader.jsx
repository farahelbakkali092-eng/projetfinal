import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLanguageSwitcher from './components/AdminLanguageSwitcher';
import './admin.css';

const AdminHeader = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div style={{
      background: 'rgba(253, 250, 246, 0.8)',
      borderBottom: '1px solid var(--border-light)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backdropFilter: 'blur(12px)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="admin-container" style={{ paddingTop: 12, paddingBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.8rem',
              color: 'var(--primary)',
              fontWeight: 700,
              letterSpacing: '-0.03em'
            }}>
              DAWSM <span style={{ color: 'var(--accent)', fontWeight: 400, fontSize: '1rem', letterSpacing: '0.1em', marginLeft: 5 }}>PRO</span>
            </div>

          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <AdminLanguageSwitcher />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '5px 15px', background: '#fff', borderRadius: 12, border: '1px solid var(--border-light)' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>{user?.name || t('admin.administrator')}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}></div>
              </div>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--primary)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
