import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../api';
import { useAuth } from '../../context/AuthContext';

const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [embedData, setEmbedData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getMetabaseDashboardUrl();
        setEmbedData(res.data?.data);
      } catch (e) {
        console.error('Failed to load Metabase dashboard URL', e);
        setError(t('admin.loading_error') || 'Impossible de charger le dashboard');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [t]);

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
            {t('admin.welcome_back')}, <span style={{ color: '#d4af37' }}>{user?.first_name || t('admin.administrator')}</span> 👋
          </h1>
          <p style={{ margin: 0, color: '#a3a3a3', fontSize: '1.2rem', maxWidth: '600px', lineHeight: '1.6' }}>
            {t('admin.welcome_desc')}
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
      ) : embedData?.token ? (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <metabase-dashboard
            token={embedData.token}
            with-title="true"
            with-downloads="true"
            style={{ display: 'block', width: '100%', height: '1100px' }}
          />
        </div>
      ) : null}
    </div>
  );
};

export default DashboardPage;
