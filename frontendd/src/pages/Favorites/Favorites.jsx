import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
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

        {/* Header */}
        <div className="favorites-header">
          <div className="favorites-header-inner">
            <Link to="/" className="fav-breadcrumb">
              ← Retour à l'accueil
            </Link>
            <h1 className="favorites-title">
              <Heart size={28} className="fav-title-icon" />
              {t('favorites.title')}
            </h1>
            <span className="favorites-count">
              {favorites.length} {t('favorites.products')}
            </span>
            <div className="fav-divider" />
          </div>
        </div>

        {/* État vide */}
        {favorites.length === 0 ? (
          <div className="fav-empty">
            <div className="fav-empty-icon-wrapper">
              <Heart size={52} className="fav-empty-icon" />
            </div>
            <p className="fav-empty-title">{t('favorites.emptyTitle') || 'Votre liste est vide'}</p>
            <p className="fav-empty-text">
              {t('favorites.emptyText') || 'Ajoutez des produits à vos favoris pour les retrouver ici.'}
            </p>
            <Link to="/" className="fav-back-btn">
              <ShoppingBag size={15} />
              {t('favorites.explore') || 'Explorer la boutique'}
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