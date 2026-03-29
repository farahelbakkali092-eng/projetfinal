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
        const isFav = favorites.some(item => item.id === product.id);
        if (isFav) {
            setFavorites(prev => prev.filter(item => item.id !== product.id));
        } else {
            setFavorites(prev => [...prev, product]);
        }
    };

    const isFavorite = (id) => favorites.some(item => item.id === id);

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => useContext(FavoritesContext);
