import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Loader2, Search, SearchX, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ProductCard from '../../components/ProductCard/ProductCard';
import api from '../../api/axios';
import './SearchResults.css';

const SearchResults = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q');

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            setIsLoading(true);
            setError(null);
            try {
                const res = await api.get(`/products?search=${encodeURIComponent(query)}&per_page=20`);
                const data = res.data.data;
                setProducts(Array.isArray(data) ? data : (data?.data || []));
            } catch (err) {
                console.error("Search error:", err);
                setError(t('search.errorGeneric') || "Une erreur est survenue lors de la recherche.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchResults();
    }, [query]);

    /* ── Pas de query ── */
    if (!query) {
        return (
            <div className="sr-page">
                <div className="sr-state-wrapper">
                    <div className="sr-state-icon-wrap">
                        <Search size={40} className="sr-state-icon" />
                    </div>
                    <p className="sr-state-title">{t('search.whatLooking') || 'Que recherchez-vous ?'}</p>
                    <p className="sr-state-text">{t('search.enterKeyword') || 'Saisissez un mot-clé dans la barre de recherche.'}</p>
                    <Link to="/" className="sr-back-btn"><ArrowLeft size={15} /> {t('search.backHome') || "Retour à l'accueil"}</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="sr-page">

            {/* ── HEADER ── */}
            <div className="sr-header">
                <div className="sr-header-blob sr-header-blob--left" />
                <div className="sr-header-blob sr-header-blob--right" />
                <div className="sr-header-inner">
                    <Link to="/" className="sr-breadcrumb"><ArrowLeft size={14} /> {t('search.backHome') || "Retour à l'accueil"}</Link>
                    <h1 className="sr-title">
                        <Search size={24} className="sr-title-icon" />
                        {t('search.title') || 'Résultats pour'} &laquo;{query}&raquo;
                    </h1>
                    {!isLoading && !error && (
                        <span className="sr-count">
                            {products.length} {products.length > 1 ? (t('search.articlesFound') || 'articles trouvés') : (t('search.articleFound') || 'article trouvé')}
                        </span>
                    )}
                    <div className="sr-divider" />
                </div>
            </div>

            {/* ── CONTENU ── */}
            <div className="sr-body">
                {isLoading ? (
                    <div className="sr-state-wrapper">
                        <Loader2 className="sr-spinner" />
                        <p className="sr-state-text-sm">{t('search.loading') || 'Recherche en cours...'}</p>
                    </div>
                ) : error ? (
                    <div className="sr-state-wrapper">
                        <div className="sr-state-icon-wrap">
                            <SearchX size={40} className="sr-state-icon sr-state-icon--error" />
                        </div>
                        <p className="sr-state-title">{t('search.errorTitle') || 'Une erreur est survenue'}</p>
                        <p className="sr-state-text">{error}</p>
                        <Link to="/" className="sr-back-btn"><ArrowLeft size={15} /> {t('search.backHome') || "Retour à l'accueil"}</Link>
                    </div>
                ) : products.length > 0 ? (
                    <div className="shared-products-grid">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="sr-empty">
                        <div className="sr-state-icon-wrap">
                            <SearchX size={40} className="sr-state-icon" />
                        </div>
                        <p className="sr-state-title">{t('search.noResultsTitle') || 'Aucun résultat'}</p>
                        <p className="sr-state-text">
                            {t('search.noProducts') || 'Aucun produit ne correspond à'} &laquo;{query}&raquo;.<br />
                            <span style={{ display: 'block', marginTop: 6 }}>
                                {t('search.hint') || 'Essayez avec un autre mot-clé ou explorez nos catégories.'}
                            </span>
                        </p>
                        <Link to="/" className="sr-back-btn"><ArrowLeft size={15} /> {t('search.exploreShop') || 'Explorer la boutique'}</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResults;