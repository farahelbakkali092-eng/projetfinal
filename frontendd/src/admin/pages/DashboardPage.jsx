import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../api';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag, Users, Package, Tag, Layers, AlertTriangle,
  TrendingUp, ArrowUpRight,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────────────────── */
const tokens = {
  bg:        '#0a0a0b',
  surface:   '#111113',
  surfaceUp: '#18181c',
  border:    'rgba(255,255,255,0.06)',
  borderHov: 'rgba(255,255,255,0.12)',
  gold:      '#f59e0b',
  goldDim:   'rgba(245,158,11,0.12)',
  muted:     '#71717a',
  text:      '#fafafa',
  textSub:   '#a1a1aa',
  radius:    '18px',
  radiusSm:  '12px',
};

/* ─────────────────────────────────────────────────────────────────────────
   GLOBAL STYLES (injected once)
───────────────────────────────────────────────────────────────────────── */
const injectStyles = () => {
  if (document.getElementById('db-styles')) return;
  const s = document.createElement('style');
  s.id = 'db-styles';
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

    .db-root * { box-sizing: border-box; }
    .db-root { font-family: 'DM Sans', sans-serif; }

    @keyframes db-fade-up {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0);    }
    }
    @keyframes db-glow-pulse {
      0%,100% { opacity: .7; }
      50%      { opacity: 1;  }
    }
    @keyframes db-shimmer {
      from { transform: translateX(-100%); }
      to   { transform: translateX(100%); }
    }
    @keyframes db-spin {
      to { transform: rotate(360deg); }
    }
    @keyframes db-underline-in {
      from { transform: scaleX(0); opacity: 0; }
      to   { transform: scaleX(1); opacity: 1; }
    }

    .db-fade-up { animation: db-fade-up .55s cubic-bezier(.22,1,.36,1) both; }

    .db-card {
      background: ${tokens.surface};
      border: 1px solid ${tokens.border};
      border-radius: ${tokens.radius};
      transition: border-color .25s, box-shadow .25s, transform .25s;
    }
    .db-card:hover {
      border-color: ${tokens.borderHov};
      box-shadow: 0 20px 48px rgba(0,0,0,.35);
      transform: translateY(-2px);
    }

    .db-stat-icon {
      width: 48px; height: 48px; border-radius: ${tokens.radiusSm};
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }

    .db-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: .72rem; font-weight: 600;
      letter-spacing: .04em;
    }

    .db-metabase-wrap {
      border-radius: ${tokens.radius};
      overflow: hidden;
      border: 1px solid ${tokens.border};
      background: ${tokens.surface};
    }
    .db-metabase-header {
      padding: 20px 24px 16px;
      border-bottom: 1px solid ${tokens.border};
      display: flex; align-items: center; justify-content: space-between;
    }

    .db-error-card {
      background: #110d0d;
      border: 1px solid rgba(239,68,68,.2);
      border-radius: ${tokens.radius};
      padding: 28px 32px;
    }

    .db-spinner {
      width: 36px; height: 36px;
      border: 3px solid ${tokens.border};
      border-top-color: ${tokens.gold};
      border-radius: 50%;
      animation: db-spin .7s linear infinite;
    }
  `;
  document.head.appendChild(s);
};

/* ─────────────────────────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
  <div
    className="db-card db-fade-up"
    style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: '16px', animationDelay: `${delay}ms` }}
  >
    {/* top row */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div className="db-stat-icon" style={{ background: `${color}18` }}>
        <Icon size={20} color={color} strokeWidth={1.8} />
      </div>
      <div className="db-badge" style={{ background: `${color}14`, color }}>
        <TrendingUp size={11} />
        Live
      </div>
    </div>

    {/* value */}
    <div>
      <p style={{ margin: 0, color: tokens.muted, fontSize: '.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>
        {label}
      </p>
      <p style={{ margin: '6px 0 0', color: tokens.text, fontSize: '2rem', fontWeight: 800, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {value != null ? value.toLocaleString() : <span style={{ color: tokens.muted }}>—</span>}
      </p>
    </div>

    {/* bottom accent bar */}
    <div style={{ height: '3px', borderRadius: '99px', background: tokens.surfaceUp, overflow: 'hidden', marginTop: '-4px' }}>
      <div style={{ height: '100%', width: '60%', background: `linear-gradient(90deg,${color},${color}44)`, borderRadius: '99px' }} />
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────
   SKELETON LOADER
───────────────────────────────────────────────────────────────────────── */
const Skeleton = ({ h = '20px', w = '100%', r = '8px' }) => (
  <div style={{
    height: h, width: w, borderRadius: r,
    background: `linear-gradient(90deg, ${tokens.surfaceUp} 25%, #222226 50%, ${tokens.surfaceUp} 75%)`,
    backgroundSize: '200% 100%',
    animation: 'db-shimmer 1.6s infinite linear',
    overflow: 'hidden',
  }} />
);

