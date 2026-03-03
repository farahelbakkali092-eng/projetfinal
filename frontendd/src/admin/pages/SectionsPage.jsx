import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../api';
import AdminModal from '../components/AdminModal';
import AdminTableActions from '../components/AdminTableActions';
import FormError from '../../components/FormError';

const emptyForm = {
    name: '',
    description: '',
    order: 0,
};

const SectionsPage = () => {
    const { t } = useTranslation();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});

    const load = async () => {
        setLoading(true);
        try {
            const res = await adminApi.listSections();
            setItems(res?.data?.data || []);
        } catch (e) {
            console.error(e);
            toast.error(t('admin.loading_error') || 'Impossible de charger les sections');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onEdit = (s) => {
        setEditing(s);
        setForm({
            name: s.name || '',
            description: s.description || '',
            order: s.order || 0
        });
        setErrors({});
        setOpen(true);
    };

    const onDelete = async (s) => {
        if (!confirm(`${t('admin.delete')} "${s.name}" ?`)) return;
        try {
            await adminApi.deleteSection(s.id);
            toast.success(t('admin.deleted_success') || 'Section supprimée');
            load();
        } catch (e) {
            console.error(e);
            toast.error(e.response?.data?.message || 'Erreur');
        }
    };

    const onSubmit = async () => {
        setErrors({});
        try {
            const name = form.name.trim();
            const newErrors = {};

            if (!name) {
                newErrors.name = ["Veuillez sélectionner une section."];
            } else {
                // Uniqueness check
                const exists = items.some(s => s.name.toUpperCase() === name.toUpperCase() && s.id !== editing?.id);
                if (exists) {
                    newErrors.name = ["Cette section existe déjà."];
                }
            }

            const orderValue = form.order;
            if (orderValue === '' || orderValue === null || isNaN(orderValue) || Number(orderValue) < 0) {
                newErrors.order = ["Ordre d’affichage invalide. Il doit être un nombre positif, supérieur ou égal à 0."];
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            if (editing) {
                await adminApi.updateSection(editing.id, form);
                toast.success('Section mise à jour');
            } else {
                await adminApi.createSection(form);
                toast.success('Section créée');
            }
            setOpen(false);
            setEditing(null);
            setForm(emptyForm);
            load();
        } catch (e) {
            console.error(e);
            if (e.response?.data?.errors) {
                setErrors(e.response.data.errors);
            } else {
                setErrors({ general: [e.response?.data?.message || 'Erreur'] });
            }
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="admin-page-header">
                <div>
                    <h1>{t('admin.sections')}</h1>
                    <div className="admin-muted">{t('admin.manage_sections_desc') || 'Gérer les groupes principaux (Femme, Homme, Enfant)'}</div>
                </div>
                <button className="admin-btn" onClick={() => { setEditing(null); setForm(emptyForm); setErrors({}); setOpen(true); }}>
                    {t('admin.add')}
                </button>
            </div>

            {loading ? (
                <div className="admin-muted">{t('admin.loading')}</div>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>{t('admin.id')}</th>
                            <th>{t('admin.name')}</th>
                            <th>{t('admin.order') || 'Ordre'}</th>
                            <th style={{ width: 140 }}>{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((s) => (
                            <tr key={s.id}>
                                <td>{s.id}</td>
                                <td>{t(`sections.${s.name.toLowerCase()}`, { defaultValue: s.name })}</td>
                                <td>{s.order}</td>
                                <td>
                                    <AdminTableActions
                                        onEdit={() => onEdit(s)}
                                        onDelete={() => onDelete(s)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <AdminModal
                title={editing ? t('admin.edit') : t('admin.add')}
                open={open}
                onClose={() => setOpen(false)}
                footer={(
                    <>
                        <button className="admin-btn secondary" onClick={() => setOpen(false)}>{t('admin.cancel')}</button>
                        <button className="admin-btn" onClick={onSubmit}>{editing ? t('admin.save') : t('admin.create')}</button>
                    </>
                )}
            >
                <div style={{ padding: '0 20px' }}><FormError error={errors.general} /></div>
                <div className="admin-form-grid">
                    <div style={{ gridColumn: '1 / -1' }}>
                        <div className="admin-muted" style={{ marginBottom: 6 }}>{t('admin.name')}</div>
                        <select
                            className="admin-input"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        >
                            <option value="">{t('admin.select_section') || 'Sélectionner une section'}</option>
                            <option value="FEMME">{t('sections.femme')}</option>
                            <option value="HOMME">{t('sections.homme')}</option>
                            <option value="ENFANT">{t('sections.enfant')}</option>
                        </select>
                        <FormError error={errors.name} />
                    </div>
                    <div>
                        <div className="admin-muted" style={{ marginBottom: 6 }}>{t('admin.display_order') || "Ordre d'affichage"}</div>
                        <input
                            className="admin-input"
                            type="number"
                            value={form.order}
                            onChange={(e) => setForm({ ...form, order: e.target.value })}
                        />
                        <FormError error={errors.order} />
                    </div>
                </div>
            </AdminModal>
        </div>
    );
};

export default SectionsPage;
