import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../api';
import AdminModal from '../components/AdminModal';
import AdminTableActions from '../components/AdminTableActions';
import FormError from '../../components/FormError';

const emptyForm = { name: '', description: '' };

const BrandsPage = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const title = useMemo(() => (editing ? t('admin.edit_brand') : t('admin.add_brand')), [editing, t]);

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
      toast.error(t('admin.loading_error') || 'Impossible de charger');
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

      if (desc.length < 10 || desc.length > 300) {
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

      if (editing) {
        await adminApi.updateBrand(editing.id, fd);
        toast.success(t('admin.updated_success'));
      } else {
        await adminApi.createBrand(fd);
        toast.success(t('admin.created_success'));
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
    if (!confirm(`${t('admin.delete')} "${item.name}" ?`)) return;
    try {
      await adminApi.deleteBrand(item.id);
      toast.success(t('admin.deleted_success'));
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
          <h1>{t('admin.brands')}</h1>
        </div>
        <div className="admin-actions">
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
            <col style={{ width: '40%' }} />
            <col style={{ width: '40%' }} />
            <col style={{ width: '20%' }} />
          </colgroup>
          <thead>
            <tr>
              <th>{t('admin.name')}</th>
              <th>Slug</th>
              <th>{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id}>
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
        </div>
      </AdminModal>
    </div>
  );
};

export default BrandsPage;