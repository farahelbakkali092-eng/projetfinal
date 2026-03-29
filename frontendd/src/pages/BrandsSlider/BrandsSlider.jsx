import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const BrandsSlider = () => {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await api.get('/brands');
      setBrands(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching brands:', err);
      setError('Impossible de charger les marques');
    } finally {
      setLoading(false);
    }
  };

  // Dupliquer le tableau 4x pour que la boucle infinie soit fluide sur tous les écrans
  const loopedBrands = brands.length > 0
    ? [...brands, ...brands, ...brands, ...brands]
    : [];

  // ── CSS injecté via balise <style> ───────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&display=swap');

    @keyframes breathe {
      0%, 100% { opacity: 0.3; }
      50%       { opacity: 0.9; }
    }
    @keyframes marquee {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }

    .bs-marquee-track {
      animation: marquee 60s linear infinite;
      will-change: transform;
    }
    .bs-marquee-track.paused {
      animation-play-state: paused;
    }

    /* Logo hover */
    .bs-brand-card img {
      filter: grayscale(55%) opacity(0.7);
      transition: filter 0.45s ease, transform 0.45s ease, opacity 0.45s ease;
    }
    .bs-brand-card:hover img {
      filter: grayscale(0%) opacity(1);
      transform: scale(1.07);
    }

    /* Text-fallback hover */
    .bs-brand-name {
      transition: color 0.3s ease, letter-spacing 0.3s ease;
    }
    .bs-brand-card:hover .bs-brand-name {
      color: #b07865;
      letter-spacing: 0.22em;
    }

    /* Divider dot between cards */
    .bs-dot {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: #d9bfb7;
      flex-shrink: 0;
      margin: 0 40px;
    }
  `;

  // ── Shared base style ──────────────────────────────────────────────────────
  const pageStyle = {
    minHeight: '100vh',
    background: '#fdf6f1',           // warm beige-rose
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    fontFamily: "'Cormorant Garamond', 'Georgia', serif",
    position: 'relative',
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={pageStyle}>
        <style>{css}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#c9a49a', margin: '0 auto 20px',
            animation: 'breathe 1.8s ease-in-out infinite',
          }} />
          <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '9px', letterSpacing: '0.24em', textTransform: 'uppercase', color: '#b89080' }}>
            Chargement
          </p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={pageStyle}>
        <style>{css}</style>
        <p style={{ color: '#c0675a', fontSize: '13px', marginBottom: '20px' }}>{error}</p>
        <button
          onClick={fetchBrands}
          style={{
            padding: '10px 30px', background: '#3a2a22', color: '#fdf6f1',
            border: 'none', borderRadius: '999px', fontSize: '11px',
            letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
            fontFamily: 'Helvetica Neue, Arial, sans-serif',
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  // ── Empty ──────────────────────────────────────────────────────────────────
  if (brands.length === 0) {
    return (
      <div style={pageStyle}>
        <style>{css}</style>
        <p style={{ fontFamily: 'Helvetica Neue, Arial, sans-serif', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a99a' }}>
          Aucune marque disponible
        </p>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div style={pageStyle}>
      <style>{css}</style>

      {/* Subtle grain overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
      }} />

      {/* Background circle accents */}
      <div style={{
        position: 'fixed', bottom: '-18%', right: '-8%',
        width: 'clamp(280px, 38vw, 520px)', height: 'clamp(280px, 38vw, 520px)',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(210,170,158,0.16) 0%, transparent 68%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', top: '-14%', left: '-7%',
        width: 'clamp(200px, 28vw, 400px)', height: 'clamp(200px, 28vw, 400px)',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(185,150,140,0.11) 0%, transparent 68%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Header section ── */}
      <div style={{ textAlign: 'center', marginBottom: '64px', position: 'relative', zIndex: 1, padding: '0 24px' }}>
        <div style={{ width: '28px', height: '1px', background: 'linear-gradient(to right, transparent, #c4a098, transparent)', margin: '0 auto 32px' }} />

        <h1 style={{
          fontSize: 'clamp(2.6rem, 5.5vw, 4rem)',
          fontWeight: '300',
          letterSpacing: '0.04em',
          color: '#261812',
          margin: '0 0 12px 0',
          lineHeight: 1.05,
        }}>
          Nos Marques
        </h1>

        <p style={{
          fontFamily: 'Helvetica Neue, Arial, sans-serif',
          fontSize: '9px',
          fontWeight: '400',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: '#b89080',
          margin: 0,
        }}>
          Partenaires &amp; Collections exclusives
        </p>

        <div style={{ width: '28px', height: '1px', background: 'linear-gradient(to right, transparent, #c4a098, transparent)', margin: '32px auto 0' }} />
      </div>

      {/* ── Marquee band ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
          zIndex: 1,
          padding: '12px 0',
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Left & right fade masks */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '140px',
          background: 'linear-gradient(to right, #fdf6f1, transparent)',
          zIndex: 2, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '140px',
          background: 'linear-gradient(to left, #fdf6f1, transparent)',
          zIndex: 2, pointerEvents: 'none',
        }} />

        {/* Scrolling track */}
        <div
          className={`bs-marquee-track${paused ? ' paused' : ''}`}
          style={{ display: 'flex', alignItems: 'center', width: 'max-content' }}
        >
          {loopedBrands.map((brand, i) => (
            <React.Fragment key={`${brand.id}-${i}`}>
              <div
                className="bs-brand-card"
                onClick={() => navigate(`/brands/${brand.slug}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 12px',
                  flexShrink: 0,
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                {brand.image_url ? (
                  <div style={{ overflow: 'hidden', lineHeight: 0 }}>
                    <img
                      src={brand.image_url}
                      alt={brand.name}
                      style={{
                        height: 'clamp(32px, 4.5vw, 48px)',
                        width: 'auto',
                        maxWidth: '150px',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                      onError={(e) => {
                        e.currentTarget.parentNode.style.display = 'none';
                        const fb = e.currentTarget.closest('.bs-brand-card').querySelector('.bs-brand-name');
                        if (fb) fb.style.display = 'block';
                      }}
                    />
                  </div>
                ) : null}

                {/* Name shown when no image_url OR on img error */}
                <span
                  className="bs-brand-name"
                  style={{
                    display: brand.image_url ? 'none' : 'block',
                    fontFamily: 'Helvetica Neue, Arial, sans-serif',
                    fontSize: 'clamp(11px, 1.6vw, 14px)',
                    fontWeight: '400',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: '#8e6458',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {brand.name}
                </span>
              </div>

              {/* Decorative separator dot between items */}
              <div className="bs-dot" />
            </React.Fragment>
          ))}
        </div>
      </div>

  
    </div>
  );
};

export default BrandsSlider;