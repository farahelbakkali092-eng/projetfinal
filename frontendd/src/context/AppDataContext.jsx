import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AppDataContext = createContext(null);

// Module-level promise used as a lock so concurrent mounts share one fetch
let initialFetchPromise = null;

export const AppDataProvider = ({ children }) => {
    const [categories, setCategories]          = useState([]);
    const [sections, setSections]              = useState([]);
    const [brands, setBrands]                  = useState([]);
    const [bestSellers, setBestSellers]         = useState([]);
    const [onSaleProducts, setOnSaleProducts]   = useState([]);
    const [advertisingText, setAdvertisingText] = useState(' ');
    const [isLoaded, setIsLoaded]              = useState(false);

    useEffect(() => {
        let cancelled = false;

        const applyData = (data) => {
            if (cancelled) return;
            setCategories(data.categories);
            setSections(data.sections);
            setBrands(data.brands);
            setAdvertisingText(data.advertisingText);
            setBestSellers(data.bestSellers);
            setOnSaleProducts(data.onSaleProducts);
            setIsLoaded(true);
        };

        const fetchAppData = async () => {
            // Reuse an in-flight request if one already exists
            if (!initialFetchPromise) {
                initialFetchPromise = (async () => {
                    const [catRes, secRes, settingsRes, brandsRes, bestRes, saleRes] = await Promise.all([
                        api.get('/products/categories'),
                        api.get('/sections'),
                        api.get('/settings'),
                        api.get('/brands'),
                        api.get('/products/best-sellers?limit=4'),
                        api.get('/products/on-sale?limit=4')
                    ]);

                    return {
                        categories:      Array.isArray(catRes?.data?.data) ? catRes.data.data : [],
                        sections:        Array.isArray(secRes?.data?.data) ? secRes.data.data : [],
                        brands:          brandsRes?.data?.data || [],
                        advertisingText: settingsRes?.data?.data?.advertising_text || ' ',
                        bestSellers:     bestRes?.data?.data || [],
                        onSaleProducts:  saleRes?.data?.data || []
                    };
                })();
            }

            try {
                const data = await initialFetchPromise;
                applyData(data);
            } catch (error) {
                console.error('AppDataContext: failed to fetch shared app data', error);
                if (!cancelled) setIsLoaded(true);
            }
        };

        fetchAppData();

        return () => {
            cancelled = true;
            // Removed to prevent double-fetching on React StrictMode mount/unmount cycle
            // initialFetchPromise = null;
        };
    }, []); // Run only once on mount

    return (
        <AppDataContext.Provider value={{
            categories,
            sections,
            brands,
            bestSellers,
            onSaleProducts,
            advertisingText,
            isLoaded
        }}>
            {children}
        </AppDataContext.Provider>
    );
};

export const useAppData = () => {
    const ctx = useContext(AppDataContext);
    if (!ctx) throw new Error('useAppData must be used within an AppDataProvider');
    return ctx;
};
