import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ShoppingBag, ArrowLeft } from 'lucide-react';
import ProductCard from '../../components/ProductCard/ProductCard';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { useAppData } from '../../context/AppDataContext';
import './CategoryProducts.css';

const CategoryProducts = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    // Use categories already loaded by AppDataContext — no extra API call needed
    const { categories } = useAppData();
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (categories.length === 0) return; // Wait for AppDataContext to load

        const currentCat = categories.find(c =>
            c.id.toString() === id || c.slug === id.toLowerCase()
        );

        if (!currentCat) {
            setError('Catégorie introuvable.');
            setIsLoading(false);
            return;
        }

        setCategory(currentCat);

        const controller = new AbortController();

        const fetchProducts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const prodRes = await api.get(
                    `/products?category_id=${currentCat.id}&per_page=20`,
                    { signal: controller.signal }
                );
                setProducts(prodRes?.data?.data?.data || []);
            } catch (err) {
                if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
                    console.error('Error fetching products:', err);
                    setError('Impossible de charger les produits de cette catégorie.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
        return () => controller.abort();
    }, [id, categories]);

    if (isLoading) {
        return (
            <div className="cat-state-wrapper">
                <Loader2 className="cat-spinner" size={48} />
                <p className="cat-state-text">Chargement de la collection...</p>
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="cat-state-wrapper">
                <div className="cat-error-card">
                    <ShoppingBag className="cat-error-icon" />
                    <h2 className="cat-error-title">Oups !</h2>
                    <p className="cat-error-msg">{error || "Catégorie introuvable."}</p>
                    <Link to="/" className="cat-back-btn">
                        <ArrowLeft size={15} /> Retour à l'accueil
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="category-products-page">

            {/* Header */}
            <div className="category-header">
                <div className="category-header-inner">
                    <Link to="/" className="back-link">
                        <ArrowLeft size={16} /> Toutes les catégories
                    </Link>
                    <div className="category-title-section">
                        <h1>{category.name}</h1>
                        {category.description && (
                            <p className="category-description">{category.description}</p>
                        )}
                    </div>
                    <div className="category-divider" />
                </div>
            </div>

            {/* Produits */}
            <div className="category-products-section">
                <div className="category-products-header">
                    <span className="product-count">
                        Collection — {products.length} {products.length > 1 ? 'Articles' : 'Article'}
                    </span>
                </div>

                {products.length > 0 ? (
                    <div className="shared-products-grid">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="cat-empty">
                        <ShoppingBag className="cat-empty-icon" />
                        <p className="cat-empty-title">Collection vide</p>
                        <p className="cat-empty-text">
                            Aucun produit n'est disponible dans cette catégorie pour le moment.
                        </p>
                        <Link to="/" className="cat-back-btn">
                            <ArrowLeft size={15} /> Retour à l'accueil
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryProducts;