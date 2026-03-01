import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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
                setError("Une erreur est survenue lors de la recherche.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    if (!query) {
        return (
            <div className="search-results-page container">
                <div className="empty-search">
                    <h2>{t('search.whatLooking')}</h2>
                    <p>{t('search.enterKeyword')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="search-results-page container">
            <div className="search-header">
                <h1>{t('search.title')} "{query}"</h1>
                <p>{products.length} {t('search.found')}</p>
            </div>

            {isLoading ? (
                <div className="loading-state">
                    <Loader2 className="animate-spin text-gold" size={48} />
                </div>
            ) : error ? (
                <div className="error-state">
                    <p>{error}</p>
                </div>
            ) : (
                <div className="results-content">
                    <section className="results-section">
                        {products.length > 0 ? (
                            <div className="shared-products-grid">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="no-results-all">
                                <p>{t('search.noResults')} "{query}".</p>
                                <p className="hint" style={{ color: 'var(--text-light)', marginTop: '8px', fontSize: '0.9rem' }}>
                                    {t('search.hint')}
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};

export default SearchResults;
