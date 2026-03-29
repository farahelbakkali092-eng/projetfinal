import React, { useState, useEffect } from 'react';
import { Loader2, Tag, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Promotions.css';

const Promotions = () => {
  const { t } = useTranslation();
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
        <p className="promo-state-text">{t('promotions.loading')}</p>
      </div>
    );
  }

  return (
    <div className="promotions-page">

      {/* Header */}
      <div className="promo-header">
        <div className="promo-header-inner">
          <Link to="/" className="promo-breadcrumb">← {t('promotions.backHome')}</Link>
          <h1 className="promo-title">
            <Tag size={28} className="promo-title-icon" />
            {t('promotions.title')}
          </h1>
          <p className="promo-subtitle">
            {t('promotions.subtitle')}
          </p>
          {!isLoading && promoProducts.length > 0 && (
            <span className="promo-count">
              {t('promotions.offers_count', { count: promoProducts.length })}
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
            <p className="promo-empty-title">{t('promotions.empty_title')}</p>
            <p className="promo-empty-text">
              {t('promotions.empty_text')}
            </p>
            <Link to="/" className="promo-back-btn">
              <ShoppingBag size={15} />
              {t('promotions.explore')}
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