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
        const res = await api.get('/products?per_page=8');
        // On s'assure que les produits ont les champs nécessaires pour l'affichage des promos
        setPromoProducts(res.data.data.data.map(p => ({
          ...p,
          discount: 20, // Valeur numérique pour ProductCard
          price_sold: (p.price * 0.8).toFixed(2)
        })));
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