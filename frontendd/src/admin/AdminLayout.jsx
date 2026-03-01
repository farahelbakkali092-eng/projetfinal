import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, Grid2X2, ClipboardList, Users, ExternalLink, LogOut, User, LayoutGrid, Megaphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminHeader from './AdminHeader';
import { useAuth } from '../context/AuthContext';
import './admin.css';

const AdminLayout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const onLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="admin-shell">
      <AdminHeader />
      <div className="admin-container">
        <div className="admin-layout">
          <aside className="admin-sidebar">
            <h2 className="admin-sidebar-title">Admin</h2>
            <nav className="admin-nav">
              <NavLink end to="/admin">
                <LayoutDashboard size={18} /> {t('admin.dashboard')}
              </NavLink>
              <NavLink to="/admin/sections">
                <LayoutGrid size={18} /> {t('admin.sections')}
              </NavLink>
              <NavLink to="/admin/produits">
                <Package size={18} /> {t('admin.products')}
              </NavLink>
              <NavLink to="/admin/marques">
                <Tags size={18} /> {t('admin.brands')}
              </NavLink>
              <NavLink to="/admin/categories">
                <Grid2X2 size={18} /> {t('admin.categories')}
              </NavLink>
              <NavLink to="/admin/commandes">
                <ClipboardList size={18} /> {t('admin.orders')}
              </NavLink>
              <NavLink to="/admin/utilisateurs">
                <Users size={18} /> {t('admin.users')}
              </NavLink>
              <NavLink to="/admin/publicite">
                <Megaphone size={18} /> {t('admin.ads')}
              </NavLink>
              <NavLink to="/admin/informations">
                <User size={18} /> {t('admin.changePass')}
              </NavLink>

              <NavLink to="/" title={t('admin.visitSite')}>
                <ExternalLink size={18} /> {t('admin.visitSite')}
              </NavLink>

              <button
                className="admin-btn secondary"
                onClick={onLogout}
                style={{ justifyContent: 'flex-start', width: '100%' }}
              >
                <LogOut size={18} /> {t('admin.logout')}
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