/* ─────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────── */
const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [stats,     setStats]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [embedData, setEmbedData] = useState(null);
  const [mbError,   setMbError]   = useState('');

  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getStats();
        setStats(res.data?.data ?? null);
      } catch { /* non-blocking */ }

      try {
        const res = await adminApi.getMetabaseDashboardUrl();
        setEmbedData(res.data?.data);
      } catch (e) {
        const msg = e.response?.data?.message || e.message || '';
        setMbError(
          msg.includes('configuration')
            ? 'Metabase non configuré — vérifiez METABASE_SITE_URL, METABASE_SECRET_KEY et METABASE_DASHBOARD_ID.'
            : `Erreur Metabase : ${msg || 'Impossible de charger le dashboard.'}`
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!embedData?.site_url) return;
    window.metabaseConfig = { theme: { preset: 'light' }, isGuest: true, instanceUrl: embedData.site_url };
    const id = 'metabase-embed-script';
    if (!document.getElementById(id)) {
      const sc = document.createElement('script');
      sc.id = id; sc.src = `${embedData.site_url}/app/embed.js`; sc.defer = true;
      document.body.appendChild(sc);
    }
  }, [embedData]);

  const statCards = [
    { icon: ShoppingBag, label: t('admin.orders')     || 'Commandes',    value: stats?.orders,     color: '#f59e0b' },
    { icon: Package,     label: t('admin.products')   || 'Produits',     value: stats?.products,   color: '#3b82f6' },
    { icon: Users,       label: t('admin.users')      || 'Utilisateurs', value: stats?.users,      color: '#10b981' },
    { icon: Tag,         label: t('admin.brands')     || 'Marques',      value: stats?.brands,     color: '#ec4899' },
    { icon: Layers,      label: t('admin.categories') || 'Catégories',   value: stats?.categories, color: '#8b5cf6' },
  ];



  /* ── render ── */
  return (
    <div className="db-root" style={{ padding: '0 0 48px', background: tokens.bg, minHeight: '100vh' }}>

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header
        className="db-fade-up"
        style={{
          marginBottom: '28px',
          padding: '52px 44px 40px',
          borderRadius: tokens.radius,
          background: `
            radial-gradient(ellipse 55% 80% at 50% -20%, rgba(245,158,11,.18) 0%, transparent 65%),
            radial-gradient(ellipse 40% 60% at 10% 110%, rgba(139,92,246,.10) 0%, transparent 60%),
            linear-gradient(160deg, #16141a 0%, #0e0c12 40%, #0a0a0b 100%)
          `,
          border: `1px solid ${tokens.border}`,
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        {/* noise grain overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: .018,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px',
        }} />

        {/* golden top border glow */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '55%', height: '1px',
          background: `linear-gradient(90deg, transparent, rgba(245,158,11,.55), transparent)`,
          pointerEvents: 'none',
        }} />

        {/* center content */}
        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* eyebrow pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '5px 14px', marginBottom: '20px',
            borderRadius: '999px',
            background: 'rgba(245,158,11,.08)',
            border: '1px solid rgba(245,158,11,.18)',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: tokens.gold, display: 'inline-block', boxShadow: `0 0 6px ${tokens.gold}` }} />
            <span style={{ color: tokens.gold, fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>
              Tableau de bord · Vue d'ensemble
            </span>
          </div>

          <h1 style={{ margin: '0 0 12px', fontSize: '2.8rem', fontWeight: 800, color: tokens.text, letterSpacing: '-.04em', lineHeight: 1.15 }}>
            {t('admin.welcome_back') || 'Bonjour,'}{' '}
            <span style={{
              display: 'inline-block',
              position: 'relative',
              color: tokens.gold,
            }}>
              {user?.first_name || t('admin.administrator') || 'Admin'}
              {/* animated underline */}
              <span style={{
                position: 'absolute',
                bottom: '-3px',
                left: 0,
                width: '100%',
                height: '2px',
                borderRadius: '99px',
                background: `linear-gradient(90deg, ${tokens.gold}, #fbbf24)`,
                transformOrigin: 'left center',
                animation: 'db-underline-in .7s cubic-bezier(.22,1,.36,1) .4s both',
              }} />
            </span>
            {'. '}
            <span style={{ color: tokens.textSub, fontWeight: 600 }}>
              { 'Voici votre espace.'}
            </span>
          </h1>

          <p style={{ margin: '0 auto 36px', color: tokens.textSub, fontSize: '1rem', lineHeight: 1.75, maxWidth: '500px' }}>
            {t('admin.welcome_desc') || 'Aperçu en temps réel de votre activité. Tout est synchronisé et à jour.'}
          </p>

          {/* ── inline mini stats ── */}
          {stats && (
            <div style={{
              display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px',
            }}>
              {[
                { icon: ShoppingBag, label: t('admin.orders')     || 'Commandes',    value: stats?.orders,     color: '#f59e0b' },
                { icon: Package,     label: t('admin.products')   || 'Produits',     value: stats?.products,   color: '#3b82f6' },
                { icon: Users,       label: t('admin.users')      || 'Utilisateurs', value: stats?.users,      color: '#10b981' },
                { icon: Tag,         label: t('admin.brands')     || 'Marques',      value: stats?.brands,     color: '#ec4899' },
                { icon: Layers,      label: t('admin.categories') || 'Catégories',   value: stats?.categories, color: '#8b5cf6' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 18px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid rgba(255,255,255,0.07)`,
                  backdropFilter: 'blur(8px)',
                  transition: 'border-color .2s, background .2s',
                  cursor: 'default',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${color}11`; e.currentTarget.style.borderColor = `${color}33`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '8px',
                    background: `${color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={14} color={color} strokeWidth={2} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ margin: 0, color: tokens.muted, fontSize: '.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', lineHeight: 1 }}>
                      {label}
                    </p>
                    <p style={{ margin: '3px 0 0', color: tokens.text, fontSize: '1rem', fontWeight: 800, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                      {value != null ? value.toLocaleString() : '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ── CONTENT ─────────────────────────────────────────────────── */}
      {loading ? (
        <div>
          {/* skeleton stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '16px', marginBottom: '28px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="db-card" style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Skeleton h="48px" w="48px" r="12px" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Skeleton h="10px" w="60%" />
                  <Skeleton h="32px" w="45%" />
                </div>
                <Skeleton h="3px" />
              </div>
            ))}
          </div>
          {/* skeleton metabase area */}
          <div className="db-card" style={{ padding: '24px' }}>
            <Skeleton h="440px" r={tokens.radiusSm} />
          </div>
        </div>
      ) : (
        <>


          {/* ── METABASE SECTION ──────────────────────────────────── */}
          {embedData?.token ? (
            <div className="db-metabase-wrap db-fade-up" style={{ animationDelay: '360ms' }}>
              <div className="db-metabase-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,.2)', animation: 'db-glow-pulse 2s ease-in-out infinite' }} />
                  <span style={{ color: tokens.text, fontWeight: 700, fontSize: '.95rem' }}>Analytics Metabase</span>
                </div>
                <a
                  href={embedData.site_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px', borderRadius: '99px',
                    background: tokens.goldDim, color: tokens.gold,
                    fontSize: '.78rem', fontWeight: 600, textDecoration: 'none',
                    border: `1px solid rgba(245,158,11,.2)`,
                    transition: 'background .2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,.2)'}
                  onMouseLeave={e => e.currentTarget.style.background = tokens.goldDim}
                >
                  Ouvrir Metabase <ArrowUpRight size={13} />
                </a>
              </div>

              <metabase-dashboard
                token={embedData.token}
                with-title="true"
                with-downloads="true"
                style={{ display: 'block', width: '100%', height: '1100px' }}
              />
            </div>

          ) : (
            <div className="db-error-card db-fade-up" style={{ animationDelay: '280ms' }}>
              <div style={{ display: 'flex', gap: '18px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: tokens.radiusSm, flexShrink: 0,
                  background: 'rgba(239,68,68,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AlertTriangle size={22} color="#ef4444" strokeWidth={2} />
                </div>
                <div>
                  <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '1rem', color: '#f87171' }}>
                    Dashboard Metabase indisponible
                  </p>
                  <p style={{ margin: '0 0 12px', fontSize: '.875rem', color: '#ef4444aa', lineHeight: 1.6 }}>
                    {mbError}
                  </p>
                  <div style={{
                    background: tokens.surfaceUp, borderRadius: tokens.radiusSm,
                    padding: '12px 16px', fontSize: '.8rem', color: tokens.muted, lineHeight: 1.6,
                  }}>
                    Vérifiez que Metabase tourne sur{' '}
                    <code style={{ fontFamily: "'DM Mono',monospace", color: tokens.textSub, background: '#ffffff08', padding: '1px 6px', borderRadius: '4px' }}>
                      {embedData?.site_url || 'votre instance'}
                    </code>
                    , que l'embedding est activé et que le dashboard est public.
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;