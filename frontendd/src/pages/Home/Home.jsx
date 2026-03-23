import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';

// Assets
import foto from "../../assets/foto.jpg";
import foto1 from "../../assets/foto1.jpg";
import foto2 from "../../assets/foto2.jpg";

// Components
import BrandsSlider from '../BrandsSlider/BrandsSlider';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Home.css';

const Home = () => {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  // Consume shared data from AppDataContext — no duplicate fetches
  const { categories, sections, bestSellers, onSaleProducts, isLoaded } = useAppData();
  const [selectedSection, setSelectedSection] = useState(null);
  const [categoriesError] = useState(false);

  // Auto-select first section once data is loaded
  React.useEffect(() => {
    if (sections.length > 0 && selectedSection === null) {
      setSelectedSection(sections[0].id);
    }
  }, [sections, selectedSection]);

  // ── Animation des compteurs ──
  useEffect(() => {
    const counters = document.querySelectorAll('.routine-counter-num');
    counters.forEach((el) => {
      const target   = parseInt(el.dataset.target, 10);
      const suffix   = el.dataset.suffix || '';
      const duration = 1800;
      let start = null;

      const step = (ts) => {
        if (!start) start = ts;
        const p    = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * ease).toLocaleString('fr-FR') + suffix;
        if (p < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    });
  }, []);

  return (
    <div className="home-page">

      {/* ── 1. HERO ── */}
      <section className="hero relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={foto} alt="Luxury beauty products" className="hero-bg-img" />
          <div className="hero-gradient-overlay" />
        </div>
        <div className="relative container hero-container">
          <div className="hero-text-content">
            <p className="hero-subtitle animate-fade-in">{t('hero.subtitle')}</p>
            <h1 className="hero-title animate-fade-in delay-100">
              {t('hero.title')} <em className="italic text-gold-light">{t('hero.titleItalic')}</em>
            </h1>
            <p className="hero-desc animate-fade-in delay-200">{t('hero.desc')}</p>
            <div className="hero-buttons animate-fade-in delay-300">
              <a href="#products" className="btn btn-gold">{t('hero.shopNow')}</a>
              <a href="#categories" className="btn btn-outline">{t('hero.explore')}</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. PERSONALIZED ROUTINE ── */}
      <section className="personalized-routine section-padding">
        <div className="container routine-grid">

          {/* Colonne image */}
          <div className="routine-image-wrapper">
            <div className="routine-deco-tl" />
            <div className="routine-deco-br" />
         <img src="https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&q=80" alt="Routine soin visage" />

            <div className="routine-float-card routine-float-left">
              <div className="routine-float-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#d4a373" stroke="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div>
                <p className="routine-float-num">4.9</p>
                <p className="routine-float-lbl">Note moyenne</p>
              </div>
            </div>

            <div className="routine-float-card routine-float-right">
              <div className="routine-float-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8e6458" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <p className="routine-float-num">2 500+</p>
                <p className="routine-float-lbl">Clientes satisfaites</p>
              </div>
            </div>
          </div>

          {/* Colonne contenu */}
          <div className="routine-content">
            <p className="routine-eyebrow">{ 'Diagnostic personnalisé'}</p>

            <h2 className="routine-title">
              {}{' '}
              <em>{'sur-mesure'}</em>
            </h2>

            <p className="routine-desc">{t('home.routineDesc')}</p>

            {/* Compteurs animés */}
            <div className="routine-counters">
              <div className="routine-counter">
                <span className="routine-counter-num" data-target="2500" data-suffix="+">0+</span>
                <span className="routine-counter-lbl">Routines créées</span>
              </div>
              <div className="routine-counter">
                <span className="routine-counter-num" data-target="98" data-suffix="%">0%</span>
                <span className="routine-counter-lbl">Satisfaction</span>
              </div>
              <div className="routine-counter">
                <span className="routine-counter-num" data-target="12" data-suffix="">0</span>
                <span className="routine-counter-lbl">Experts beauté</span>
              </div>
            </div>

            {/* Étapes */}
            <div className="routine-steps">
              {[
                {
                  n: '1',
                  title: 'Remplissez le diagnostic',
                  desc:'Type de peau, préoccupations — 2 minutes suffisent.',
                },
                {
                  n: '2',
                  title:'Nos experts analysent votre profil',
                  desc:'Une sélection de produits pensée rien que pour vous.',
                },
                {
                  n: '3',
                  title:'Recevez votre routine personnalisée',
                  desc:'Des résultats visibles, des gestes simples.',
                },
              ].map((step) => (
                <div key={step.n} className="routine-step">
                  <div className="routine-step-num">{step.n}</div>
                  <div>
                    <p className="routine-step-title">{step.title}</p>
                    <p className="routine-step-desc">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="routine-cta-row">
              <Link to="/routine" className="routine-cta">
                {t('home.routineLink')} <ArrowRight size={15} />
              </Link>
              <span className="routine-trust">
                <span className="routine-trust-dot" />
                Gratuit &amp; sans engagement
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. SHOP BY SESSION & CATEGORY */}
      {!categoriesError && sections.length > 0 && (
        <section id="categories" className="categories-section section-padding">
          <div className="container">
            <div className="section-header text-center">
              <p className="section-subtitle">{t('home.exploreSubtitle')}</p>
              <h2 className="section-title">{t('home.collectionsTitle')}</h2>
            </div>

            {/* Section Tabs/Selectors */}
            <div className="sessions-tabs flex justify-center gap-4 mb-12">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedSection(section.id)}
                  className={`session-tab-btn ${selectedSection === section.id ? 'active' : ''}`}
                >
                  {section.name}
                </button>
              ))}
            </div>

            <div className="categories-grid">
              {categories
                .filter(cat => cat.section_id === selectedSection)
                .map((cat) => (
                  <Link to={`/category/${cat.slug || cat.id}`} key={cat.id || cat.name} className="category-card group">
                    <img
                      src={(() => {
                        if (cat.image_url) return cat.image_url;
                        const raw = cat.image || null;
                        if (!raw) return 'https://placehold.co/600x400?text=Category';
                        if (typeof raw === 'string' && raw.startsWith('http')) return raw;
                        const base = import.meta.env.VITE_API_BASE_URL || '';
                        const origin = base.replace(/\/api\/v\d+\/?$/, '');
                        const path = raw.startsWith('categories/') || raw.startsWith('brands/')
                          ? `/storage/${raw}`
                          : (raw.startsWith('/') ? raw : `/${raw}`);
                        return `${origin}${path}`;
                      })()}
                      alt={cat.name}
                      className="cat-img"
                    />
                    <div className="cat-overlay" />
                    <div className="cat-content">
                      <h3 className="cat-name">{cat.name}</h3>
                      <p className="cat-count">
                        {cat.products_count !== undefined
                          ? `${cat.products_count} produits`
                          : (cat.count || 'Découvrir')}
                      </p>
                    </div>
                  </Link>
                ))}
            </div>

            {categories.filter(cat => cat.section_id === selectedSection).length === 0 && (
              <div className="text-center py-10 admin-muted">
                Aucune catégorie dans cette session pour le moment.
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 4. BEST SELLERS ── */}
      <section id="products" className="best-sellers section-padding">
        <div className="container">
          <div className="section-header text-center">
            <p className="section-subtitle">{t('home.favorites')}</p>
            <h2 className="section-title">{t('home.bestSellers')}</h2>
          </div>

          {!isLoaded ? (
            <div className="flex justify-center p-20">
              <Loader2 className="animate-spin text-gold" size={48} />
            </div>
          ) : (
            <div className="shared-products-grid">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 5. EXCLUSIVE OFFERS BANNER ── */}
      <section
        className="exclusive-offers"
        style={{
          backgroundImage: `url(${foto1})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="offers-overlay">
          <div className="offers-content text-center">
            <h2>{t('home.exclusiveOffers')}</h2>
            <Link to="/promotions" className="btn btn-transparent">{t('home.seeOffers')}</Link>
          </div>
        </div>
      </section>

      {/* ── 6. PARTNER BRANDS ── */}
      <section id="brands">
        <BrandsSlider />
      </section>

    </div>
  );
};

export default Home;