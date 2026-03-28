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
            successToast(t('admin.deleted_success'));
            load();
        } catch (e) {
            console.error(e);
            errorToast(e.response?.data?.message || t('admin.delete_error'));
        }
    };

    const onSubmit = async () => {
        setErrors({});
        try {
            const name = form.name.trim();
            const newErrors = {};

            if (!name) {
                newErrors.name = [t('admin.select_section')];
            } else {
                const exists = items.some(s => s.name.toUpperCase() === name.toUpperCase() && s.id !== editing?.id);
                if (exists) {
                    newErrors.name = [t('admin.already_exists')];
                }
            }

            const orderValue = form.order;
            if (orderValue === '' || orderValue === null || isNaN(orderValue) || Number(orderValue) < 0) {
                newErrors.order = [t('admin.order_error')];
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            if (editing) {
                await adminApi.updateSection(editing.id, form);
                successToast(t('admin.updated_success'));
            } else {
                await adminApi.createSection(form);
                successToast(t('admin.created_success'));
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
                errorToast(e.response?.data?.message || t('admin.save_error'));
                setErrors({ general: [e.response?.data?.message || t('admin.save_error')] });
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

            <AdminModal
                title={editing ? t('admin.edit') : t('admin.add')}
                open={open}
                onClose={() => setOpen(false)}
                footer={
                    <>
                        <button className="admin-btn secondary" onClick={() => setOpen(false)}>{t('admin.cancel')}</button>
                        <button className="admin-btn" onClick={onSubmit}>{editing ? t('admin.save') : t('admin.create')}</button>
                    </>
                }
            >
                <FormError error={errors.general} />

                <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <div>
                        <div className="admin-muted admin-field-label">{t('admin.name')}</div>
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
                        <div className="admin-muted admin-field-label">{t('admin.display_order') || "Ordre d'affichage"}</div>
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