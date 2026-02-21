import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { ChevronLeft, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';
import ProductCard from '../../components/ProductCard/ProductCard';
import './BrandDetails.css'; // Assurez-vous que ce fichier contient le CSS donné précédemment

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
        // Appel API pour récupérer la marque et ses produits
        const response = await api.get(`/brands/${slug}/products`);

        // Structure de réponse basée sur votre ApiResponseTrait
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

  // --- ÉTAT : CHARGEMENT ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf6f1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#b07865] mx-auto mb-4" />
          <p className="text-[#b07865] uppercase tracking-widest text-xs">Chargement de la collection...</p>
        </div>
      </div>
    );
  }

  // --- ÉTAT : ERREUR ---
  if (error) {
    return (
      <div className="min-h-screen bg-[#fdf6f1] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm text-center border border-rose-100">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-[#261812] mb-2">Oups !</h2>
          <p className="text-[#8e6458] mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-[#3a2a22] text-[#fdf6f1] rounded-full text-sm tracking-wide transition-transform hover:scale-105"
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  // --- RENDU PRINCIPAL ---
  return (
    <div className="min-h-screen bg-[#fdf6f1] font-serif">

      {/* Header Section (Bannière de la marque) */}
      <div className="relative pt-20 pb-16 px-6 text-center overflow-hidden">
        {/* Éléments décoratifs d'arrière-plan */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-rose-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Fil d'ariane / Retour */}
          <Link
            to="/"
            className="inline-flex items-center text-[#b89080] hover:text-[#b07865] transition-colors mb-8 text-xs uppercase tracking-widest group"
          >
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Toutes les marques
          </Link>

          {/* Logo de la marque */}
          {brand?.image_url && (
            <div className="mb-6 flex justify-center">
              <img
                src={brand.image_url}
                alt={brand.name}
                className="h-24 object-contain mix-blend-multiply opacity-90"
              />
            </div>
          )}

          {/* Nom de la marque */}
          <h1 className="text-4xl md:text-6xl font-light text-[#261812] mb-6 tracking-tight">
            {brand?.name}
          </h1>

          {/* Description */}
          {brand?.description && (
            <p className="text-[#8e6458] max-w-2xl mx-auto leading-relaxed text-lg font-light italic">
              {brand.description}
            </p>
          )}

          {/* Séparateur */}
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#c4a098] to-transparent mx-auto mt-12" />
        </div>
      </div>

      {/* Section des Produits */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pb-24 relative z-10">

        {/* Compteur d'articles */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[10px] uppercase tracking-[0.4em] text-[#b89080] font-medium">
            Collection — {products.length} {products.length > 1 ? 'Articles' : 'Article'}
          </h2>
        </div>

        {/* Grille des produits */}
        {products.length > 0 ? (
          // C'est ici que la magie opère avec la classe CSS personnalisée
          <div className="shared-products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          // Cas où il n'y a pas de produits
          <div className="text-center py-32 bg-white/30 backdrop-blur-sm rounded-3xl border border-dashed border-[#d9bfb7]">
            <ShoppingBag className="w-12 h-12 text-[#d9bfb7] mx-auto mb-4" />
            <p className="text-[#8e6458] text-lg font-light italic">
              Aucun produit n'est encore disponible pour cette marque.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandDetails;