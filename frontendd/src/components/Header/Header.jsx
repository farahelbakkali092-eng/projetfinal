import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, LogOut, Menu, X, ShieldCheck } from "lucide-react";
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import './Header.css';

const Header = ({ onLoginClick, onCartClick }) => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { cartItems } = useCart();
  const { favorites } = useFavorites();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);

  // Récupération dynamique des catégories pour le menu
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/products/categories');
        const apiCategories = Array.isArray(res?.data?.data) ? res.data.data : [];
        setCategories(apiCategories);
      } catch (error) {
        console.error("Error fetching categories in Header:", error);
      }
    };
    fetchCategories();
  }, []);

  const cartCount = cartItems.length;
  const favoritesCount = favorites.length;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  // Construction des liens de navigation (Dynamique + Fixes)
  const navLinks = [
    { label: "NOUVEAUTÉS", path: "/" },
    ...categories.map(cat => ({
      label: cat.name.toUpperCase(),
      path: `/category/${cat.slug || cat.id}`
    })),
    { label: "OFFRES", path: "/promotions" },
  ];

  return (
    <>
      <div className="top-bar">
        Livraison offerte dès 750 Dhs — Code <span className="font-bold">BEAUTY25</span> pour -25%
      </div>

      <header className="header sticky-header">
        <div className="container">
          <div className="header-top-row">
            {/* Toggle Mobile */}
            <button
              className="mobile-toggle"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo Luxury Design */}
            <Link to="/" className="logo-group">
              <div className="logo-circular-icon">
                <span className="icon-d">D</span>
                <span className="icon-w">W</span>
                <span className="icon-s">S</span>
              </div>
              <div className="logo-text">
                <span className="logo-letter letter-d">D</span>
                <span className="logo-letter letter-a">A</span>
                <span className="logo-letter letter-w">W</span>
                <span className="logo-letter letter-s">S</span>
                <span className="logo-letter letter-m">M</span>
              </div>
            </Link>

            {/* Barre de recherche (Pill design) */}
            <div className="search-wrapper">
              <form onSubmit={handleSearchSubmit} className="pill-search-form">
                <Search size={18} className="search-icon-left" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pill-search-input"
                />
                <button type="submit" className="pill-search-btn">
                  SEARCH
                </button>
              </form>
            </div>

            {/* Actions (Compte, Favoris, Panier) */}
            <div className="header-actions">
              <button
                className="icon-btn"
                onClick={user ? (isAdmin ? () => navigate('/admin') : () => navigate('/account')) : onLoginClick}
                title={user ? (isAdmin ? "Administration" : "Mon compte") : "Connexion"}
              >
                <User size={20} />
              </button>

              {!isAdmin && (
                <>
                  <Link to="/favorites" className="icon-btn relative">
                    <Heart size={20} />
                    {favoritesCount > 0 && <span className="badge">{favoritesCount}</span>}
                  </Link>

                  <button onClick={onCartClick} className="icon-btn relative">
                    <ShoppingBag size={20} />
                    {cartCount > 0 && <span className="badge">{cartCount}</span>}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Navigation Desktop */}
          <nav className="desktop-nav-center">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.path} className="nav-link-elegant">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Menu Mobile Dropdown */}
        {isMobileOpen && (
          <nav className="mobile-nav">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className="mobile-nav-link"
                onClick={() => setIsMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user && !isAdmin && (
              <Link to="/account" className="mobile-nav-link" onClick={() => setIsMobileOpen(false)}>
                Mon Espace
              </Link>
            )}
            {!user && (
              <button
                className="mobile-nav-link w-full text-left"
                onClick={() => { setIsMobileOpen(false); onLoginClick(); }}
              >
                Se connecter
              </button>
            )}
          </nav>
        )}
      </header>
    </>
  );
};

export default Header;