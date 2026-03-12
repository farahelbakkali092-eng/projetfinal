import React, { useMemo, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// --- IMPORTS DES COMPOSANTS GLOBAUX ---
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import AuthPage from './pages/Auth/AuthPage';

// --- IMPORTS DES PAGES ---
import Home from './pages/Home/Home';
import BrandDetails from './pages/BrandDetails/BrandDetails';
import Routine from './pages/Routine/Routine';
import Promotions from './pages/Promotions/Promotions';
import Cart from './pages/Cart/Cart';
import Contact from './pages/Contact/Contact';
import Favorites from './pages/Favorites/Favorites';

// Imports ajoutes par Farah (Recherche & Produits)
import SearchResults from './pages/SearchResults/SearchResults';
import CategoryProducts from './pages/CategoryProducts/CategoryProducts';
import ProductDetail from './pages/ProductDetail/ProductDetail';

// Imports ajoutes par toi (Support)
import Support from './pages/Support/Support';

// --- GUARDS ET APPS DEDIEES ---
import AdminGuard from './admin/AdminGuard';
import AdminApp from './admin/AdminApp';
import AccountGuard from './account/AccountGuard';
import AccountApp from './account/AccountApp';
import Checkout from './pages/Checkout/Checkout';
import OrderConfirmation from './pages/OrderConfirmation/OrderConfirmation';
import ResetPassword from './pages/Auth/ResetPassword';

import './App.css';

const App = () => {
  const location = useLocation();

  const isAdminRoute = useMemo(() => location.pathname.startsWith('/admin'), [location.pathname]);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [authView, setAuthView] = useState('signin');

  const openLogin = () => {
    setAuthView('signin');
    setIsAuthOpen(true);
  };

  const openSignup = () => {
    setAuthView('signup');
    setIsAuthOpen(true);
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  return (
    <div className="app-container">
      {!isAdminRoute && (
        <>
          <AuthPage
            isOpen={isAuthOpen}
            onClose={() => setIsAuthOpen(false)}
            initialView={authView}
          />

          <Cart
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
          />
        </>
      )}

      <div className={(!isAdminRoute && (isAuthOpen || isCartOpen)) ? 'content-blurred' : ''}>
        {!isAdminRoute && (
          <Header
            onLoginClick={openLogin}
            onSignupClick={openSignup}
            onCartClick={toggleCart}
          />
        )}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/brands/:slug" element={<BrandDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/routine" element={<Routine />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/favorites" element={<Favorites />} />

          <Route path="/search" element={<SearchResults />} />
          <Route path="/category/:id" element={<CategoryProducts />} />
          <Route path="/product/:id" element={<ProductDetail />} />

          <Route path="/faq" element={<Support />} />
          <Route path="/livraison" element={<Support />} />
          <Route path="/cgv" element={<Support />} />
          <Route path="/privacy" element={<Support />} />
          <Route path="/support" element={<Support />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/account/*"
            element={
              <AccountGuard>
                <AccountApp />
              </AccountGuard>
            }
          />

          <Route
            path="/admin/*"
            element={
              <AdminGuard>
                <AdminApp />
              </AdminGuard>
            }
          />
        </Routes>

        {!isAdminRoute && <Footer />}
      </div>
    </div>
  );
};

export default App;