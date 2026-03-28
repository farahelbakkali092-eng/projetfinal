import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ShoppingBag, ArrowLeft } from 'lucide-react';
import ProductCard from '../../components/ProductCard/ProductCard';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { useAppData } from '../../context/AppDataContext';
import { useTranslation } from 'react-i18next';
import './CategoryProducts.css';

const CategoryProducts = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { t } = useTranslation();
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
            setError(t('category.notFound') || 'Catégorie introuvable.');
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
                    setError(t('category.loadError') || 'Impossible de charger les produits de cette catégorie.');
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
                <p className="cat-state-text">{t('category.loading') || 'Chargement de la collection...'}</p>
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="cat-state-wrapper">
                <div className="cat-error-card">
                    <ShoppingBag className="cat-error-icon" />
                    <h2 className="cat-error-title">{t('category.oops') || 'Oups !'}</h2>
                    <p className="cat-error-msg">{error || (t('category.notFound') || "Catégorie introuvable.")}</p>
                    <Link to="/" className="cat-back-btn">
                        <ArrowLeft size={15} /> {t('category.backHome') || "Retour à l'accueil"}
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
                        <ArrowLeft size={16} /> {t('category.allCategories') || 'Toutes les catégories'}
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
                        {t('category.collection') || 'Collection'} — {products.length} {products.length > 1 ? (t('category.articles') || 'Articles') : (t('category.article') || 'Article')}
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
                        <p className="cat-empty-title">{t('category.emptyTitle') || 'Collection vide'}</p>
                        <p className="cat-empty-text">
                            {t('category.emptyText') || "Aucun produit n'est disponible dans cette catégorie pour le moment."}
                        </p>
                        <Link to="/" className="cat-back-btn">
                            <ArrowLeft size={15} /> {t('category.backHome') || "Retour à l'accueil"}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryProducts;