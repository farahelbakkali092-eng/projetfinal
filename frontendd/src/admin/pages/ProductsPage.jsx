import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../api';
import AdminModal from '../components/AdminModal';
import AdminTableActions from '../components/AdminTableActions';
import FormError from '../../components/FormError';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  price_sold: '',
  discount: '',
  stock: 0,
  category_id: '',
  brand_id: '',
  section_id: '',
  capacity: '',
  reference: '',
  image: null,
};

const ProductsPage = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [importErrors, setImportErrors] = useState([]);

  const downloadTemplate = () => {
    const headers = ['name', 'description', 'price', 'price_sold', 'discount', 'stock', 'category', 'brand', 'section'];
    const example = ['Product Name', 'Short description', '100.00', '80.00', '20', '50', 'Makeup', 'L\'Oreal', 'FEMME'];
    const csvContent = [headers.join(','), example.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'products_template.csv');
    link.click();
  };

  const title = useMemo(() => (editing ? `${t('admin.edit')} ${t('admin.products').toLowerCase()}` : `${t('admin.create')} ${t('admin.products').toLowerCase()}`), [editing, t]);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const [productsRes, brandsRes, categoriesRes, sectionsRes] = await Promise.all([
        adminApi.listProducts({ search, page, per_page: 12 }),
        adminApi.listBrands({ per_page: 100 }),
        adminApi.listCategories({ per_page: 100 }),
        adminApi.listSections({ per_page: 100 }),
      ]);

      const paginated = productsRes?.data?.data || productsRes?.data;
      if (paginated && paginated.data) {
        setItems(paginated.data);
        setMeta({ current_page: paginated.current_page, last_page: paginated.last_page });
      } else if (Array.isArray(paginated)) {
        setItems(paginated);
      }

      const bData = brandsRes?.data?.data?.data || brandsRes?.data?.data || brandsRes?.data;
      setBrands(Array.isArray(bData) ? bData : (bData?.data || []));

      const cData = categoriesRes?.data?.data?.data || categoriesRes?.data?.data || categoriesRes?.data;
      setCategories(Array.isArray(cData) ? cData : (cData?.data || []));

      setSections(sectionsRes?.data?.data || []);
    } catch (e) {
      console.error('Admin: Error loading products:', e);
      toast.error(t('admin.loading_error') || 'Impossible de charger les produits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || '',
      description: p.description || '',
      price: p.price || '',
      price_sold: p.price_sold || '',
      discount: p.discount || '',
      stock: p.stock || 0,
      category_id: p.category_id || p.category?.id || '',
      brand_id: p.brand_id || p.brand?.id || '',
      section_id: p.section_id || p.section?.id || '',
      capacity: p.capacity || '',
      reference: p.reference || '',
      image: null,
    });
    setErrors({});
    setOpen(true);
  };

  const onDelete = async (p) => {
    if (!confirm(`${t('admin.delete')} "${p.name}" ?`)) return;
    try {
      await adminApi.deleteProduct(p.id);
      toast.success(t('admin.deleted_success') || 'Produit supprimé');
      await load(meta?.current_page || 1);
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || 'Suppression impossible');
    }
  };

  const exportToCSV = () => {
    if (items.length === 0) return toast.error('Aucun produit à exporter');

    const headers = ['ID', 'Nom', 'Réf', 'Description', 'Prix', 'Prix Soldé', 'Remise', 'Stock', 'Catégorie', 'Marque', 'Section', 'Contenance'];
    const rows = items.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${(p.reference || '').replace(/"/g, '""')}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`,
      p.price,
      p.price_sold || '',
      p.discount || '',
      p.stock,
      `"${(p.category?.name || p.category_id || '').replace(/"/g, '""')}"`,
      `"${(p.brand?.name || p.brand_id || '').replace(/"/g, '""')}"`,
      `"${(p.section?.name || '').replace(/"/g, '""')}"`,
      `"${(p.capacity || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export terminé');
  };

  const onSubmit = async () => {
    setErrors({});
    try {
      // 1. Validations Frontend Strictes
      const name = form.name.trim();
      const desc = form.description.trim();
      const price = Number(form.price);
      const stock = Number(form.stock);
      const priceSold = form.price_sold !== '' ? Number(form.price_sold) : null;

      // Check name (3-50 chars, no digits only)
      if (name.length < 3 || name.length > 50) return toast.error('Le nom doit faire entre 3 et 50 caractères');
      if (/^[0-9]+$/.test(name)) return toast.error('Le nom ne peut pas être composé uniquement de chiffres');

      // Check description (10-300 chars, no digits only)
      if (desc.length < 10 || desc.length > 300) return toast.error('La description doit faire entre 10 et 300 caractères');
      if (/^[0-9]+$/.test(desc)) return toast.error('La description ne peut pas être composée uniquement de chiffres');

      // Check price (10 - 10,000)
      if (price < 10 || price > 10000) return toast.error('Le prix doit être entre 10 et 10 000 MAD');

      // Check stock (0 - 50,000)
      if (stock < 0 || stock > 50000) return toast.error('Le stock ne peut pas dépasser 50 000');

      // Check promotional price
      if (priceSold !== null) {
        if (priceSold <= 5) return toast.error('Le prix promotionnel doit être supérieur à 5 MAD');
        if (priceSold >= price) return toast.error('Le prix promotionnel doit être inférieur au prix normal');
      }

      if (!form.category_id) return toast.error('Catégorie obligatoire');
      if (!form.brand_id) return toast.error('Marque obligatoire');

      const fd = new FormData();
      fd.append('name', name);
      fd.append('description', desc);
      fd.append('price', String(price));

      if (priceSold !== null) {
        fd.append('price_sold', String(priceSold));
        // Recalculer le discount exact pour le backend au cas où
        const disc = Math.round((1 - priceSold / price) * 100);
        fd.append('discount', String(disc));
      } else {
        fd.append('discount', '0');
      }

      fd.append('stock', String(stock));
      fd.append('category_id', String(form.category_id));
      fd.append('brand_id', String(form.brand_id));

      if (form.section_id) fd.append('section_id', String(form.section_id));
      if (form.capacity) fd.append('capacity', form.capacity);
      if (form.reference) fd.append('reference', form.reference);

      if (form.image) {
        fd.append('images[]', form.image);
      }

      if (editing) {
        await adminApi.updateProduct(editing.id, fd);
        toast.success('Produit mis à jour');
      } else {
        await adminApi.createProduct(fd);
        toast.success('Produit créé');
      }

      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      await load(meta?.current_page || 1);
    } catch (e) {
      console.error(e);
      if (e.response?.data?.errors) {
        setErrors(e.response.data.errors);
      } else {
        toast.error(e.response?.data?.message || 'Erreur');
      }
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportErrors([]);
    const fd = new FormData();
    fd.append('file', file);

    const loadingToast = toast.loading('Importation en cours...');
    try {
      const res = await adminApi.importProducts(fd);
      toast.dismiss(loadingToast);

      const { imported, errors, total_processed } = res.data?.data || {};

      if (errors && errors.length > 0) {
        setImportErrors(errors);
        toast.error(`${errors.length} erreurs lors de l'import.`);
      }

      if (imported > 0) {
        toast.success(`${imported} / ${total_processed || imported} produits importés !`);
        load(1);
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.message || 'Erreur lors de l’import');
    } finally {
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>{t('admin.products')}</h1>
          <div className="admin-muted">CRUD produits + association marque/catégorie</div>
        </div>
        <div className="admin-actions">
          <input
            className="admin-input"
            placeholder={t('admin.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 220 }}
          />
          <button className="admin-btn secondary" onClick={() => load(1)}>{t('admin.filter')}</button>
          <button className="admin-btn secondary" onClick={exportToCSV} title="Exporter les produits">Exporter CSV </button>

          <button className="admin-btn secondary" onClick={downloadTemplate} title="Télécharger le modèle CSV">Modèle CSV</button>

          <label className="admin-btn secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Importer un fichier CSV">
            Importer CSV
            <input type="file" accept=".csv" onChange={handleImport} style={{ display: 'none' }} />
          </label>

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

      {importErrors.length > 0 && (
        <div style={{ background: '#fff1f1', border: '1px solid #fecaca', padding: 15, borderRadius: 8, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#991b1b', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
            <span>⚠️ Erreurs lors de l'importation :</span>
            <button onClick={() => setImportErrors([])} style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontSize: 11, textDecoration: 'underline' }}>Tout effacer</button>
          </div>
          <ul style={{ margin: 0, padding: '0 0 0 20px', maxHeight: 150, overflowY: 'auto' }}>
            {importErrors.map((err, i) => (
              <li key={i} style={{ fontSize: 12, color: '#991b1b', marginBottom: 4 }}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {loading ? (
        <div className="admin-muted">{t('admin.loading')}</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('admin.image')}</th>
              <th>{t('admin.id')}</th>
              <th>{t('admin.name')}</th>
              <th>{t('admin.category')}</th>
              <th>{t('admin.brand')}</th>
              <th>Réf</th>
              <th>{t('admin.price')}</th>
              <th>{t('admin.stock')}</th>
              <th>{t('admin.section')}</th>
              <th style={{ width: 220 }}>{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              (() => {
                const mainImg = (p.images || []).find((im) => im.is_main) || (p.images || [])[0];
                const url = mainImg?.image_url;
                return (
                  <tr key={p.id}>
                    <td>
                      {url ? (
                        <img
                          src={url}
                          alt={p.name}
                          style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-light)' }}
                        />
                      ) : (
                        <span className="admin-muted">-</span>
                      )}
                    </td>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td>{p.category?.name || p.category_id}</td>
                    <td>{p.brand?.name || p.brand_id}</td>
                    <td style={{ fontSize: 11, color: '#666' }}>{p.reference || '-'}</td>
                    <td>{p.price}</td>
                    <td><span className="admin-badge">{p.stock}</span></td>
                    <td>
                      {p.section ? (
                        <span className="admin-badge secondary">{p.section.name}</span>
                      ) : (
                        <span className="admin-muted">{t('admin.none')}</span>
                      )}
                    </td>
                    <td>
                      <AdminTableActions
                        onEdit={() => onEdit(p)}
                        onDelete={() => onDelete(p)}
                      />
                    </td>
                  </tr>
                );
              })()
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
          <div>
            <div className="admin-muted" style={{ marginBottom: 6 }}>{t('admin.name')}</div>
            <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <FormError error={errors.name} />
          </div>
          <div>
            <div className="admin-muted" style={{ marginBottom: 6 }}>{t('admin.price')} (MAD)</div>
            <input className="admin-input" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <FormError error={errors.price} />
          </div>
          <div>
            <div className="admin-muted" style={{ marginBottom: 6 }}>{t('admin.stock')}</div>
            <input className="admin-input" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            <FormError error={errors.stock} />
          </div>
          <div>
            <div className="admin-muted" style={{ marginBottom: 6 }}>Référence (optionnel)</div>
            <input
              className="admin-input"
              placeholder="Ex: REF-123"
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
            />
            <FormError error={errors.reference} />
          </div>
          <div style={{ gridColumn: '1 / -1', background: '#fff8f0', border: '1px solid #f5dfc8', borderRadius: 8, padding: '14px 16px' }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10, color: '#c0675a' }}>🏷️ Promotion (Prix Soldé)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div className="admin-muted" style={{ marginBottom: 6 }}>Nouveau prix soldé (MAD)</div>
                <input
                  className="admin-input"
                  type="number"
                  step="0.01"
                  placeholder="Laisser vide = pas de promo"
                  value={form.price_sold}
                  onChange={(e) => {
                    const newVal = e.target.value;
                    let disc = '';
                    if (newVal && form.price && Number(form.price) > 0) {
                      disc = Math.round((1 - Number(newVal) / Number(form.price)) * 100);
                    }
                    setForm({ ...form, price_sold: newVal, discount: disc });
                  }}
                />
              </div>
              <div style={{ opacity: 0.7 }}>
                <div className="admin-muted" style={{ marginBottom: 6 }}>Réduction calculée (%)</div>
                <input
                  className="admin-input"
                  type="number"
                  readOnly
                  placeholder="Calculé auto"
                  value={form.discount}
                />
              </div>
            </div>
            <FormError error={errors.price_sold} />
          </div>
          <div>
            <div className="admin-muted" style={{ marginBottom: 6 }}>{t('admin.category')}</div>
            <select className="admin-input" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">-- Choisir --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <FormError error={errors.category_id} />
          </div>
          <div>
            <div className="admin-muted" style={{ marginBottom: 6 }}>{t('admin.brand')}</div>
            <select className="admin-input" value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })}>
              <option value="">-- Choisir --</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <FormError error={errors.brand_id} />
          </div>
          <div>
            <div className="admin-muted" style={{ marginBottom: 6 }}>{t('admin.section')}</div>
            <select className="admin-input" value={form.section_id} onChange={(e) => setForm({ ...form, section_id: e.target.value })}>
              <option value="">-- {t('admin.none')} --</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          {(() => {
            const selectedCat = categories.find(c => String(c.id) === String(form.category_id));
            const isPerfume = selectedCat && selectedCat.name.toLowerCase().includes('parfum');
            if (!isPerfume) {
              return errors.section_id ? <div style={{ marginBottom: 15 }}><FormError error={errors.section_id} /></div> : null;
            }
            return (
              <div>
                <div className="admin-muted" style={{ marginBottom: 6 }}>💨 Contenance (ml)</div>
                <select className="admin-input" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })}>
                  <option value="">-- Choisir --</option>
                  {['30 ml', '50 ml', '75 ml', '90 ml', '100 ml'].map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                <FormError error={errors.capacity} />
              </div>
            );
          })()}
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="admin-muted" style={{ marginBottom: 6 }}>Description</div>
            <input className="admin-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <FormError error={errors.description} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="admin-muted" style={{ marginBottom: 6 }}>{t('admin.image')} (principale)</div>
            <input
              className="admin-input"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
            />
            <FormError error={errors.image || errors['images.0']} />
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default ProductsPage;
