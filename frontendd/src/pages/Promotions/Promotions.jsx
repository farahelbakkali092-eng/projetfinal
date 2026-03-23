import React, { useState, useEffect } from 'react';
import { Loader2, Tag, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Promotions.css';

const Promotions = () => {
  const [promoProducts, setPromoProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPromos = async () => {
      try {
        const res = await api.get('/products/on-sale?limit=20', { signal: controller.signal });
        setPromoProducts(res.data.data || []);
      } catch (error) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          console.error('Error fetching promos', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromos();
    return () => controller.abort();
  }, []);

  if (isLoading) {
    return (
      <div className="promo-state-wrapper">
        <Loader2 className="promo-spinner" />
        <p className="promo-state-text">Chargement des promotions...</p>
      </div>
    );
  }

  return (
    <div className="promotions-page">

      {/* Header */}
      <div className="promo-header">
        <div className="promo-header-inner">
          <Link to="/" className="promo-breadcrumb">← Retour à l'accueil</Link>
          <h1 className="promo-title">
            <Tag size={28} className="promo-title-icon" />
            Promotions Exclusives
          </h1>
          <p className="promo-subtitle">
            Profitez de nos meilleures offres du moment sur une sélection de produits d'exception.
          </p>
          {!isLoading && promoProducts.length > 0 && (
            <span className="promo-count">
              {promoProducts.length} {promoProducts.length > 1 ? 'offres' : 'offre'} disponible{promoProducts.length > 1 ? 's' : ''}
            </span>
          )}
          <div className="promo-divider" />
        </div>
      </div>

      {/* Produits */}
      <div className="promo-products-section">
        {promoProducts.length === 0 ? (
          <div className="promo-empty">
            <div className="promo-empty-icon-wrapper">
              <ShoppingBag size={48} className="promo-empty-icon" />
            </div>
            <p className="promo-empty-title">Aucune promotion en cours</p>
            <p className="promo-empty-text">
              Revenez bientôt pour découvrir nos prochaines offres exclusives.
            </p>
            <Link to="/" className="promo-back-btn">
              <ShoppingBag size={15} />
              Explorer la boutique
            </Link>
          </div>
        ) : (
          <div className="shared-products-grid">
            {promoProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Promotions;