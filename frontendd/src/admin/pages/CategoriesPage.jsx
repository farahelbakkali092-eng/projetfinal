import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../api';
import AdminModal from '../components/AdminModal';
import AdminTableActions from '../components/AdminTableActions';
import FormError from '../../components/FormError';

const emptyForm = { name: '', description: '', image: null, section_id: '' };

const toastSuccessStyle = {
  style: { background: '#10b981', color: '#fff', textAlign: 'center' },
  iconTheme: { primary: '#fff', secondary: '#10b981' }
};

const toastDeleteStyle = {
  style: { background: '#ef4444', color: '#fff', textAlign: 'center' },
  iconTheme: { primary: '#fff', secondary: '#ef4444' }
};

const CategoriesPage = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [sections, setSections] = useState([]);
  const title = useMemo(() => (editing ? t('admin.edit_category') : t('admin.add_category')), [editing, t]);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const [catRes, secRes] = await Promise.all([
        adminApi.listCategories({ search, page, per_page: 15 }),
        adminApi.listSections()
      ]);

      const paginated = catRes?.data?.data || catRes?.data;
      if (paginated && paginated.data) {
        setItems(paginated.data);
        setMeta({ current_page: paginated.current_page, last_page: paginated.last_page });
      } else if (Array.isArray(paginated)) {
        setItems(paginated);
      }
      setSections(secRes?.data?.data || []);
    } catch (e) {
      console.error('Admin: Error loading categories:', e);
      if (e.response?.data?.errors) {
        const errs = e.response.data.errors;
        Object.values(errs).flat().forEach((msg) => toast.error(String(msg)));
      } else {
        toast.error(e.response?.data?.message || t('admin.loading_error') || 'Impossible de charger');
      }
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
        newErrors.name = [t('admin.name_error')];
      } else if (/^[0-9]+$/.test(name)) {
        newErrors.name = [t('admin.name_num_error')];
      }

      if (desc.length < 10 || desc.length > 500) {
        newErrors.description = [t('admin.desc_error')];
      } else if (/^[0-9]+$/.test(desc)) {
        newErrors.description = [t('admin.desc_num_error')];
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description || '');
      if (form.section_id) {
        fd.append('section_id', form.section_id);
      }
      if (form.image) {
        fd.append('image', form.image);
      }

      if (editing) {
        await adminApi.updateCategory(editing.id, fd);
        toast.success('Catégorie mise à jour', toastSuccessStyle);
      } else {
        await adminApi.createCategory(fd);
        toast.success('Catégorie créée', toastSuccessStyle);
      }

      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await load(meta?.current_page || 1);
    } catch (e) {
      console.error('Admin: Error submitting category:', e);
      if (e.response?.data?.errors) {
        setErrors(e.response.data.errors);
      } else {
        setErrors({ general: [e.response?.data?.message || t('admin.save_error') || 'Erreur'] });
      }
    }
  };

  const onEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name || '',
      description: item.description || '',
      image: null,
      section_id: item.section_id || ''
    });
    setErrors({});
    setOpen(true);
  };

  const onDelete = async (item) => {
    if (!confirm(`${t('admin.delete')} "${item.name}" ?`)) return;
    try {
      await adminApi.deleteCategory(item.id);
      toast('Produit supprimé avec succès', { icon: '🗑️', ...toastDeleteStyle });
      await load(meta?.current_page || 1);
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || t('admin.delete_error'));
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="admin-page-header">
        <div>
          <h1>{t('admin.categories')}</h1>
        </div>
        <div className="admin-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            className="admin-input"
            placeholder={t('admin.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 260 }}
          />
          <button
            className="admin-btn secondary"
            onClick={() => load(1)}
          >
            {t('admin.filter')}
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
            {t('admin.add')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-muted">{t('admin.loading')}</div>
      ) : (
        <table className="admin-table">
          <colgroup>
            <col style={{ width: '8%' }} />
            <col style={{ width: '28%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '24%' }} />
            <col style={{ width: '20%' }} />
          </colgroup>
          <thead>
            <tr>
              <th>{t('admin.image')}</th>
              <th>{t('admin.name')}</th>
              <th>{t('admin.section')}</th>
              <th>Slug</th>
              <th>{t('admin.actions')}</th>
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
                <td>{c.name}</td>
                <td>
                  {c.section ? (
                    <span className="admin-badge secondary">{c.section.name}</span>
                  ) : (
                    <span className="admin-muted">{t('admin.none')}</span>
                  )}
                </td>
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
        <div className="admin-pagination">
          <button
            className="admin-btn secondary"
            disabled={meta.current_page <= 1}
            onClick={() => load(meta.current_page - 1)}
          >
            {t('admin.prev')}
          </button>
          <div className="admin-muted admin-pagination__label">
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

      <AdminModal
        title={title}
        open={open}
        onClose={() => setOpen(false)}
        footer={(
          <>
            <button className="admin-btn secondary" onClick={() => setOpen(false)}>{t('admin.cancel')}</button>
            <button className="admin-btn" onClick={onSubmit}>{editing ? t('admin.save') : t('admin.create')}</button>
          </>
        )}
      >
        <div className="admin-form-grid">
          <div style={{ gridColumn: '1 / -1' }}><FormError error={errors.general} /></div>
          <div>
            <div className="admin-muted" style={{ marginBottom: 6 }}>{t('admin.name')}</div>
            <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <FormError error={errors.name} />
          </div>
          <div>
            <div className="admin-muted" style={{ marginBottom: 6 }}>Description</div>
            <input className="admin-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <FormError error={errors.description} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="admin-muted" style={{ marginBottom: 6 }}>{t('admin.parent_section')}</div>
            <select
              className="admin-input"
              value={form.section_id}
              onChange={(e) => setForm({ ...form, section_id: e.target.value })}
            >
              <option value="">{t('admin.select_section')}</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <FormError error={errors.section_id} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="admin-muted" style={{ marginBottom: 6 }}>{t('admin.image')}</div>
            <input
              className="admin-input"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
            />
            <FormError error={errors.image} />
            {editing?.image_url && !form.image && (
              <div className="admin-muted" style={{ marginTop: 8 }}>
                {t('admin.current_image')}:
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