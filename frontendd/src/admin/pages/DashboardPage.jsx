import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../api';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Users, Package, Tag, Layers, BarChart2, AlertTriangle } from 'lucide-react';

/* ── Mini stat card ─────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div style={{
    background: 'linear-gradient(135deg,#111 0%,#1a1a1a 100%)',
    border: `1px solid ${color}33`,
    borderRadius: '14px',
    padding: '22px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: `0 4px 20px ${color}11`,
    transition: 'transform .2s',
    cursor: 'default',
  }}
    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <div style={{
      width: '50px', height: '50px', borderRadius: '12px',
      background: `${color}22`, display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <p style={{ margin: 0, color: '#888', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </p>
      <p style={{ margin: '3px 0 0', color: '#fff', fontSize: '1.8rem', fontWeight: '800', lineHeight: 1 }}>
        {value ?? '—'}
      </p>
    </div>
  </div>
);

/* ── Main component ──────────────────────────────────────────────────── */
const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [embedData, setEmbedData] = useState(null);
  const [mbError, setMbError] = useState('');

  useEffect(() => {
    const load = async () => {
      // 1️⃣ Load stats (always)
      try {
        const res = await adminApi.getStats();
        setStats(res.data?.data ?? null);
      } catch { /* stats non bloquantes */ }

      // 2️⃣ Load Metabase signed URL (primary goal)
      try {
        const res = await adminApi.getMetabaseDashboardUrl();
        setEmbedData(res.data?.data);
      } catch (e) {
        const msg = e.response?.data?.message || e.message || '';
        setMbError(
          msg.includes('configuration')
            ? 'Metabase non configuré (METABASE_SITE_URL / METABASE_SECRET_KEY / METABASE_DASHBOARD_ID manquants).'
            : `Erreur Metabase : ${msg || 'Impossible de charger le dashboard.'}`
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    { icon: ShoppingBag, label: t('admin.orders') || 'Commandes',   value: stats?.orders,     color: '#d4af37' },
    { icon: Package,     label: t('admin.products') || 'Produits',     value: stats?.products,   color: '#60a5fa' },
    { icon: Users,       label: t('admin.users') || 'Utilisateurs', value: stats?.users,      color: '#34d399' },
    { icon: Tag,         label: t('admin.brands') || 'Marques',      value: stats?.brands,     color: '#f472b6' },
    { icon: Layers,      label: t('admin.categories') || 'Catégories',   value: stats?.categories, color: '#a78bfa' },
  ];

  useEffect(() => {
    if (embedData?.site_url) {
      window.metabaseConfig = {
        theme: { preset: 'light' },
        isGuest: true,
        instanceUrl: embedData.site_url
      };

      const scriptId = 'metabase-embed-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `${embedData.site_url}/app/embed.js`;
        script.defer = true;
        document.body.appendChild(script);
      }
    }
  }, [embedData]);

  return (
    <div className="animate-fade-in">

      {/* ── En-tête ─────────────────────────────────────────────────── */}
      <div style={{
        marginBottom: '28px',
        background: 'linear-gradient(135deg,#000 0%,#1a1a1a 100%)',
        padding: '32px 36px',
        borderRadius: '16px',
        border: '1px solid rgba(212,175,55,0.15)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2.4rem', fontWeight: '800', margin: '0 0 12px 0', color: '#ffffff', letterSpacing: '-0.02em' }}>
            {t('admin.welcome_back')}, <span style={{ color: '#d4af37' }}>{user?.first_name || t('admin.administrator')}</span> 👋
          </h1>
          <p style={{ margin: 0, color: '#a3a3a3', fontSize: '1.2rem', maxWidth: '600px', lineHeight: '1.6' }}>
            {t('admin.welcome_desc')}
          </p>
        </div>
        <div style={{ position: 'absolute', right: '-5%', top: '-20%', width: '300px', height: '300px', background: 'radial-gradient(circle,rgba(212,175,55,0.2) 0%,rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      </div>

      {loading ? (
        <div className="admin-muted">{t('admin.loading')}</div>
      ) : (
        <>
          {/* ── Cartes statistiques rapides ─────────────────────────── */}
          {stats && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))',
              gap: '16px',
              marginBottom: '28px',
            }}>
              {statCards.map(c => <StatCard key={c.label} {...c} />)}
            </div>
          )}

          {/* ── Dashboard Metabase (priorité) ────────────────────────── */}
          {embedData?.token ? (
            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
              <metabase-dashboard
                token={embedData.token}
                with-title="true"
                with-downloads="true"
                style={{ display: 'block', width: '100%', height: '1100px' }}
              />
            </div>
          ) : (
            <div style={{
              background: '#1a1a1a',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '14px',
              padding: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              color: '#ef4444',
            }}>
              <AlertTriangle size={28} style={{ flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>Dashboard Metabase indisponible</p>
                <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: '#f87171' }}>{mbError}</p>
                <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: '#666' }}>
                  Assurez-vous que Metabase tourne sur <code>{embedData?.site_url || 'votre instance'}</code>,
                  que l'embedding est activé et que le dashboard est public.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;
