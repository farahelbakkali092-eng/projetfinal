import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState(() => {
        try {
            const savedFavs = localStorage.getItem('favorites');
            return savedFavs ? JSON.parse(savedFavs) : [];
        } catch (e) {
            console.error("Error parsing favorites from localStorage", e);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }, [favorites]);

    const toggleFavorite = (product) => {
        setFavorites(prev => {
            const isFav = prev.find(item => item.id === product.id);
            if (isFav) {
                toast.success(`${product.name} retiré des favoris`);
                return prev.filter(item => item.id !== product.id);
            }
            toast.success(`${product.name} ajouté aux favoris`);
            return [...prev, product];
        });
    };

    const isFavorite = (id) => favorites.some(item => item.id === id);

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoritesContext);
