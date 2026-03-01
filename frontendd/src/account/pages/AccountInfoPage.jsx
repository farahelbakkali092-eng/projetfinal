import React, { useMemo, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AccountInfoPage = () => {
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
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (form.password !== form.password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setSaving(true);
    try {
      await api.patch('/me/password', form);
      toast.success('Mot de passe mis à jour');
      setForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).flat().forEach((m) => toast.error(String(m)));
      } else {
        toast.error(err.response?.data?.message || 'Impossible de modifier le mot de passe');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="account-page-header">
        <div>
          <h1>{isAdmin ? 'Modifier le mot de passe' : 'Mes informations'}</h1>
          <div className="account-muted">
            {isAdmin ? 'Change ton mot de passe administrateur' : 'Consulte tes informations personnelles et change ton mot de passe'}
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
            <div className="account-muted" style={{ marginBottom: 10 }}>Informations personnelles</div>

            <table className="account-table">
              <tbody>
                <tr>
                  <th style={{ width: 180 }}>Prénom</th>
                  <td>{user?.first_name || '-'}</td>
                </tr>
                <tr>
                  <th>Nom</th>
                  <td>{user?.last_name || '-'}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>{user?.email || '-'}</td>
                </tr>
                <tr>
                  <th>Téléphone</th>
                  <td>{displayPhone}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div style={{ border: '1px solid var(--border-light)', borderRadius: 12, padding: 14, background: 'linear-gradient(180deg, #fff, var(--blush))' }}>
          <div className="account-muted" style={{ marginBottom: 10 }}>Modifier le mot de passe</div>

          <form onSubmit={onChangePassword}>
            <div style={{ display: 'grid', gap: 10 }}>
              <div>
                <div className="account-muted" style={{ marginBottom: 6 }}>Mot de passe actuel</div>
                <input
                  className="admin-input"
                  type="password"
                  value={form.current_password}
                  onChange={(e) => setForm({ ...form, current_password: e.target.value })}
                />
              </div>
              <div>
                <div className="account-muted" style={{ marginBottom: 6 }}>Nouveau mot de passe</div>
                <input
                  className="admin-input"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              <div>
                <div className="account-muted" style={{ marginBottom: 6 }}>Confirmer</div>
                <input
                  className="admin-input"
                  type="password"
                  value={form.password_confirmation}
                  onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                />
              </div>

              <button className="account-btn" type="submit" disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountInfoPage;
