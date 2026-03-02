import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../api';

const UsersPage = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const roleOptions = useMemo(() => roles.map((r) => ({ id: r.id, name: r.name })), [roles]);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        adminApi.listUsers({ search, page, per_page: 15 }),
        adminApi.listRoles(),
      ]);

      const paginated = usersRes?.data?.data;
      if (paginated) {
        setItems(paginated.data || []);
        setMeta({ current_page: paginated.current_page, last_page: paginated.last_page });
      }
      setRoles(rolesRes?.data?.data || []);
    } catch (e) {
      console.error(e);
      toast.error(t('admin.loading_error') || 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setUserRole = async (userId, roleId) => {
    try {
      await adminApi.updateUserRole(userId, Number(roleId));
      toast.success(t('admin.role_updated') || 'Rôle mis à jour');
      await load(meta?.current_page || 1);
    } catch (e) {
      console.error('Admin: Error updating role:', e);
      if (e.response?.data?.errors) {
        const errs = e.response.data.errors;
        Object.values(errs).flat().forEach((msg) => toast.error(String(msg)));
      } else {
        toast.error(e.response?.data?.message || 'Erreur changement rôle');
      }
    }
  };

  const onUpdateStatus = async (id, status) => {
    try {
      await adminApi.updateUserStatus(id, status);
      toast.success(t('admin.status_updated') || 'Statut mis à jour');
      await load(meta?.current_page || 1);
    } catch (e) {
      console.error('Admin: Error updating status:', e);
      if (e.response?.data?.errors) {
        const errs = e.response.data.errors;
        Object.values(errs).flat().forEach((msg) => toast.error(String(msg)));
      } else {
        toast.error(e.response?.data?.message || 'Erreur changement statut');
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="admin-page-header">
        <div>
          <h1>{t('admin.users')}</h1>
          <div className="admin-muted">{t('admin.manage_users_desc') || "Gestion des rôles et utilisateurs"}</div>
        </div>
        <div className="admin-actions">
          <input
            className="admin-input"
            placeholder={t('admin.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 260 }}
          />
          <button className="admin-btn secondary" onClick={() => load(1)}>{t('admin.filter')}</button>
        </div>
      </div>

      {loading ? (
        <div className="admin-muted">{t('admin.loading')}</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('admin.id')}</th>
              <th>{t('admin.name')}</th>
              <th>{t('admin.email') || 'Email'}</th>
              <th>{t('admin.phone')}</th>
              <th>{t('admin.role')}</th>
            </tr>
          </thead>
          <tbody>
            {items
              .filter((u) => u.role?.name !== 'admin')
              .map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.first_name} {u.last_name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>
                    <span className="admin-badge secondary">
                      {u.role?.name || t('admin.client') || 'Client'}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}

      {meta && meta.last_page > 1 && (
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button
            className="admin-btn secondary"
            disabled={meta.current_page <= 1}
            onClick={() => load(meta.current_page - 1)}
          >
            {t('admin.prev')}
          </button>
          <div className="admin-muted" style={{ alignSelf: 'center' }}>
            Page {meta.current_page} / {meta.last_page}
          </div>
          <button
            className="admin-btn secondary"
            disabled={meta.current_page >= meta.last_page}
            onClick={() => load(meta.current_page + 1)}
          >
            {t('admin.next')}
          </button>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
