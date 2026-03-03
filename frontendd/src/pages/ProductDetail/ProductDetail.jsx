import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ShoppingBag, Heart, Minus, Plus, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const { isAdmin } = useAuth();
    const { addToCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();

    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    const isFav = product ? isFavorite(product.id) : false;

    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            try {
                const res = await api.get(`/products/${id}`);
                setProduct(res.data.data);
            } catch (err) {
                console.error("Error fetching product:", err);
                setError("Oups ! Nous n'avons pas pu charger les détails du produit.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleQuantityChange = (val) => {
        if (val < 1) return;
        if (product && val > product.stock) return;
        setQuantity(val);
    };

    if (isLoading) {
        return (
            <div className="product-detail-loading">
                <Loader2 className="animate-spin text-gold" size={48} />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-detail-error container">
                <h2>Erreur</h2>
                <p>{error || "Produit introuvable."}</p>
                <Link to="/" className="btn btn-gold">Retour à l'accueil</Link>
            </div>
        );
    }

    const images = product.images && product.images.length > 0
        ? product.images.map(img => `http://localhost:8000/storage/${img.image_path}`)
        : ['https://placehold.co/600x800?text=No+Image'];

    const hasDiscount = product.discount > 0 || (product.price_sold && parseFloat(product.price_sold) < parseFloat(product.price));
    const discountPercentage = product.discount || (hasDiscount ? Math.round((1 - parseFloat(product.price_sold) / parseFloat(product.price)) * 100) : 0);
    const finalPrice = product.price_sold
        ? parseFloat(product.price_sold).toFixed(2)
        : parseFloat(product.price).toFixed(2);
    const originalPrice = parseFloat(product.price).toFixed(2);

    const isOutOfStock = product.stock === 0;

    return (
        <div className="product-detail-page container">
            {/* Breadcrumbs */}
            <nav className="breadcrumbs">
                <Link to="/">Accueil</Link>
                <span className="separator">/</span>
                {product.category && (
                    <>
                        <Link to={`/category/${product.category_id}`}>{product.category.name}</Link>
                        <span className="separator">/</span>
                    </>
                )}
                <span className="current">{product.name}</span>
            </nav>

            <div className="product-main-grid">
                {/* Image Gallery */}
                <div className="product-gallery">
                    <div className="thumbnails">
                        {images.map((img, idx) => (
                            <div
                                key={idx}
                                className={`thumbnail ${selectedImage === idx ? 'active' : ''}`}
                                onClick={() => setSelectedImage(idx)}
                            >
                                <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} />
                            </div>
                        ))}
                    </div>
                    <div className="main-image">
                        {hasDiscount && (
                            <div className="image-badges">
                                <span className="badge-promo">-{discountPercentage}%</span>
                            </div>
                        )}
                        {isOutOfStock && (
                            <div className="image-badges">
                                <span className="badge-stock">Sur commande</span>
                            </div>
                        )}
                        <img src={images[selectedImage]} alt={product.name} />
                    </div>
                </div>

                {/* Product Info */}
                <div className="product-info-panel">
                    {product.brand && (
                        <span className="brand-name">{product.brand.name}</span>
                    )}
                    <h1 className="product-title">{product.name}</h1>

                    {product.description && (
                        <p className="product-description">{product.description}</p>
                    )}

                    <div className="product-price-row">
                        <span className="current-price">{finalPrice} MAD</span>
                        {hasDiscount && (
                            <span className="old-price">{originalPrice} MAD</span>
                        )}
                    </div>

                    <div className="stock-info">
                        {isOutOfStock ? (
                            <span className="out-of-stock-text">Sur commande</span>
                        ) : (
                            <span className="in-stock-text">En stock ({product.stock} disponibles)</span>
                        )}
                    </div>

                    {!isAdmin && (
                        <div className="purchase-controls">
                            <div className="quantity-picker">
                                <button onClick={() => handleQuantityChange(quantity - 1)}><Minus size={16} /></button>
                                <span>{quantity}</span>
                                <button onClick={() => handleQuantityChange(quantity + 1)}><Plus size={16} /></button>
                            </div>

                            <button
                                className="btn-add-to-bag"
                                disabled={isOutOfStock}
                                onClick={() => addToCart({ ...product, quantity })}
                            >
                                <ShoppingBag size={20} />
                                <span>Ajouter au panier</span>
                            </button>

                            <button
                                className={`btn-wishlist ${isFav ? 'active' : ''}`}
                                onClick={() => toggleFavorite(product)}
                            >
                                <Heart size={24} fill={isFav ? "white" : "none"} color="white" />
                            </button>
                        </div>
                    )}

                    <div className="product-features-list">
                        <div className="feature-item">
                            <Truck size={20} />
                            <span>Livraison disponible</span>
                        </div>
                        <div className="feature-item">
                            <RotateCcw size={20} />
                            <span>Retours acceptés</span>
                        </div>
                        <div className="feature-item">
                            <ShieldCheck size={20} />
                            <span>Produit authentique garanti</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
