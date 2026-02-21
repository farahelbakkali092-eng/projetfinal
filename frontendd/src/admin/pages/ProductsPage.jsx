import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { adminApi } from '../api';
import AdminModal from '../components/AdminModal';
import AdminTableActions from '../components/AdminTableActions';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock: 0,
  category_id: '',
  brand_id: '',
  section_id: '',
  image: null,
};

const ProductsPage = () => {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const title = useMemo(() => (editing ? 'Modifier un produit' : 'Ajouter un produit'), [editing]);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const [productsRes, brandsRes, categoriesRes] = await Promise.all([
        adminApi.listProducts({ search, page, per_page: 12 }),
        adminApi.listBrands({ per_page: 100 }),
        adminApi.listCategories({ per_page: 100 }),
      ]);

      const paginated = productsRes.data.data;
      setItems(paginated.data);
      setMeta({ current_page: paginated.current_page, last_page: paginated.last_page });
      setBrands(brandsRes.data.data.data);
      setCategories(categoriesRes.data.data.data);
    } catch (e) {
      console.error(e);
      toast.error('Impossible de charger les produits');
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
      stock: p.stock || 0,
      category_id: p.category_id || p.category?.id || '',
      brand_id: p.brand_id || p.brand?.id || '',
      skin_type_id: p.skin_type_id || p.skinType?.id || '',
      image: null,
    });
    setOpen(true);
  };

  const onDelete = async (p) => {
    if (!confirm(`Supprimer le produit "${p.name}" ?`)) return;
    try {
      await adminApi.deleteProduct(p.id);
      toast.success('Produit supprimé');
      await load(meta?.current_page || 1);
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || 'Suppression impossible');
    }
  };

  const onSubmit = async () => {
    try {
      if (!form.name.trim()) return toast.error('Nom obligatoire');
      if (!form.description.trim()) return toast.error('Description obligatoire');
      if (!form.price) return toast.error('Prix obligatoire');
      if (!form.category_id) return toast.error('Catégorie obligatoire');
      if (!form.brand_id) return toast.error('Marque obligatoire');

      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', String(Number(form.price)));
      fd.append('stock', String(Number(form.stock)));
      fd.append('category_id', String(Number(form.category_id)));
      fd.append('brand_id', String(Number(form.brand_id)));
      fd.append('section_id', String(Number(form.section_id)));
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
        const errs = e.response.data.errors;
        Object.values(errs).flat().forEach((msg) => toast.error(String(msg)));
      } else {
        toast.error(e.response?.data?.message || 'Erreur');
      }
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Produits</h1>
          <div className="admin-muted">CRUD produits + association marque/catégorie</div>
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
          <button
            className="admin-btn"
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
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
              <th>Image</th>
              <th>ID</th>
              <th>Nom</th>
              <th>Catégorie</th>
              <th>Marque</th>
              <th>Prix</th>
              <th>Stock</th>
              <th>Section</th>
              <th style={{ width: 220 }}>Actions</th>
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
                <td>{p.price}</td>
                <td><span className="admin-badge">{p.stock}</span></td>
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
            <div className="admin-muted" style={{ marginBottom: 6 }}>Prix</div>
            <input className="admin-input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <div className="admin-muted" style={{ marginBottom: 6 }}>Stock</div>
            <input className="admin-input" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </div>
          <div>
            <div className="admin-muted" style={{ marginBottom: 6 }}>Catégorie</div>
            <select className="admin-input" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">-- Choisir --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="admin-muted" style={{ marginBottom: 6 }}>Marque</div>
            <select className="admin-input" value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })}>
              <option value="">-- Choisir --</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="admin-muted" style={{ marginBottom: 6 }}>Description</div>
            <input className="admin-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="admin-muted" style={{ marginBottom: 6 }}>Image (principale)</div>
            <input
              className="admin-input"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
            />
            {!form.image && (editing?.images?.length || 0) > 0 && (
              <div className="admin-muted" style={{ marginTop: 8 }}>
                Image actuelle:
                <div style={{ marginTop: 6 }}>
                  <img
                    src={(editing.images.find((im) => im.is_main) || editing.images[0])?.image_url}
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

export default ProductsPage;
