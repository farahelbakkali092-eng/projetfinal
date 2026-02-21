import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { isAdmin } = useAuth();
    const { addToCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();
    const navigate = useNavigate();
    const [isAdding, setIsAdding] = useState(false);

    const isFav = isFavorite(product.id);

    // Calculs des prix et remises
    const hasDiscount = product.discount > 0 || (product.price_sold && parseFloat(product.price_sold) < parseFloat(product.price));
    const discountPercentage = product.discount || (hasDiscount ? Math.round((1 - parseFloat(product.price_sold) / parseFloat(product.price)) * 100) : 0);
    const finalPrice = product.price_sold || (hasDiscount ? (parseFloat(product.price) * (1 - discountPercentage / 100)).toFixed(0) : parseFloat(product.price).toFixed(0));
    const originalPrice = parseFloat(product.price).toFixed(0);

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

                {/* Badges top-left */}
                <div className="card-badges">
                    {hasDiscount && (
                        <span className="badge sale">-{discountPercentage}%</span>
                    )}
                    {isOutOfStock && (
                        <span className="badge stock">Sur commande</span>
                    )}
                </div>

                {/* Favorite - Positioned top-right */}
                {!isAdmin && (
                    <button
                        className={`favorite-btn ${isFav ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(product); }}
                        aria-label={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                        <Heart
                            size={18}
                            fill={isFav ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth={1.5}
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

                {/* Add-to-cart overlay - Appears on hover */}
                {!isAdmin && (
                    <div className="add-to-cart-overlay">
                        <button
                            className={`overlay-cart-btn ${isAdding ? 'adding' : ''}`}
                            disabled={isOutOfStock || isAdding}
                            onClick={handleAddToCart}
                            aria-label="Ajouter au panier"
                        >
                            <ShoppingBag size={14} strokeWidth={1.5} style={{ marginRight: '8px' }} />
                            <span>
                                {isAdding ? 'Ajouté' : isOutOfStock ? 'Rupture' : 'Ajouter au Panier'}
                            </span>
                        </button>
                    </div>
                )}
            </div>

            {/* ── Product info (Style Minimaliste / Luxe) ── */}
            <div className="product-info">
                {/* Marque */}
                <span className="product-brand-name">
                    {product.brand?.name || 'DAWSM'}
                </span>

                {/* Nom Produit */}
                <h3 className="product-title">{product.name}</h3>

                {/* Prix - Centré et élégant */}
                <div className="product-pricing">
                    {/* Prix Barré (si promo) */}
                    {hasDiscount && (
                        <span className="original-price">{originalPrice} MAD</span>
                    )}

                    {/* Prix Final */}
                    <span className="current-price">{finalPrice} MAD</span>
                </div>
            </div>

        </article>
    );
};

export default ProductCard;