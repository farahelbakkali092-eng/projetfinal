import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ClipboardList, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './account.css';

const AccountLayout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const onLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="account-shell">
      <div className="account-container">
        <div className="account-layout">
          <aside className="account-sidebar">
            <h2 className="account-sidebar-title">Espace client</h2>
            <nav className="account-nav">
              <NavLink end to="/account">
                <User size={18} /> Mes informations
              </NavLink>
              <NavLink to="/account/orders">
                <ClipboardList size={18} /> Commandes
              </NavLink>

              <button
                className="account-btn secondary"
                onClick={onLogout}
                style={{ justifyContent: 'flex-start', width: '100%', display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <LogOut size={18} /> Déconnexion
              </button>
            </nav>
          </aside>

          <main className="account-main">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
