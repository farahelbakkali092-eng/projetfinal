import React, { useState, useEffect } from 'react';
import { Megaphone, Save, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const AdvertisingPage = () => {
    const { t } = useTranslation();
    const [advertisingText, setAdvertisingText] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings');
                if (response.data?.data?.advertising_text) {
                    setAdvertisingText(response.data.data.advertising_text);
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
                toast.error("Erreur lors de la récupération des paramètres.");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        if (advertisingText.length > 60) {
            toast.error("Le texte ne doit pas dépasser 60 caractères.");
            return;
        }

        setSaving(true);
        try {
            await api.patch('/admin/settings', { advertising_text: advertisingText });
            toast.success("Publicité mise à jour avec succès !");
        } catch (error) {
            console.error("Error updating settings:", error);
            toast.error(error.response?.data?.message || "Erreur lors de la mise à jour.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '260px' }}>
                <Loader2 className="animate-spin" size={40} style={{ color: 'var(--gold)' }} />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="admin-page-header" style={{ width: '100%' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Megaphone size={24} style={{ color: 'var(--gold)' }} />
                        {t('admin.ads')}
                    </h1>
                </div>
            </div>

            <div className="admin-card" style={{ maxWidth: 700, width: '100%', margin: '20px auto' }}>
                <form onSubmit={handleSave} style={{ display: 'grid', gap: 20 }}>
                    <div>
                        <div style={{ position: 'relative' }}>
                            <textarea
                                className="admin-input"
                                style={{
                                    paddingRight: 70,
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    resize: 'none',
                                    height: 80,
                                    lineHeight: '1.5',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    overflowY: 'auto',
                                }}
                                value={advertisingText}
                                onChange={(e) => setAdvertisingText(e.target.value)}
                                maxLength={100}
                                placeholder={t('admin.ads_placeholder') || 'Publicité'}
                                required
                            />
                            <div style={{
                                position: 'absolute',
                                right: 12,
                                bottom: 10,
                                fontSize: '0.75rem',
                                color: advertisingText.length > 100 ? '#ef4444' : 'var(--text-gray)'
                            }}>
                                {advertisingText.length} / 100
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            type="submit"
                            className="admin-btn"
                            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                            disabled={saving}
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {saving ? t('admin.saving') || 'Enregistrement...' : t('admin.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdvertisingPage;