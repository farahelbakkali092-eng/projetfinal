import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search } from 'lucide-react';
import './admin.css';

const AdminHeader = () => {
  const { user } = useAuth();

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

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)' }} />
              <input
                placeholder="Rechercher..."
                className="admin-input"
                style={{ width: 260, paddingLeft: 35, paddingRight: 15, paddingTop: 8, paddingBottom: 8, fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', position: 'relative' }}>
              <Bell size={20} />
              <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%', border: '2px solid #fff' }}></div>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '5px 15px', background: '#fff', borderRadius: 12, border: '1px solid var(--border-light)' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>{user?.name || 'Administrateur'}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Boss</div>
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
