import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Upload, Download, FileText } from 'lucide-react';
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
  const [existingImages, setExistingImages] = useState([]);

  const downloadTemplate = () => {
    const headers = ['name', 'description', 'price', 'price_sold', 'discount', 'stock', 'category', 'brand', 'section', 'capacity', 'reference', 'image_url'];
    const example = ['Crème hydratante', 'Hydrate la peau en profondeur', '199.00', '159.00', '20', '50', 'Soin Visage', "L'Oreal", 'FEMME', '', 'CRH-001', 'https://example.com/image.jpg'];
    const csvContent = [headers.join(','), example.join(',')].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'products_template.csv');
    link.click();
    URL.revokeObjectURL(url);
  };

  const title = useMemo(() => (editing ? `${t('admin.edit')} ${t('admin.products').toLowerCase()}` : `${t('admin.create')} ${t('admin.products').toLowerCase()}`), [editing, t]);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const productsRes = await adminApi.listProducts({ search, page, per_page: 12 });

      const paginated = productsRes?.data?.data || productsRes?.data;
      if (paginated && paginated.data) {
        setItems(paginated.data);
        setMeta({ current_page: paginated.current_page, last_page: paginated.last_page });
      } else if (Array.isArray(paginated)) {
        setItems(paginated);
      }
    } catch (e) {
      console.error('Admin: Error loading products:', e);
      toast.error(t('admin.loading_error') || 'Impossible de charger les produits');
    } finally {
      setLoading(false);
    }
  };

  // Load reference data only once (brands, categories, sections)
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [brandsRes, categoriesRes, sectionsRes] = await Promise.all([
          adminApi.listBrands({ per_page: 100 }),
          adminApi.listCategories({ per_page: 100 }),
          adminApi.listSections({ per_page: 100 }),
        ]);

        const bData = brandsRes?.data?.data?.data || brandsRes?.data?.data || brandsRes?.data;
        setBrands(Array.isArray(bData) ? bData : (bData?.data || []));

        const cData = categoriesRes?.data?.data?.data || categoriesRes?.data?.data || categoriesRes?.data;
        setCategories(Array.isArray(cData) ? cData : (cData?.data || []));

        setSections(sectionsRes?.data?.data || []);
      } catch (e) {
        console.error('Admin: Error loading reference data:', e);
      }
    };
    loadReferenceData();
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEdit = (p) => {
    setEditing(p);
    setExistingImages(Array.isArray(p.images) ? p.images : []);
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

  const handleDeleteImage = async (imgId) => {
    if (!confirm('Supprimer cette image ?')) return;
    try {
      await adminApi.deleteProductImage(imgId);
      setExistingImages(prev => prev.filter(im => im.id !== imgId));
      toast.success('Image supprimée');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Impossible de supprimer');
    }
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
      const name = form.name.trim();
      const desc = form.description.trim();
      const price = Number(form.price);
      const stock = Number(form.stock);
      const priceSold = form.price_sold !== '' ? Number(form.price_sold) : null;

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

      if (price < 10 || price > 10000) {
        newErrors.price = ["Le prix doit être compris entre 10 et 10 000 MAD."];
      }

      if (stock < 1 || stock > 50000) {
        newErrors.stock = ["Le stock doit être compris entre 1 et 50 000."];
      }

      if (priceSold !== null) {
        if (priceSold <= 5) {
          newErrors.price_sold = ["Le prix soldé doit être supérieur à 5 MAD."];
        } else if (priceSold >= price) {
          newErrors.price_sold = ["Le prix soldé doit être inférieur au prix initial."];
        }
      }

      if (!form.category_id) newErrors.category_id = ["Veuillez choisir une catégorie."];
      if (!form.brand_id) newErrors.brand_id = ["Veuillez choisir une marque."];
      if (!form.section_id) newErrors.section_id = ["Veuillez choisir une section."];

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      const fd = new FormData();
      fd.append('name', name);
      fd.append('description', desc);
      fd.append('price', String(price));

      if (priceSold !== null) {
        fd.append('price_sold', String(priceSold));
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

      // Send all selected images (extraImages includes all files from the multi-select input)
      const filesToUpload = form.extraImages?.length > 0 ? form.extraImages : (form.image ? [form.image] : []);
      filesToUpload.forEach((file) => {
        fd.append('images[]', file);
      });

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
        setErrors({ general: [e.response?.data?.message || 'Erreur'] });
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
      toast.error(err.response?.data?.message || 'Erreur lors de l\'import');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="animate-fade-in">
      {/* ── En-tête : titre + actions principales + outils CSV ── */}
      <div className="admin-page-header admin-page-header--stacked">
        <div className="admin-header-row">
          <h1>{t('admin.products')}</h1>

          {/* Ligne 1 : Recherche + Filtrer + Ajouter */}
          <div className="admin-actions">
            <input
              className="admin-input admin-search-input"
              placeholder={t('admin.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="admin-btn secondary" onClick={() => load(1)}>{t('admin.filter')}</button>
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

        {/* Ligne 2 : Modèle CSV + Exporter CSV + Importer CSV */}
        <div className="admin-csv-actions">
          <button
            className="admin-btn secondary admin-btn--icon"
            onClick={downloadTemplate}
            title="Télécharger le modèle CSV"
          >
            <FileText size={15} />
            Modèle CSV
          </button>

          <button
            className="admin-btn secondary admin-btn--icon"
            onClick={exportToCSV}
            title="Exporter les produits"
          >
            <Download size={15} />
            Exporter CSV
          </button>

          <label
            className="admin-btn secondary admin-btn--icon"
            title="Importer un fichier CSV. Colonnes: name, description, price, stock, category, brand, section, price_sold, discount, capacity, reference, image_url (optionnel)"
          >
            <Upload size={15} />
            Importer CSV
            <input type="file" accept=".csv" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* ── Panneau d'erreurs d'importation ── */}
      {importErrors.length > 0 && (
        <div className="admin-import-errors">
          <div className="admin-import-errors__header">
            <span>⚠️ Erreurs lors de l'importation :</span>
            <button className="admin-import-errors__clear" onClick={() => setImportErrors([])}>
              Tout effacer
            </button>
          </div>
          <ul className="admin-import-errors__list">
            {importErrors.map((err, i) => (
              <li key={i} className="admin-import-errors__item">{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Table des produits ── */}
      {loading ? (
        <div className="admin-muted">{t('admin.loading')}</div>
      ) : (
        <table className="admin-table" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '6%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '20%' }} />
          </colgroup>
          <thead>
            <tr>
              <th>{t('admin.image')}</th>
              <th>{t('admin.name')}</th>
              <th>{t('admin.category')}</th>
              <th>{t('admin.brand')}</th>
              <th>Réf</th>
              <th>{t('admin.price')}</th>
              <th>{t('admin.stock')}</th>
              <th>{t('admin.section')}</th>
              <th style={{ textAlign: 'center' }}>{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => {
              const mainImg = (p.images || []).find((im) => im.is_main) || (p.images || [])[0];
              // Use thumbnail_url (400x400 WebP) for list performance — NOT image_url (800x800)
              const thumbSrc = mainImg?.thumbnail_url || mainImg?.image_url;
              return (
                <tr key={p.id}>
                  <td>
                    {thumbSrc ? (
                      <img
                        src={thumbSrc}
                        alt={p.name}
                        className="admin-product-thumb"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="admin-muted">-</span>
                    )}
                  </td>
                  <td className="col-text">{p.name}</td>
                  <td className="col-text">{p.category?.name || p.category_id}</td>
                  <td className="col-text">{p.brand?.name || p.brand_id}</td>
                  <td className="col-ref">{p.reference || '-'}</td>
                  <td>{p.price}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span className="admin-badge">{p.stock}</span>
                      {p.stock < 10 && (
                        <span title="Stock faible !" style={{ color: '#dc2626', fontSize: 15 }}>⚠️</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {p.section ? (
                      <span className="admin-badge secondary">{p.section.name}</span>
                    ) : (
                      <span className="admin-muted">{t('admin.none')}</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <AdminTableActions
                      onEdit={() => onEdit(p)}
                      onDelete={() => onDelete(p)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* ── Pagination ── */}
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

      {/* ── Modal création / édition ── */}
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
          <div className="admin-form-grid__full"><FormError error={errors.general} /></div>

          <div>
            <div className="admin-muted admin-field-label">{t('admin.name')}</div>
            <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <FormError error={errors.name} />
          </div>

          <div>
            <div className="admin-muted admin-field-label">{t('admin.price')} (MAD)</div>
            <input className="admin-input" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <FormError error={errors.price} />
          </div>

          <div>
            <div className="admin-muted admin-field-label">{t('admin.stock')}</div>
            <input className="admin-input" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            <FormError error={errors.stock} />
          </div>

          <div>
            <div className="admin-muted admin-field-label">Référence (optionnel)</div>
            <input
              className="admin-input"
              placeholder="Ex: REF-123"
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
            />
            <FormError error={errors.reference} />
          </div>

          {/* Encart Promotion */}
          <div className="admin-promo-box">
            <div className="admin-promo-box__title">🏷️ Promotion (Prix Soldé)</div>
            <div className="admin-promo-box__grid">
              <div>
                <div className="admin-muted admin-field-label">Nouveau prix soldé (MAD)</div>
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
              <div className="admin-promo-box__readonly">
                <div className="admin-muted admin-field-label">Réduction calculée (%)</div>
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
            <div className="admin-muted admin-field-label">{t('admin.category')}</div>
            <select className="admin-input" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">-- Choisir --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <FormError error={errors.category_id} />
          </div>

          <div>
            <div className="admin-muted admin-field-label">{t('admin.brand')}</div>
            <select className="admin-input" value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })}>
              <option value="">-- Choisir --</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <FormError error={errors.brand_id} />
          </div>

          <div>
            <div className="admin-muted admin-field-label">{t('admin.section')}</div>
            <select className="admin-input" value={form.section_id} onChange={(e) => setForm({ ...form, section_id: e.target.value })}>
              <option value="">-- {t('admin.none')} --</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <FormError error={errors.section_id} />
          </div>

          {(() => {
            const selectedCat = categories.find(c => String(c.id) === String(form.category_id));
            const isPerfume = selectedCat && selectedCat.name.toLowerCase().includes('parfum');
            if (!isPerfume) return null;
            return (
              <div>
                <div className="admin-muted admin-field-label">💨 Contenance (ml)</div>
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

          <div className="admin-form-grid__full">
            <div className="admin-muted admin-field-label">Description</div>
            <input className="admin-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <FormError error={errors.description} />
          </div>

          <div className="admin-form-grid__full">
            <div className="admin-muted admin-field-label">{t('admin.image')} (principale)</div>
            <input
              className="admin-input"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              multiple
              onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null, extraImages: Array.from(e.target.files || []) })}
            />
            <FormError error={errors.image || errors['images.0']} />
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default ProductsPage;