import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../api';
import { LineChart, DonutChart } from '../components/AdminCharts';
import { TrendingUp, Users as UsersIcon, Package, ShoppingBag, BarChart3 } from 'lucide-react';

const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;

    let totalMiliseconds = 1500;
    let incrementTime = (totalMiliseconds / end) > 10 ? (totalMiliseconds / end) : 10;

    let timer = setInterval(() => {
      start += Math.ceil(end / 100);
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toLocaleString()}</span>;
};

const StatCard = ({ label, value, icon: Icon, trend }) => (
  <div className="admin-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
      <div>
        <div className="admin-card-label">{label}</div>
        <div className="admin-card-value">
          <AnimatedCounter value={value} />
        </div>
      </div>
      <div style={{ background: 'var(--bg-color)', padding: 10, borderRadius: 12, color: 'var(--accent)' }}>
        <Icon size={24} />
      </div>
    </div>
    {trend && (
      <div style={{ marginTop: 15, display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.85rem', color: trend > 0 ? '#16a34a' : '#dc2626' }}>
        <TrendingUp size={14} style={{ transform: trend < 0 ? 'rotate(180deg)' : 'none' }} />
        <span style={{ fontWeight: 600 }}>{Math.abs(trend)}%</span>
        <span style={{ color: 'var(--text-muted)' }}>vs mois dernier</span>
      </div>
    )}
  </div>
);

const DashboardPage = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data for charts - in a real app, this would come from the API
  const salesData = [3200, 4500, 4100, 5800, 7200, 6900, 8500];
  const distributionData = [
    { name: 'Parfums', value: 45 },
    { name: 'Cosmétiques', value: 30 },
    { name: 'Soins', value: 25 },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getStats();
        setStats(res.data.data);
      } catch (e) {
        console.error('Failed to load stats', e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="admin-page-header">
        <div>
          <h1>{t('admin.dashboard')}</h1>
          <div className="admin-muted">{t('admin.welcome') || 'Bienvenue dans votre espace de gestion premium.'}</div>
        </div>
        <div className="admin-btn secondary">
          <TrendingUp size={16} /> Rapport mensuel
        </div>
      </div>

      {loading ? (
        <div className="admin-muted">{t('admin.loading')}</div>
      ) : (
        <>
          <div className="admin-grid-cards">
            <StatCard label={t('admin.products')} value={stats?.products ?? 0} icon={Package} trend={12} />
            <StatCard label={t('admin.orders')} value={stats?.orders ?? 0} icon={ShoppingBag} trend={8} />
            <StatCard label={t('admin.users')} value={stats?.users ?? 0} icon={UsersIcon} trend={5} />
            <StatCard label="Revenu" value={stats?.revenue ?? 12450} icon={BarChart3} trend={15} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 30, marginTop: 30 }}>
            <div className="admin-card" style={{ padding: 30 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>Tendance des Ventes</h3>
                <select className="admin-input" style={{ width: 'auto', padding: '5px 10px', fontSize: '0.8rem' }}>
                  <option>7 derniers jours</option>
                  <option>30 derniers jours</option>
                </select>
              </div>
              <LineChart data={salesData} color="#d4a373" />
            </div>

            <div className="admin-card" style={{ padding: 30, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h3 style={{ alignSelf: 'start', margin: '0 0 25px 0', fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>Distribution</h3>
              <DonutChart data={distributionData} size={200} />
              <div style={{ marginTop: 25, width: '100%' }}>
                {distributionData.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: ["#2d0a0a", "#d4a373", "#e6c8a8"][i] }}></div>
                      {item.name}
                    </div>
                    <span style={{ fontWeight: 600 }}>{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
