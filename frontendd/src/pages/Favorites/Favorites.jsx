import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '../../context/FavoritesContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Favorites.css';

const Favorites = () => {
  const { t } = useTranslation();
  const { favorites } = useFavorites();

  return (
    <div className="favorites-page">
      <div className="container">
        <div className="favorites-header">
          <h1>{t('favorites.title')}</h1>
          <span className="favorites-count">
            {favorites.length} {t('favorites.products')}
          </span>
        </div>

        {favorites.length === 0 ? (
          <div className="favorites-empty">
            <Heart size={60} strokeWidth={1} color="#c9a49a" />
            <h2>{t('favorites.emptyTitle')}</h2>
            <p>{t('favorites.emptyText')}</p>
            <Link to="/" className="btn-explore">
              {t('favorites.explore')}
            </Link>
          </div>
        ) : (
          <div className="shared-products-grid">
            {favorites.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;