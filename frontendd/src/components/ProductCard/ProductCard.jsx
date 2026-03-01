import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { t } = useTranslation();
    const { isAdmin } = useAuth();
    const { addToCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();
    const navigate = useNavigate();
    const [isAdding, setIsAdding] = useState(false);

    const isFav = isFavorite(product.id);

    // Calculs des prix et remises
    const hasDiscount = product.discount > 0 || (product.price_sold && parseFloat(product.price_sold) < parseFloat(product.price));
    const discountPercentage = product.discount || (hasDiscount ? Math.round((1 - parseFloat(product.price_sold) / parseFloat(product.price)) * 100) : 0);
    const finalPrice = product.price_sold || (hasDiscount ? (parseFloat(product.price) * (1 - discountPercentage / 100)).toFixed(2) : parseFloat(product.price).toFixed(2));
    const originalPrice = parseFloat(product.price).toFixed(2);

    const handleCardClick = () => navigate(`/product/${product.id}`);

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (product.stock === 0 || isAdding) return;
        setIsAdding(true);
        addToCart(product);
        setTimeout(() => setIsAdding(false), 900);
    };

    const isOutOfStock = product.stock === 0;

    return (
        <article className="product-card" onClick={handleCardClick}>
            {/* ── Image zone ── */}
            <div className="product-image-container">
                {/* Favorite - Positioned top-right */}
                {!isAdmin && (
                    <button
                        className={`favorite-btn ${isFav ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(product); }}
                        aria-label={isFav ? t('favorites.remove') || "Retirer des favoris" : t('favorites.add') || "Ajouter aux favoris"}
                    >
                        <Heart
                            size={20}
                            fill={isFav ? '#c0675a' : 'none'}
                            stroke="currentColor"
                            strokeWidth={1}
                        />
                    </button>
                )}

                {/* Product image */}
                <img
                    src={
                        product.images && product.images.length > 0
                            ? `http://localhost:8000/storage/${product.images[0].image_path}`
                            : 'https://placehold.co/400x500?text=Produit'
                    }
                    alt={product.name}
                    className="product-main-image"
                />

                {/* Add to Cart - Hover Pill */}
                {!isAdmin && (
                    <button
                        className={`add-to-cart-hover ${isAdding ? 'adding' : ''}`}
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                    >
                        <span>{isAdding ? t('product.added') : t('product.addToCart')}</span>
                    </button>
                )}
            </div>

            {/* ── Product info (Design Luxe) ── */}
            <div className="product-info">
                {/* Marque - Style Bronze/Gold */}
                <span className="product-brand-label">
                    {product.brand?.name || 'DAWSM'}
                </span>

                {/* Nom Produit - Style Serif */}
                <h3 className="product-card-title">{product.name}</h3>

                {/* Prix - Style Bold */}
                <div className="product-card-pricing">
                    <span className="price-final">{finalPrice} MAD</span>
                    {hasDiscount && (
                        <span className="price-old">{originalPrice} MAD</span>
                    )}
                </div>
            </div>
        </article >
    );
};

export default ProductCard;