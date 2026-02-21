import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ShoppingBag, Heart, Minus, Plus, Truck, RotateCcw, ShieldCheck, Star } from 'lucide-react';
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
    const [selectedSize, setSelectedSize] = useState('50ml');

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
        : ['https://via.placeholder.com/600x800?text=No+Image'];

    return (
        <div className="product-detail-page container">
            {/* Breadcrumbs */}
            <nav className="breadcrumbs">
                <Link to="/">Home</Link>
                <span className="separator">/</span>
                <Link to={`/category/${product.category_id}`}>{product.category?.name || 'Category'}</Link>
                <span className="separator">/</span>
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
                                <img src={img} alt={`${product.name} thumbnail ${idx}`} />
                            </div>
                        ))}
                    </div>
                    <div className="main-image">
                        <div className="image-badges">
                            {product.stock >= 10 && <span className="badge-bestseller">BESTSELLER</span>}
                            {product.price < 40 && <span className="badge-promo">-21%</span>}
                        </div>
                        <img src={images[selectedImage]} alt={product.name} />
                    </div>
                </div>

                {/* Product Info */}
                <div className="product-info-panel">
                    <span className="brand-name">{product.brand?.name || 'DAWSM'}</span>
                    <h1 className="product-title">{product.name}</h1>

                    <div className="product-rating">
                        <div className="stars">
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} size={16} fill="#c49a6c" color="#c49a6c" />
                            ))}
                        </div>
                        <span className="rating-text">4.8 (1247 reviews)</span>
                    </div>

                    <div className="product-price-row">
                        <span className="current-price">${product.price}</span>
                        <span className="old-price">${(product.price * 1.2).toFixed(2)}</span>
                        <span className="save-badge">Save $10</span>
                    </div>

                    <p className="product-description">
                        {product.description || "Indulge in the luxurious formula of this beauty essential. Crafted with the finest ingredients, it delivers visible results from the very first use. Experience the perfect blend of science and beauty."}
                    </p>

                    <div className="size-selector">
                        <span className="selector-label">SIZE</span>
                        <div className="size-options">
                            {['30ml', '50ml', '75ml', '100ml'].map(size => (
                                <button
                                    key={size}
                                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                                    onClick={() => setSelectedSize(size)}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
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
                                disabled={product.stock === 0}
                                onClick={() => addToCart(product)}
                            >
                                <ShoppingBag size={20} />
                                <span>ADD TO BAG</span>
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
                            <span>Free Shipping</span>
                        </div>
                        <div className="feature-item">
                            <RotateCcw size={20} />
                            <span>30-Day Returns</span>
                        </div>
                        <div className="feature-item">
                            <ShieldCheck size={20} />
                            <span>Authentic Guaranteed</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
