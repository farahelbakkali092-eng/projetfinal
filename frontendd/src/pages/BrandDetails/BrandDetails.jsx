import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { ChevronLeft, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';
import ProductCard from '../../components/ProductCard/ProductCard';
import './BrandDetails.css';

const BrandDetails = () => {
  const { slug } = useParams();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrandProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/brands/${slug}/products`);
        const { brand, products } = response.data.data;
        setBrand(brand);
        setProducts(products);
        setError(null);
      } catch (err) {
        console.error('Error fetching brand products:', err);
        setError('Impossible de charger les produits de cette marque.');
      } finally {
        setLoading(false);
      }
    };
    fetchBrandProducts();
  }, [slug]);

  if (loading) {
    return (
      <div className="brand-state-wrapper">
        <Loader2 className="brand-spinner" />
        <p className="brand-state-text">Chargement de la collection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="brand-state-wrapper">
        <div className="brand-error-card">
          <AlertCircle className="brand-error-icon" />
          <h2 className="brand-error-title">Oups !</h2>
          <p className="brand-error-msg">{error}</p>
          <Link to="/" className="brand-back-btn">
            <ChevronLeft size={16} /> Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="brand-page">

      {/* Header */}
      <div className="brand-header">
        <div className="brand-header-blob brand-header-blob--left" />
        <div className="brand-header-blob brand-header-blob--right" />

        <div className="brand-header-inner">
          <Link to="/" className="brand-breadcrumb">
            <ChevronLeft size={16} /> Toutes les marques
          </Link>

          {brand?.image_url && (
            <div className="brand-logo-wrapper">
              <img src={brand.image_url} alt={brand.name} className="brand-logo" />
            </div>
          )}

          <h1 className="brand-name">{brand?.name}</h1>

          {brand?.description && (
            <p className="brand-description">{brand.description}</p>
          )}

          <div className="brand-divider" />
        </div>
      </div>

      {/* Produits */}
      <div className="brand-products-section">
        <div className="brand-products-header">
          <span className="brand-count">
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
          <div className="brand-empty">
            <ShoppingBag className="brand-empty-icon" />
            <p className="brand-empty-title">Collection vide</p>
            <p className="brand-empty-text">
              Aucun produit n'est encore disponible pour cette marque.
            </p>
            <Link to="/" className="brand-back-btn">
              <ChevronLeft size={16} /> Retour à l'accueil
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandDetails;