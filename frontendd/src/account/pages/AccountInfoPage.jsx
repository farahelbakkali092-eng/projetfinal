import React, { useMemo, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

const AccountInfoPage = () => {
  const { t } = useTranslation();
  const { user, refreshUser, isAdmin } = useAuth();
  const [saving, setSaving] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const [form, setForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const displayPhone = useMemo(() => user?.phone || '-', [user?.phone]);

  const getPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthLabels = ['', 'Faible', 'Moyen', 'Fort', 'Très fort'];
  const strengthColors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
  const strength = getPasswordStrength(form.password);

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
      toast.success('Mot de passe mis à jour', {
        style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
        iconTheme: { primary: '#16a34a', secondary: '#fff' },
      });
      setForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).flat().forEach((m) => toast.error(String(m)));
      } else {
        toast.error(err.response?.data?.message || t('auth.pass_error') || 'Impossible de modifier le mot de passe');
      }
    } finally {
      setSaving(false);
    }
  };

  const EyeIcon = ({ visible }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {visible ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );

  const fields = [
    { key: 'current_password', label: 'Mot de passe actuel',    showKey: 'current' },
    { key: 'password',         label: 'Nouveau mot de passe',   showKey: 'new'     },
    { key: 'password_confirmation', label: 'Confirmer',         showKey: 'confirm' },
  ];

  const infoRows = [
    { label: t('routine.prenom'),          value: user?.first_name },
    { label: t('routine.nom'),             value: user?.last_name  },
    { label: t('admin.email') || 'Email',  value: user?.email      },
    { label: t('checkout.phone'),          value: displayPhone     },
  ];

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=Jost:wght@300;400;500&display=swap');

        /* ── PAGE HEADER ── */
        .ai-page-header { margin-bottom: 32px; }
        .ai-page-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          font-weight: 300;
          color: #261812;
          margin: 0 0 6px;
          letter-spacing: -0.01em;
        }
        .ai-page-sub {
          font-family: 'Jost', sans-serif;
          font-size: 0.8rem;
          color: #b89080;
          font-weight: 300;
          letter-spacing: 0.05em;
        }

        /* ── LAYOUT GRILLE ── */
        .ai-grid {
          display: grid;
          grid-template-columns: ${isAdmin ? '1fr' : '1fr 1fr'};
          gap: 20px;
          max-width: ${isAdmin ? '520px' : '100%'};
          margin: ${isAdmin ? '0 auto' : '0'};
        }

        /* ── CARTE COMMUNE ── */
        .ai-card {
          background: #fff;
          border: 1px solid #ecddd8;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 2px 16px rgba(38,24,18,0.06);
        }

        .ai-card-head {
          padding: 20px 24px 16px;
          border-bottom: 1px solid #f5ece8;
          background: #fdf9f7;
        }

        .ai-card-head-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem;
          font-weight: 400;
          color: #261812;
          margin: 0 0 2px;
          letter-spacing: 0.01em;
        }

        .ai-card-head-sub {
          font-family: 'Jost', sans-serif;
          font-size: 0.72rem;
          color: #b89080;
          font-weight: 300;
          letter-spacing: 0.04em;
          margin: 0;
        }

        .ai-card-body { padding: 20px 24px 24px; }

        /* ── TABLE INFOS PERSO ── */
        .ai-info-table { width: 100%; border-collapse: collapse; }
        .ai-info-table tr { border-bottom: 1px solid #f5ece8; }
        .ai-info-table tr:last-child { border-bottom: none; }
        .ai-info-table th {
          font-family: 'Jost', sans-serif;
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #b89080;
          font-weight: 500;
          padding: 11px 0 11px 4px;
          text-align: left;
          width: 38%;
        }
        .ai-info-table td {
          font-family: 'Jost', sans-serif;
          font-size: 0.88rem;
          color: #261812;
          font-weight: 400;
          padding: 11px 4px;
          text-align: left;
        }

        /* ── CHAMPS MOT DE PASSE ── */
        .ai-field { margin-bottom: 16px; }

        .ai-label {
          display: block;
          font-family: 'Jost', sans-serif;
          font-size: 0.68rem;
          font-weight: 500;
          color: #b89080;
          margin-bottom: 7px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .ai-input-row {
          position: relative;
          display: flex;
          align-items: center;
        }

        .ai-input {
          width: 100%;
          padding: 11px 40px 11px 14px;
          border: 1.5px solid #e8ddd8;
          border-radius: 10px;
          font-family: 'Jost', sans-serif;
          font-size: 0.88rem;
          color: #261812;
          background: #fdfaf8;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          box-sizing: border-box;
        }

        .ai-input::placeholder { color: #d4c4bc; }

        .ai-input:focus,
        .ai-input.is-focused {
          border-color: #c4a098;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(196, 160, 152, 0.14);
        }

        .ai-eye-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #c4b0a8;
          padding: 2px;
          display: flex;
          align-items: center;
          line-height: 0;
          transition: color 0.2s;
        }
        .ai-eye-btn:hover { color: #8e6458; }

        /* ── BARRE DE FORCE ── */
        .ai-strength {
          display: flex;
          gap: 4px;
          align-items: center;
          margin-top: 7px;
        }
        .ai-strength-seg {
          flex: 1;
          height: 3px;
          border-radius: 2px;
          transition: background 0.3s;
        }
        .ai-strength-lbl {
          font-family: 'Jost', sans-serif;
          font-size: 0.68rem;
          font-weight: 500;
          margin-left: 8px;
          min-width: 52px;
          letter-spacing: 0.04em;
          transition: color 0.3s;
        }

        /* ── MATCH PASSWORD ── */
        .ai-match {
          margin-top: 6px;
          font-family: 'Jost', sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.03em;
        }

        /* ── DIVIDER ── */
        .ai-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #ecddd8, transparent);
          margin: 20px 0;
        }

        /* ── BOUTON ── */
        .ai-submit-btn {
          width: 100%;
          padding: 13px;
          background: #3a2a22;
          color: #fdf6f1;
          border: none;
          border-radius: 999px;
          font-family: 'Jost', sans-serif;
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(58, 42, 34, 0.2);
        }
        .ai-submit-btn:hover:not(:disabled) {
          opacity: 0.88;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(58,42,34,0.28);
        }
        .ai-submit-btn:active:not(:disabled) { transform: translateY(0); }
        .ai-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .ai-spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(253,246,241,0.35);
          border-top-color: #fdf6f1;
          border-radius: 50%;
          animation: ai-spin 0.7s linear infinite;
        }
        @keyframes ai-spin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .ai-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div className="ai-page-header">
        <div className="account-page-header">
          <div>
            <h1 className="ai-page-title">
              {isAdmin ? t('admin.changePass') : 'Informations personnelles'}
            </h1>
            <div className="ai-page-sub">
              {isAdmin
                ? 'Mettez à jour votre mot de passe administrateur'
                : 'Consultez vos informations et modifiez votre mot de passe'}
            </div>
          </div>
        </div>
      </div>

      <div className="ai-grid">

        {/* ── INFOS PERSO ── */}
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

        {!isAdmin && (
          <div className="ai-card">
            <div className="ai-card-head">
              <p className="ai-card-head-title">Profil</p>
              <p className="ai-card-head-sub">Vos informations de compte</p>
            </div>
            <div className="ai-card-body">
              <table className="ai-info-table">
                <tbody>
                  {infoRows.map(({ label, value }) => (
                    <tr key={label}>
                      <th>{label}</th>
                      <td>{value || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── FORMULAIRE MOT DE PASSE ── */}
        <div className="ai-card">
          <div className="ai-card-head">
            <p className="ai-card-head-title">{t('admin.changePass')}</p>
            <p className="ai-card-head-sub">Choisissez un mot de passe d'au moins 8 caractères</p>
          </div>
          <div className="ai-card-body">
            <form onSubmit={onChangePassword}>
              {fields.map(({ key, label, showKey }) => (
                <div className="ai-field" key={key}>
                  <label className="ai-label">{label}</label>
                  <div className="ai-input-row">
                    <input
                      className={`ai-input${focusedField === key ? ' is-focused' : ''}`}
                      type={showPasswords[showKey] ? 'text' : 'password'}
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      onFocus={() => setFocusedField(key)}
                      onBlur={() => setFocusedField(null)}
                      autoComplete="off"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="ai-eye-btn"
                      onClick={() => setShowPasswords(p => ({ ...p, [showKey]: !p[showKey] }))}
                      tabIndex={-1}
                    >
                      <EyeIcon visible={showPasswords[showKey]} />
                    </button>
                  </div>

                  {key === 'password' && form.password && (
                    <div className="ai-strength">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="ai-strength-seg" style={{
                          background: i <= strength ? strengthColors[strength] : '#ede8e3'
                        }} />
                      ))}
                      <span className="ai-strength-lbl" style={{ color: strengthColors[strength] }}>
                        {strengthLabels[strength]}
                      </span>
                    </div>
                  )}

                  {key === 'password_confirmation' && form.password_confirmation && (
                    <div className="ai-match">
                      {form.password === form.password_confirmation
                        ? <span style={{ color: '#10b981' }}>✓ Les mots de passe correspondent</span>
                        : <span style={{ color: '#ef4444' }}>✗ Ne correspondent pas</span>
                      }
                    </div>
                  )}
                </div>
              ))}

              <div className="ai-divider" />

              <button className="ai-submit-btn" type="submit" disabled={saving}>
                {saving
                  ? <><div className="ai-spinner" /> Enregistrement...</>
                  : t('admin.save') || 'Enregistrer'
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountInfoPage;