import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ShoppingBag, ArrowLeft } from 'lucide-react';
import ProductCard from '../../components/ProductCard/ProductCard';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import './CategoryProducts.css';

const CategoryProducts = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategoryData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch all categories to find the one matching the slug or ID
                const catRes = await api.get('/products/categories');
                const allCategories = Array.isArray(catRes?.data?.data) ? catRes.data.data : [];

                // Find the specific category (handle both ID and Slug)
                const currentCat = allCategories.find(c =>
                    c.id.toString() === id || c.slug === id.toLowerCase()
                );

                if (!currentCat) {
                    setError("Catégorie introuvable.");
                    setIsLoading(false);
                    return;
                }

                setCategory(currentCat);

                // Fetch products filtered by the actual category ID
                const prodRes = await api.get(`/products?category_id=${currentCat.id}&per_page=20`);
                setProducts(prodRes?.data?.data?.data || []);

            } catch (err) {
                console.error("Error fetching category data:", err);
                setError("Impossible de charger les produits de cette catégorie.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategoryData();
    }, [id]);

    if (isLoading) {
        return (
            <div className="category-loading container">
                <Loader2 className="animate-spin text-gold" size={48} />
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="category-error container">
                <h2>Oups !</h2>
                <p>{error || "Catégorie introuvable."}</p>
                <Link to="/" className="btn btn-gold">Retour à l'accueil</Link>
            </div>
        );
    }

    return (
        <div className="category-products-page container">
            <div className="category-header">
                <Link to="/" className="back-link">
                    <ArrowLeft size={16} /> Retour à l'accueil
                </Link>
                <div className="category-title-section">
                    <h1>{category.name}</h1>
                    <p className="product-count">{products.length} {products.length > 1 ? 'produits' : 'produit'}</p>
                    {category.description && <p className="category-description">{category.description}</p>}
                </div>
            </div>

            <div className="shared-products-grid">
                {products.length > 0 ? (
                    products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div className="no-products">
                        <p>Aucun produit trouvé dans cette catégorie pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryProducts;
