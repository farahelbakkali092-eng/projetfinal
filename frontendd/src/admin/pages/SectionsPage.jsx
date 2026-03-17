import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../api';
import AdminTableActions from '../components/AdminTableActions';
import FormError from '../../components/FormError';

const emptyForm = {
    name: '',
    description: '',
    order: 0,
};

const successToast = (message) => toast.success(message, {
    style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
    iconTheme: { primary: '#16a34a', secondary: '#fff' },
});

const errorToast = (message) => toast.error(message, {
    style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
    iconTheme: { primary: '#dc2626', secondary: '#fff' },
});

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
            errorToast(t('admin.loading_error') || 'Impossible de charger les sections');
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
            successToast('Supprimé avec succès');
            load();
        } catch (e) {
            console.error(e);
            errorToast(e.response?.data?.message || 'Erreur lors de la suppression');
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
                const exists = items.some(s => s.name.toUpperCase() === name.toUpperCase() && s.id !== editing?.id);
                if (exists) {
                    newErrors.name = ["Cette section existe déjà."];
                }
            }

            const orderValue = form.order;
            if (orderValue === '' || orderValue === null || isNaN(orderValue) || Number(orderValue) < 0) {
                newErrors.order = ["Ordre d'affichage invalide. Il doit être un nombre positif, supérieur ou égal à 0."];
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            if (editing) {
                await adminApi.updateSection(editing.id, form);
                successToast('Modifié avec succès');
            } else {
                await adminApi.createSection(form);
                successToast('Ajouté avec succès');
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
                errorToast(e.response?.data?.message || 'Erreur lors de l\'enregistrement');
                setErrors({ general: [e.response?.data?.message || 'Erreur'] });
            }
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="admin-page-header">
                <div>
                    <h1>{t('admin.sections')}</h1>
                </div>
                <button
                    className="admin-btn"
                    onClick={() => { setEditing(null); setForm(emptyForm); setErrors({}); setOpen(true); }}
                >
                    {t('admin.add')}
                </button>
            </div>

            {loading ? (
                <div className="admin-muted">{t('admin.loading')}</div>
            ) : (
                <table className="admin-table">
                    <colgroup>
                        <col style={{ width: '50%' }} />
                        <col style={{ width: '25%' }} />
                        <col style={{ width: '25%' }} />
                    </colgroup>
                    <thead>
                        <tr>
                            <th>{t('admin.name')}</th>
                            <th>{t('admin.order') || 'Ordre'}</th>
                            <th>{t('admin.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((s) => (
                            <tr key={s.id}>
                                <td>
                                    {t(`sections.${s.name.toLowerCase()}`, { defaultValue: s.name })}
                                </td>
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

            {open && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 1000,
                    backgroundColor: 'rgba(0,0,0,0.45)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <div style={{
                        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480,
                        padding: '32px 28px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                        margin: '0 16px',
                    }}>
                        <h2 style={{ textAlign: 'center', marginBottom: 24, fontSize: '1.4rem', fontWeight: 700 }}>
                            {editing ? t('admin.edit') : t('admin.add')}
                        </h2>

                        <FormError error={errors.general} />

                        <div style={{ marginBottom: 18 }}>
                            <div className="admin-muted" style={{ marginBottom: 6 }}>{t('admin.name')}</div>
                            <select
                                className="admin-input"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                style={{ width: '100%' }}
                            >
                                <option value="">{t('admin.select_section') || 'Sélectionner une section'}</option>
                                <option value="FEMME">{t('sections.femme')}</option>
                                <option value="HOMME">{t('sections.homme')}</option>
                                <option value="ENFANT">{t('sections.enfant')}</option>
                            </select>
                            <FormError error={errors.name} />
                        </div>

                        <div style={{ marginBottom: 28 }}>
                            <div className="admin-muted" style={{ marginBottom: 6 }}>{t('admin.display_order') || "Ordre d'affichage"}</div>
                            <input
                                className="admin-input"
                                type="number"
                                value={form.order}
                                onChange={(e) => setForm({ ...form, order: e.target.value })}
                                style={{ width: '100%' }}
                            />
                            <FormError error={errors.order} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button className="admin-btn secondary" onClick={() => setOpen(false)}>{t('admin.cancel')}</button>
                            <button className="admin-btn" onClick={onSubmit}>{editing ? t('admin.save') : t('admin.create')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SectionsPage;