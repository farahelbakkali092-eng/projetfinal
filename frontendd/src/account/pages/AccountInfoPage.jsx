import React, { useMemo, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

const AccountInfoPage = () => {
  const { t } = useTranslation();
  const { user, refreshUser, isAdmin } = useAuth();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const [form, setForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const displayPhone = useMemo(() => {
    const phone = user?.phone;
    if (!phone) return '-';
    return phone;
  }, [user?.phone]);

  const onChangePassword = async (e) => {
    e.preventDefault();

    if (!form.current_password || !form.password || !form.password_confirmation) {
      toast.error(t('auth.fill_all') || 'Veuillez remplir tous les champs');
      return;
    }

    if (form.password !== form.password_confirmation) {
      toast.error(t('auth.pass_mismatch') || 'Les mots de passe ne correspondent pas');
      return;
    }

    setSaving(true);
    try {
      await api.patch('/me/password', form);
      toast.success(t('auth.pass_updated') || 'Mot de passe mis à jour');
      setForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).flat().forEach((m) => toast.error(String(m)));
      } else {
        toast.error(err.response?.data?.message || t('auth.pass_error') || 'Impossible de modifier le mot de passe');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="account-page-header">
        <div>
          <h1>{isAdmin ? t('admin.changePass') : t('auth.accountInfo')}</h1>
          <div className="account-muted">
            {isAdmin ? t('admin.changePassDesc') || 'Change ton mot de passe administrateur' : t('auth.accountInfoDesc') || 'Consulte tes informations personnelles et change ton mot de passe'}
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isAdmin ? '1fr' : '1.2fr 1fr',
        gap: 16,
        maxWidth: isAdmin ? '600px' : 'none',
        margin: isAdmin ? '0 auto' : '0'
      }}>

        {!isAdmin && (
          <div style={{ border: '1px solid var(--border-light)', borderRadius: 12, padding: 14, background: '#fff' }}>
            <div className="account-muted" style={{ marginBottom: 10 }}>{t('auth.personalInfo') || 'Informations personnelles'}</div>

            <table className="account-table">
              <tbody>
                <tr>
                  <th style={{ width: 180 }}>{t('routine.prenom')}</th>
                  <td>{user?.first_name || '-'}</td>
                </tr>
                <tr>
                  <th>{t('routine.nom')}</th>
                  <td>{user?.last_name || '-'}</td>
                </tr>
                <tr>
                  <th>{t('admin.email') || 'Email'}</th>
                  <td>{user?.email || '-'}</td>
                </tr>
                <tr>
                  <th>{t('checkout.phone')}</th>
                  <td>{displayPhone}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div style={{ border: '1px solid var(--border-light)', borderRadius: 12, padding: 14, background: 'linear-gradient(180deg, #fff, var(--blush))' }}>
          <div className="account-muted" style={{ marginBottom: 10 }}>{t('admin.changePass')}</div>

          <form onSubmit={onChangePassword}>
            <div style={{ display: 'grid', gap: 10 }}>
              <div>
                <div className="account-muted" style={{ marginBottom: 6 }}>{t('auth.currentPass') || 'Mot de passe actuel'}</div>
                <input
                  className="admin-input"
                  type="password"
                  value={form.current_password}
                  onChange={(e) => setForm({ ...form, current_password: e.target.value })}
                />
              </div>
              <div>
                <div className="account-muted" style={{ marginBottom: 6 }}>{t('auth.newPass') || 'Nouveau mot de passe'}</div>
                <input
                  className="admin-input"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <div>
                <div className="account-muted" style={{ marginBottom: 6 }}>{t('auth.confirm') || 'Confirmer'}</div>
                <input
                  className="admin-input"
                  type="password"
                  value={form.password_confirmation}
                  onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                />
              </div>

              <button className="account-btn" type="submit" disabled={saving}>
                {saving ? (t('admin.saving') || 'Enregistrement...') : t('admin.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountInfoPage;
