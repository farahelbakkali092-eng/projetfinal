import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

// Assets
import foto from "../../assets/foto.jpg";
import foto1 from "../../assets/foto1.jpg";
import foto2 from "../../assets/foto2.jpg";

// Components
import BrandsSlider from '../BrandsSlider/BrandsSlider';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Home.css';

const Home = () => {
  const { addToCart } = useCart();
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [bestSellers, setBestSellers] = useState([]);
  const [onSaleProducts, setOnSaleProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(false);

  // Détermine l'URL de base du backend pour les images
  const backendOrigin = (() => {
    const base = import.meta.env.VITE_API_BASE_URL;
    if (!base || typeof base !== 'string') return '';
    return base.replace(/\/api\/v\d+\/?$/, '');
  })();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Chargement parallèle des données
        const [catRes, secRes, bestRes, saleRes] = await Promise.all([
          api.get('/products/categories'),
          api.get('/sections'),
          api.get('/products/best-sellers?limit=4'),
          api.get('/products/on-sale?limit=4')
        ]);

        const apiCategories = Array.isArray(catRes?.data?.data) ? catRes.data.data : [];
        const apiSessions = Array.isArray(secRes?.data?.data) ? secRes.data.data : [];

        setCategories(apiCategories);
        setSessions(apiSessions);

        // Auto-select first session if exists
        if (apiSessions.length > 0) {
          setSelectedSection(apiSessions[0].id);
        }

        setCategoriesError(false);

        setBestSellers(bestRes.data.data || []);
        setOnSaleProducts(saleRes.data.data || []);
      } catch (error) {
        console.error("Error fetching home data", error);
        setCategoriesError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

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
            <p className="hero-subtitle animate-fade-in">Spring Collection 2025</p>
            <h1 className="hero-title animate-fade-in delay-100">
              Discover Your <em className="italic text-gold-light">Natural</em> Glow
            </h1>
            <p className="hero-desc animate-fade-in delay-200">
              Curated luxury beauty essentials from the world's most prestigious brands.
            </p>
            <div className="hero-buttons animate-fade-in delay-300">
              <a href="#products" className="btn btn-gold">Shop Now</a>
              <a href="#categories" className="btn btn-outline">Explore</a>
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
            <h2>Votre routine personnalisée</h2>
            <p>Vous souhaitez une routine personnalisée pour votre peau ? Remplissez ce formulaire et laissez nos experts vous guider.</p>
            <Link to="/routine" className="link-underline">
              Remplir le formulaire <ArrowRight size={16} style={{ marginLeft: '8px' }} />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. SHOP BY SESSION & CATEGORY */}
      {!categoriesError && sessions.length > 0 && (
        <section id="categories" className="categories-section section-padding">
          <div className="container">
            <div className="section-header text-center">
              <p className="section-subtitle">EXPLORE</p>
              <h2 className="section-title">Nos Collections</h2>
            </div>

            {/* Session Tabs/Selectors */}
            <div className="sessions-tabs flex justify-center gap-4 mb-12">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSection(session.id)}
                  className={`session-tab-btn ${selectedSection === session.id ? 'active' : ''}`}
                >
                  {session.name}
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

                        // Fallback: if it's already an absolute URL
                        if (typeof raw === 'string' && raw.startsWith('http')) return raw;

                        // Fallback: append /storage/ if missing and prepend backendOrigin
                        const path = raw.startsWith('categories/') || raw.startsWith('brands/')
                          ? `/storage/${raw}`
                          : (raw.startsWith('/') ? raw : `/${raw}`);

                        return `${backendOrigin}${path}`;
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

      {/* 4. BEST SELLERS */}
      <section id="products" className="best-sellers section-padding">
        <div className="container">
          <div className="section-header text-center">
            <p className="section-subtitle">FAVORITES</p>
            <h2 className="section-title">Produits les plus vendus</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-20">
              <Loader2 className="animate-spin text-gold" size={48} />
            </div>
          ) : (
            <div className="products-grid">
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
              <p className="section-subtitle" style={{ color: '#c0675a', fontWeight: 600 }}>OFFRES SPÉCIALES</p>
              <h2 className="section-title">Les Soldes</h2>
            </div>

            <div className="products-grid">
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
            <h2>Nos offres exclusives vous attendent</h2>
            <Link to="/promotions" className="btn btn-transparent">Voir le solde</Link>
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