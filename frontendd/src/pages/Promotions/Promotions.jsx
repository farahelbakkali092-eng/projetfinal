import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import api from '../../api/axios';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Promotions.css';

const Promotions = () => {
  const [promoProducts, setPromoProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const res = await api.get('/products/on-sale?limit=20');
        setPromoProducts(res.data.data || []);
      } catch (error) {
        console.error("Error fetching promos", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPromos();
  }, []);

  return (
    <div className="promotions-page">
      <main className="main-content">
        <div className="container">
          <div className="page-header">
            <h1>Promotions Exclusives</h1>
            <p>Profitez de nos meilleures offres du moment sur une sélection de produits d'exception.</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-20">
              <Loader2 className="animate-spin text-gold" size={48} />
            </div>
          ) : promoProducts.length === 0 ? (
            <div className="no-products" style={{ textAlign: 'center', padding: '60px 20px', color: '#8e6458' }}>
              <p>Aucun produit en promotion pour le moment.</p>
            </div>
          ) : (
            <div className="shared-products-grid">
              {promoProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Promotions;