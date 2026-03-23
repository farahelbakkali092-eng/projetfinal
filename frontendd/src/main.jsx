import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { AppDataProvider } from './context/AppDataContext';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './i18n';
import './index.css'; 
import './App.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <BrowserRouter>
            <AppDataProvider>
            <Toaster
              position="top-right"
              containerStyle={{ zIndex: 99999 }}
              toastOptions={{
                style: {
                  zIndex: 99999,
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                },
                success: {
                  style: {
                    background: '#fff',
                    color: '#333',
                    border: '1px solid #d4a373',
                  },
                  iconTheme: { primary: '#d4a373', secondary: '#fff' },
                },
                error: {
                  style: {
                    background: '#fff',
                    color: '#333',
                    border: '1px solid #e53e3e',
                  },
                  iconTheme: { primary: '#e53e3e', secondary: '#fff' },
                },
              }}
            />
            <App />
            </AppDataProvider>
          </BrowserRouter>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);