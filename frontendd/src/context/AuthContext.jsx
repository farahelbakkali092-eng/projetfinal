import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            console.error("Error parsing user from localStorage", e);
            return null;
        }
    });
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);
        try {

            const response = await api.post('/login', { email, password });
            const { user: userData, access_token } = response.data.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            toast.success('Bon retour !');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Identifiants invalides';
            const errors = error.response?.data?.errors;
            return { success: false, message, errors: errors || { general: [message] } };
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        try {

            const response = await api.post('/register', userData);
            const { user: newUser, access_token } = response.data.data;

            localStorage.setItem('token', access_token);
            localStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);

            toast.success('Bienvenue chez DAWSM !');
            return { success: true };
        } catch (error) {
            const errors = error.response?.data?.errors;
            const message = error.response?.data?.message || 'Erreur lors de l’inscription';
            return { success: false, message, errors: errors || { general: [message] } };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            toast.success('Déconnecté avec succès');
        }
    };

    const forgotPassword = async (email) => {
        setLoading(true);
        try {

            await api.post('/forgot-password', { email });
            toast.success('Si cet email existe, un lien vous a été envoyé.');
            return true;
        } catch (error) {
            return false;
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (data) => {
        setLoading(true);
        try {
            await api.post('/reset-password', data);
            toast.success('Mot de passe réinitialisé avec succès ! Vous pouvez vous connecter.');
            return true;
        } catch (error) {
            return false;
        } finally {
            setLoading(false);
        }
    };

    const refreshUser = useCallback(async () => {
        try {
            const response = await api.get('/me');
            const userData = response.data.data;
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return userData;
        } catch (error) {
            console.error('Refresh user error', error);
            if (error.response?.status === 401) {
                // Si non autorisé, on déconnecte proprement
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            }
            return null;
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            loading,
            forgotPassword,
            resetPassword,
            refreshUser,
            isAdmin: user?.role?.name === 'admin'
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);