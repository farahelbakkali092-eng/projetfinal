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

  return (
    <div className="home-page">
      {/* 1. HERO SECTION */}
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
            <p className="hero-desc animate-fade-in delay-200">
              {t('hero.desc')}
            </p>
            <div className="hero-buttons animate-fade-in delay-300">
              <a href="#products" className="btn btn-gold">{t('hero.shopNow')}</a>
              <a href="#categories" className="btn btn-outline">{t('hero.explore')}</a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PERSONALIZED ROUTINE */}
      <section className="personalized-routine section-padding">
        <div className="container routine-grid">
          <div className="routine-image-wrapper">
            <img
              src={foto2}
              alt="Routine soin visage"
            />
          </div>
          <div className="routine-content">
            <h2>{t('home.routineTitle')}</h2>
            <p>{t('home.routineDesc')}</p>
            <Link to="/routine" className="link-underline">
              {t('home.routineLink')} <ArrowRight size={16} style={{ marginLeft: '8px' }} />
            </Link>
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
                      src={cat.image_url || 'https://placehold.co/600x400?text=Category'}
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

      {/* 4. BEST SELLERS */}
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

      {/* 5. ON SALE SECTION */}
      {onSaleProducts.length > 0 && (
        <section className="on-sale-section section-padding bg-rose-50/30">
          <div className="container">
            <div className="section-header text-center">
              <p className="section-subtitle" style={{ color: '#c0675a', fontWeight: 600 }}>{t('home.specialOffers')}</p>
              <h2 className="section-title">{t('home.saleTitle')}</h2>
            </div>

            <div className="shared-products-grid">
              {onSaleProducts
                .filter(product => (product.discount > 0) || (product.price_sold && parseFloat(product.price_sold) < parseFloat(product.price)))
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. EXCLUSIVE OFFERS BANNER */}
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

      {/* 7. PARTNER BRANDS */}
      <section id="brands">
        <BrandsSlider />
      </section>
    </div>
  );
};

export default Home;