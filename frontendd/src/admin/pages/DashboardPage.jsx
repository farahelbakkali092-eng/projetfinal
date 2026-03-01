import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../api';

const DashboardPage = () => {
  const { t } = useTranslation();
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
          <h1>{t('admin.dashboard')}</h1>
          <div className="admin-muted">{t('admin.welcome') || 'Statistiques globales'}</div>
        </div>
      </div>

      {loading ? (
        <div className="admin-muted">{t('admin.loading')}</div>
      ) : (
        <div className="admin-grid-cards">
          <div className="admin-card">
            <div className="admin-card-label">{t('admin.products')}</div>
            <div className="admin-card-value font-heading">{stats?.products ?? 0}</div>
          </div>
          <div className="admin-card">
            <div className="admin-card-label">{t('admin.orders')}</div>
            <div className="admin-card-value font-heading">{stats?.orders ?? 0}</div>
          </div>
          <div className="admin-card">
            <div className="admin-card-label">{t('admin.users')}</div>
            <div className="admin-card-value font-heading">{stats?.users ?? 0}</div>
          </div>
          <div className="admin-card">
            <div className="admin-card-label">{t('admin.brands')}</div>
            <div className="admin-card-value font-heading">{stats?.brands ?? 0}</div>
          </div>
          <div className="admin-card">
            <div className="admin-card-label">{t('admin.categories')}</div>
            <div className="admin-card-value font-heading">{stats?.categories ?? 0}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
