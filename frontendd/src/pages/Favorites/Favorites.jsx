import React from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import { HashLink } from 'react-router-hash-link';
import './Favorites.css';

const Favorites = () => {
  const { favorites } = useFavorites();

  return (
    <div className="favorites-page">
      <div className="container">

        {/* Header de la Wishlist */}
        <div className="wishlist-header">
          <Heart className="wishlist-title-icon" size={28} />
          <h1 className="wishlist-title">
            Mes Favoris <span className="wishlist-count">({favorites.length} produits)</span>
          </h1>
        </div>

        {favorites.length === 0 ? (
          /* État Vide */
          <div className="empty-wishlist">
            <div className="empty-icon-wrapper">
              <Heart size={80} strokeWidth={1} className="empty-heart-icon" />
            </div>

            <h2 className="empty-title">Votre liste est vide</h2>
            <p className="empty-text">
              Enregistrez vos produits préférés pour les retrouver facilement plus tard.
            </p>

            {/* Utilisation de HashLink pour retourner à la section produits de l'accueil */}
            <HashLink smooth to="/#products" className="explore-btn">
              Explorer les produits
            </HashLink>
          </div>
        ) : (
          /* Grille de Favoris utilisant le ProductCard réutilisable */
          <div className="shared-products-grid">
            {favorites.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;