import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, Grid2X2, ClipboardList, Users, Mail, ExternalLink, LogOut, User } from 'lucide-react';
import AdminHeader from './AdminHeader';
import { useAuth } from '../context/AuthContext';
import './admin.css';

const AdminLayout = () => {
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
                <LayoutDashboard size={18} /> Dashboard
              </NavLink>
              <NavLink to="/admin/produits">
                <Package size={18} /> Produits
              </NavLink>
              <NavLink to="/admin/marques">
                <Tags size={18} /> Marques
              </NavLink>
              <NavLink to="/admin/categories">
                <Grid2X2 size={18} /> Catégories
              </NavLink>
              <NavLink to="/admin/commandes">
                <ClipboardList size={18} /> Commandes
              </NavLink>
              <NavLink to="/admin/utilisateurs">
                <Users size={18} /> Utilisateurs
              </NavLink>
              <NavLink to="/admin/messages">
                <Mail size={18} /> Messages clients
              </NavLink>
              <NavLink to="/admin/informations">
                <User size={18} /> Mes informations
              </NavLink>

              <NavLink to="/" title="Retour vers le site">
                <ExternalLink size={18} /> Visiter le site
              </NavLink>

              <button
                className="admin-btn secondary"
                onClick={onLogout}
                style={{ justifyContent: 'flex-start', width: '100%' }}
              >
                <LogOut size={18} /> Déconnexion
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
