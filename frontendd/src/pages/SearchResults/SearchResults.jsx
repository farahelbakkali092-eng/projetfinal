import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Loader2, ShoppingBag, ArrowRight } from 'lucide-react';
import ProductCard from '../../components/ProductCard/ProductCard';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import './SearchResults.css';

const SearchResults = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q');

    const { addToCart } = useCart();
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
                setProducts(res.data.data.data);
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
                    <h2>Que recherchez-vous ?</h2>
                    <p>Entrez un mot-clé dans la barre de recherche pour trouver des produits.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="search-results-page container">
            <div className="search-header">
                <h1>Résultats pour "{query}"</h1>
                <p>{products.length} produits trouvés</p>
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
                                <p>Aucun produit ne correspond à votre recherche "{query}".</p>
                                <p className="hint" style={{ color: 'var(--text-light)', marginTop: '8px', fontSize: '0.9rem' }}>
                                    Essayez de rechercher par nom, marque ou catégorie.
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
