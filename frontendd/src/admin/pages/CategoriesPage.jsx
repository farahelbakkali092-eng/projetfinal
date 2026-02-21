import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { adminApi } from '../api';
import AdminModal from '../components/AdminModal';
import AdminTableActions from '../components/AdminTableActions';

const emptyForm = { name: '', description: '', image: null };

const CategoriesPage = () => {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const title = useMemo(() => (editing ? 'Modifier une catégorie' : 'Ajouter une catégorie'), [editing]);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.listCategories({ search, page, per_page: 15 });
      const paginated = res.data.data;
      setItems(paginated.data);
      setMeta({ current_page: paginated.current_page, last_page: paginated.last_page });
    } catch (e) {
      console.error(e);
      toast.error('Impossible de charger les catégories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async () => {
    try {
      if (!form.name.trim()) {
        toast.error('Le nom est obligatoire');
        return;
      }

      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description || '');
      if (form.image) {
        fd.append('image', form.image);
      }

      if (editing) {
        await adminApi.updateCategory(editing.id, fd);
        toast.success('Catégorie mise à jour');
      } else {
        await adminApi.createCategory(fd);
        toast.success('Catégorie créée');
      }

      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await load(meta?.current_page || 1);
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || 'Erreur');
    }
  };

  const onEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name || '', description: item.description || '', image: null });
    setOpen(true);
  };

  const onDelete = async (item) => {
    if (!confirm(`Supprimer la catégorie "${item.name}" ?`)) return;
    try {
      await adminApi.deleteCategory(item.id);
      toast.success('Catégorie supprimée');
      await load(meta?.current_page || 1);
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || 'Suppression impossible');
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Catégories</h1>
          <div className="admin-muted">Gérer les catégories</div>
        </div>
        <div className="admin-actions">
          <input
            className="admin-input"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 260 }}
          />
          <button
            className="admin-btn secondary"
            onClick={() => load(1)}
          >
            Filtrer
          </button>
          <button
            className="admin-btn"
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
              setOpen(true);
            }}
          >
            + Ajouter
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-muted">Chargement...</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>ID</th>
              <th>Nom</th>
              <th>Slug</th>
              <th style={{ width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>
                  {c.image_url ? (
                    <img
                      src={c.image_url}
                      alt={c.name}
                      style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-light)' }}
                    />
                  ) : (
                    <span className="admin-muted">-</span>
                  )}
                </td>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td><span className="admin-badge">{c.slug}</span></td>
                <td>
                  <AdminTableActions
                    onEdit={() => onEdit(c)}
                    onDelete={() => onDelete(c)}
                  />
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

      <AdminModal
        title={title}
        open={open}
        onClose={() => setOpen(false)}
        footer={(
          <>
            <button className="admin-btn secondary" onClick={() => setOpen(false)}>Annuler</button>
            <button className="admin-btn" onClick={onSubmit}>{editing ? 'Enregistrer' : 'Créer'}</button>
          </>
        )}
      >
        <div className="admin-form-grid">
          <div>
            <div className="admin-muted" style={{ marginBottom: 6 }}>Nom</div>
            <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <div className="admin-muted" style={{ marginBottom: 6 }}>Description</div>
            <input className="admin-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="admin-muted" style={{ marginBottom: 6 }}>Image</div>
            <input
              className="admin-input"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
            />
            {editing?.image_url && !form.image && (
              <div className="admin-muted" style={{ marginTop: 8 }}>
                Image actuelle:
                <div style={{ marginTop: 6 }}>
                  <img
                    src={editing.image_url}
                    alt={editing.name}
                    style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border-light)' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default CategoriesPage;
