import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ClipboardList, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './account.css';

const AccountLayout = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const onLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
    : '?';

  return (
    <div className="account-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Jost:wght@300;400;500&display=swap');

        .account-shell {
          min-height: 100vh;
          background: #fdf6f1;
          font-family: 'Jost', sans-serif;
        }

        /* Blobs décoratifs en arrière-plan */
        .account-shell::before {
          content: '';
          position: fixed;
          width: 500px; height: 500px;
          background: rgba(244, 194, 194, 0.13);
          border-radius: 50%;
          filter: blur(80px);
          top: -120px; left: -120px;
          pointer-events: none;
          z-index: 0;
        }

        .account-shell::after {
          content: '';
          position: fixed;
          width: 600px; height: 600px;
          background: rgba(253, 186, 116, 0.09);
          border-radius: 50%;
          filter: blur(90px);
          bottom: -160px; right: -160px;
          pointer-events: none;
          z-index: 0;
        }

        .account-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px 24px 80px;
          position: relative;
          z-index: 1;
        }

        .account-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 28px;
          align-items: start;
        }

        /* ── SIDEBAR ── */
        .account-sidebar {
          background: #fff;
          border: 1px solid #ecddd8;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 2px 16px rgba(38,24,18,0.06);
          position: sticky;
          top: 24px;
        }

        /* Avatar / user info */
        .account-sidebar-user {
          padding: 24px 20px 20px;
          background: #fdf9f7;
          border-bottom: 1px solid #f0e6e0;
          text-align: center;
        }

        .account-avatar {
          width: 52px; height: 52px;
          background: linear-gradient(135deg, #c4a098, #d4a373);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.3rem;
          font-weight: 400;
          color: #fff;
          margin: 0 auto 10px;
          letter-spacing: 0.05em;
        }

        .account-sidebar-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem;
          font-weight: 400;
          color: #261812;
          margin: 0 0 2px;
          letter-spacing: 0.01em;
        }

        .account-sidebar-email {
          font-size: 0.7rem;
          color: #b89080;
          font-weight: 300;
          letter-spacing: 0.04em;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Nav links */
        .account-nav {
          padding: 12px 10px 16px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .account-nav a,
        .account-nav-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          border-radius: 10px;
          font-family: 'Jost', sans-serif;
          font-size: 0.82rem;
          font-weight: 400;
          color: #8e6458;
          text-decoration: none;
          letter-spacing: 0.03em;
          transition: background 0.18s, color 0.18s;
          cursor: pointer;
        }

        .account-nav a:hover,
        .account-nav-btn:hover {
          background: #fdf0eb;
          color: #261812;
        }

        .account-nav a.active {
          background: #fdf0eb;
          color: #261812;
          font-weight: 500;
        }

        .account-nav a.active svg {
          color: #d4a373;
        }

        .account-nav-btn {
          background: none;
          border: none;
          width: 100%;
          margin-top: 4px;
        }

        .account-nav-divider {
          height: 1px;
          background: #f0e6e0;
          margin: 8px 10px;
        }

        .account-nav-btn:hover svg {
          color: #ef4444;
        }

        /* ── MAIN CONTENT ── */
        .account-main {
          background: #fff;
          border: 1px solid #ecddd8;
          border-radius: 20px;
          padding: 32px 32px 36px;
          box-shadow: 0 2px 16px rgba(38,24,18,0.06);
          min-height: 480px;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .account-layout {
            grid-template-columns: 1fr;
          }
          .account-sidebar {
            position: static;
          }
          .account-main {
            padding: 24px 18px 28px;
          }
          .account-container {
            padding: 24px 16px 60px;
          }
        }
      `}</style>

      <div className="account-container">
        <div className="account-layout">

          {/* ── SIDEBAR ── */}
          <aside className="account-sidebar">

            {/* Avatar + nom */}
            <div className="account-sidebar-user">
              <div className="account-avatar">{initials}</div>
              {user && (
                <>
                  <p className="account-sidebar-name">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="account-sidebar-email">{user.email}</p>
                </>
              )}
            </div>

            {/* Navigation */}
            <nav className="account-nav">
              <NavLink end to="/account">
                <User size={16} /> Mes informations
              </NavLink>
              <NavLink to="/account/orders">
                <ClipboardList size={16} /> Commandes
              </NavLink>

              <div className="account-nav-divider" />

              <button className="account-nav-btn" onClick={onLogout}>
                <LogOut size={16} /> Déconnexion
              </button>
            </nav>
          </aside>

          {/* ── CONTENU ── */}
          <main className="account-main">
            <Outlet />
          </main>

        </div>
      </div>
    </div>
  );
};

export default AccountLayout;