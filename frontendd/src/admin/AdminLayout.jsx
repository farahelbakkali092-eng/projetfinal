import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tags, Grid2X2,
  ClipboardList, Users, ExternalLink, LogOut,
  User, LayoutGrid, Megaphone, Menu, X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminHeader from './AdminHeader';
import { useAuth } from '../context/AuthContext';
import './admin.css';

const AdminLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const onLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const navItems = [
    { to: "/admin", icon: LayoutDashboard, label: t('admin.dashboard'), end: true },
    { to: "/admin/sections", icon: LayoutGrid, label: t('admin.sections') },
    { to: "/admin/produits", icon: Package, label: t('admin.products') },
    { to: "/admin/marques", icon: Tags, label: t('admin.brands') },
    { to: "/admin/categories", icon: Grid2X2, label: t('admin.categories') },
    { to: "/admin/commandes", icon: ClipboardList, label: t('admin.orders') },
    { to: "/admin/utilisateurs", icon: Users, label: t('admin.users') },
    { to: "/admin/publicite", icon: Megaphone, label: t('admin.ads') },
    { to: "/admin/informations", icon: User, label: t('admin.changePass') },
  ];

  return (
    <div className="admin-shell">
      <AdminHeader />
      <div className="admin-container">
        <div className="admin-layout" style={{ gridTemplateColumns: sidebarOpen ? '280px 1fr' : '80px 1fr' }}>
          <aside className="admin-sidebar" style={{ width: sidebarOpen ? '280px' : '80px', padding: sidebarOpen ? '30px 20px' : '30px 10px' }}>
            <div style={{ display: 'flex', justifyContent: sidebarOpen ? 'space-between' : 'center', alignItems: 'center', marginBottom: 30 }}>
              {sidebarOpen && <h2 className="admin-sidebar-title" style={{ marginBottom: 0 }}>DAWSM</h2>}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={24} />}
              </button>
            </div>

            <nav className="admin-nav">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  end={item.end}
                  to={item.to}
                  title={!sidebarOpen ? item.label : ''}
                  style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '14px 18px' : '14px' }}
                >
                  <item.icon size={20} />
                  {sidebarOpen && <span>{item.label}</span>}
                </NavLink>
              ))}

              <div style={{ margin: '20px 0', borderTop: '1px solid var(--border-light)' }}></div>

              <NavLink to="/" title={t('admin.visitSite')} style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '14px 18px' : '14px' }}>
                <ExternalLink size={20} />
                {sidebarOpen && <span>{t('admin.visitSite')}</span>}
              </NavLink>

              <button
                className="admin-btn secondary"
                onClick={onLogout}
                style={{
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  width: '100%',
                  padding: sidebarOpen ? '14px 18px' : '14px',
                  border: 'none',
                  background: '#fff5f5'
                }}
              >
                <LogOut size={20} color="#b91c1c" />
                {sidebarOpen && <span style={{ color: '#b91c1c' }}>{t('admin.logout')}</span>}
              </button>
            </nav>
          </aside>

          <main className="admin-main">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
