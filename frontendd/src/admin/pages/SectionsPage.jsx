import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { adminApi } from '../api';
import AdminModal from '../components/AdminModal';
import AdminTableActions from '../components/AdminTableActions';
import { LayoutGrid } from 'lucide-react';

const emptyForm = { name: '', order: 0, is_active: true };

const SectionsPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const load = async () => {
        setLoading(true);
        try {
            const res = await adminApi.listSections();
            setItems(res.data.data || []);
        } catch (e) {
            console.error(e);
            toast.error('Impossible de charger les sections');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const onSubmit = async () => {
        try {
            if (!form.name.trim()) return toast.error('Nom obligatoire');

            if (editing) {
                await adminApi.updateSection(editing.id, form);
                toast.success('Section mise à jour');
            } else {
                await adminApi.createSection(form);
                toast.success('Section créée');
            }
            setOpen(false);
            load();
        } catch (e) {
            console.error(e);
            toast.error('Erreur lors de l\'enregistrement');
        }
    };

    const onEdit = (item) => {
        setEditing(item);
        setForm({ name: item.name, order: item.order, is_active: item.is_active });
        setOpen(true);
    };

    const onDelete = async (item) => {
        if (!confirm(`Supprimer la section "${item.name}" ?`)) return;
        try {
            await adminApi.deleteSection(item.id);
            toast.success('Section supprimée');
            load();
        } catch (e) {
            console.error(e);
            toast.error('Suppression impossible');
        }
    };

    return (
        <div>
            <div className="admin-page-header">
                <div>
                    <h1>Sections</h1>
                    <div className="admin-muted">Gérer les groupes principaux (Femme, Homme, Enfant)</div>
                </div>
                <button className="admin-btn" onClick={() => { setEditing(null); setForm(emptyForm); setOpen(true); }}>
                    Ajouter une section
                </button>
            </div>

            {loading ? (
                <div className="admin-muted">Chargement...</div>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nom</th>
                            <th>Ordre</th>
                            <th>Statut</th>
                            <th style={{ width: 120 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((it) => (
                            <tr key={it.id}>
                                <td>{it.id}</td>
                                <td><strong>{it.name}</strong></td>
                                <td>{it.order}</td>
                                <td>
                                    <span className={`admin-badge ${it.is_active ? 'success' : 'muted'}`}>
                                        {it.is_active ? 'Actif' : 'Inactif'}
                                    </span>
                                </td>
                                <td>
                                    <AdminTableActions onEdit={() => onEdit(it)} onDelete={() => onDelete(it)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <AdminModal
                title={editing ? 'Modifier la section' : 'Ajouter une section'}
                open={open}
                onClose={() => setOpen(false)}
                footer={(
                    <>
                        <button className="admin-btn secondary" onClick={() => setOpen(false)}>Annuler</button>
                        <button className="admin-btn" onClick={onSubmit}>Enregistrer</button>
                    </>
                )}
            >
                <div className="admin-form-grid">
                    <div style={{ gridColumn: '1 / -1' }}>
                        <div className="admin-muted" style={{ marginBottom: 6 }}>Nom de la section</div>
                        <input
                            className="admin-input"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="Ex: Femme"
                        />
                    </div>
                    <div>
                        <div className="admin-muted" style={{ marginBottom: 6 }}>Ordre d'affichage</div>
                        <input
                            className="admin-input"
                            type="number"
                            value={form.order}
                            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 12 }}>
                            <input
                                type="checkbox"
                                checked={form.is_active}
                                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                            />
                            Section active
                        </label>
                    </div>
                </div>
            </AdminModal>
        </div>
    );
};

export default SectionsPage;
