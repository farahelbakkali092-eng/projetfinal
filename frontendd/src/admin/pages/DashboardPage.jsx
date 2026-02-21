import React, { useEffect, useState } from 'react';
import { adminApi } from '../api';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getStats();
        setStats(res.data.data);
      } catch (e) {
        console.error('Failed to load stats', e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <div className="admin-muted">Statistiques globales</div>
        </div>
      </div>

      {loading ? (
        <div className="admin-muted">Chargement...</div>
      ) : (
        <div className="admin-grid-cards">
          <div className="admin-card">
            <div className="admin-card-label">Produits</div>
            <div className="admin-card-value">{stats?.products ?? 0}</div>
          </div>
          <div className="admin-card">
            <div className="admin-card-label">Commandes</div>
            <div className="admin-card-value">{stats?.orders ?? 0}</div>
          </div>
          <div className="admin-card">
            <div className="admin-card-label">Utilisateurs</div>
            <div className="admin-card-value">{stats?.users ?? 0}</div>
          </div>
          <div className="admin-card">
            <div className="admin-card-label">Marques</div>
            <div className="admin-card-value">{stats?.brands ?? 0}</div>
          </div>
          <div className="admin-card">
            <div className="admin-card-label">Catégories</div>
            <div className="admin-card-value">{stats?.categories ?? 0}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
