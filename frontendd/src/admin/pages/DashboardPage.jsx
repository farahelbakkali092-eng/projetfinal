import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../api';
import { useAuth } from '../../context/AuthContext';

const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [iframeUrl, setIframeUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getMetabaseDashboardUrl();
        setIframeUrl(res.data?.data?.iframe_url || '');
      } catch (e) {
        console.error('Failed to load Metabase dashboard URL', e);
        setError(t('admin.loading_error') || 'Impossible de charger le dashboard');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [t]);

  return (
    <div className="animate-fade-in">
      <div 
        className="admin-page-header" 
        style={{ 
          marginBottom: '32px', 
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)', 
          padding: '36px', 
          borderRadius: '16px', 
          color: 'white', 
          border: '1px solid rgba(212,175,55,0.15)',
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2.4rem', fontWeight: '800', margin: '0 0 12px 0', color: '#ffffff', letterSpacing: '-0.02em' }}>
            Bon retour, <span style={{ color: '#d4af37' }}>{user?.first_name || 'Administrateur'}</span> 👋
          </h1>
          <p style={{ margin: 0, color: '#a3a3a3', fontSize: '1.2rem', maxWidth: '600px', lineHeight: '1.6' }}>
            Voici un aperçu en temps réel de votre activité. Les statistiques globales de la boutique sont présentées ci-dessous.
          </p>
        </div>
        
        {/* Decorative background elements */}
        <div style={{ position: 'absolute', right: '-5%', top: '-20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', right: '15%', bottom: '-40%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
      </div>

      {loading ? (
        <div className="admin-muted">{t('admin.loading')}</div>
      ) : error ? (
        <div className="admin-muted">{error}</div>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <iframe
            title="Metabase Dashboard"
            src={iframeUrl}
            style={{ width: '100%', height: '1100px', border: '0' }}
          />
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
