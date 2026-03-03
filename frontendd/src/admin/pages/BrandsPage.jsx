import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { adminApi } from '../api';
import AdminModal from '../components/AdminModal';
import AdminTableActions from '../components/AdminTableActions';
import FormError from '../../components/FormError';

const emptyForm = { name: '', description: '' };

const BrandsPage = () => {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const title = useMemo(() => (editing ? 'Modifier une marque' : 'Ajouter une marque'), [editing]);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.listBrands({ search, page, per_page: 15 });
      const paginated = res?.data?.data;
      if (paginated) {
        setItems(paginated.data || []);
        setMeta({ current_page: paginated.current_page, last_page: paginated.last_page });
      }
    } catch (e) {
      console.error(e);
      toast.error('Impossible de charger les marques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async () => {
    setErrors({});
    try {
      const name = form.name.trim();
      const desc = form.description.trim();

      const newErrors = {};
      if (name.length < 3 || name.length > 50) {
        newErrors.name = ["Le nom doit contenir entre 3 et 50 caractères."];
      } else if (/^[0-9]+$/.test(name)) {
        newErrors.name = ["Le nom ne peut pas être composé uniquement de chiffres."];
      }

      if (desc.length < 10 || desc.length > 300) {
        newErrors.description = ["La description doit contenir entre 10 et 300 caractères."];
      } else if (/^[0-9]+$/.test(desc)) {
        newErrors.description = ["La description ne peut pas être composée uniquement de chiffres."];
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description || '');

      if (editing) {
        await adminApi.updateBrand(editing.id, fd);
        toast.success('Marque mise à jour');
      } else {
        await adminApi.createBrand(fd);
        toast.success('Marque créée');
      }

      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await load(meta?.current_page || 1);
    } catch (e) {
      console.error('Admin: Error submitting brand:', e);
      if (e.response?.data?.errors) {
        setErrors(e.response.data.errors);
      } else {
        setErrors({ general: [e.response?.data?.message || 'Erreur lors de l\'enregistrement'] });
      }
    }
  };

  const onEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name || '', description: item.description || '' });
    setErrors({});
    setOpen(true);
  };

  const onDelete = async (item) => {
    if (!confirm(`Supprimer la marque "${item.name}" ?`)) return;
    try {
      await adminApi.deleteBrand(item.id);
      toast.success('Marque supprimée');
      await load(meta?.current_page || 1);
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || 'Suppression impossible');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="admin-page-header">
        <div>
          <h1>Marques</h1>
          <div className="admin-muted">Gérer les marques</div>
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
              setErrors({});
              setOpen(true);
            }}
          >
            Ajouter
          </button>
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
              <th>Slug</th>
              <th style={{ width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.name}</td>
                <td><span className="admin-badge">{b.slug}</span></td>
                <td>
                  <AdminTableActions
                    onEdit={() => onEdit(b)}
                    onDelete={() => onDelete(b)}
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
          <div style={{ gridColumn: '1 / -1' }}><FormError error={errors.general} /></div>
          <div>
            <div className="admin-muted" style={{ marginBottom: 6 }}>Nom</div>
            <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <FormError error={errors.name} />
          </div>
          <div>
            <div className="admin-muted" style={{ marginBottom: 6 }}>Description</div>
            <input className="admin-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <FormError error={errors.description} />
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default BrandsPage;
