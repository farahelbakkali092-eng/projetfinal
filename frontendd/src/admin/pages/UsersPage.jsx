import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { adminApi } from '../api';

const UsersPage = () => {
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
      toast.error('Impossible de charger les utilisateurs');
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
      toast.success('Rôle mis à jour');
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
      toast.success('Statut mis à jour');
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
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Utilisateurs</h1>
          <div className="admin-muted">Rôles et activation/désactivation</div>
        </div>
        <div className="admin-actions">
          <input
            className="admin-input"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 260 }}
          />
          <button className="admin-btn secondary" onClick={() => load(1)}>Filtrer</button>
        </div>
      </div>

      {loading ? (
        <div className="admin-muted">Chargement...</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Rôle</th>
              <th>Actif</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.first_name} {u.last_name}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>
                  <select
                    className="admin-input"
                    value={u.role_id}
                    onChange={(e) => setUserRole(u.id, e.target.value)}
                    style={{ maxWidth: 160 }}
                  >
                    {roleOptions.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    className={u.is_active ? 'admin-btn secondary' : 'admin-btn'}
                    onClick={() => onUpdateStatus(u.id, !u.is_active)}
                  >
                    {u.is_active ? 'Actif' : 'Désactivé'}
                  </button>
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
            Précédent
          </button>
          <div className="admin-muted" style={{ alignSelf: 'center' }}>
            Page {meta.current_page} / {meta.last_page}
          </div>
          <button
            className="admin-btn secondary"
            disabled={meta.current_page >= meta.last_page}
            onClick={() => load(meta.current_page + 1)}
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
