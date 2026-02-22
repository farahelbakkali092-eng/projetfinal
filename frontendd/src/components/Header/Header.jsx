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
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [showSubMenu, setShowSubMenu] = useState(false);

  // Récupération dynamique des catégories et sections pour le menu
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const [catRes, secRes] = await Promise.all([
          api.get('/products/categories'),
          api.get('/sections')
        ]);

        setCategories(Array.isArray(catRes?.data?.data) ? catRes.data.data : []);
        setSections(Array.isArray(secRes?.data?.data) ? secRes.data.data : []);
      } catch (error) {
        console.error("Error fetching menu data in Header:", error);
      }
    };
    fetchMenuData();
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

  // Construction des liens de navigation
  const navLinks = [
    { label: "NOUVEAUTÉS", path: "/", type: 'link' },
    ...sections.map(sec => ({
      label: sec.name.toUpperCase(),
      id: sec.id,
      type: 'section'
    })),
    { label: "OFFRES", path: "/promotions", type: 'link' },
  ];

  const handleSectionClick = (sectionId) => {
    if (activeSection === sectionId) {
      setShowSubMenu(!showSubMenu);
    } else {
      setActiveSection(sectionId);
      setShowSubMenu(true);
    }
  };

  const handleMouseEnterSection = (sectionId) => {
    setActiveSection(sectionId);
    setShowSubMenu(true);
  };

  const activeCategories = categories.filter(cat => cat.section_id === activeSection);

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
          <nav className="desktop-nav-center" onMouseLeave={() => setShowSubMenu(false)}>
            {navLinks.map((link) => (
              link.type === 'section' ? (
                <button
                  key={link.label}
                  onClick={() => handleSectionClick(link.id)}
                  onMouseEnter={() => handleMouseEnterSection(link.id)}
                  className={`nav-link-elegant ${activeSection === link.id && showSubMenu ? 'active' : ''}`}
                >
                  {link.label}
                </button>
              ) : (
                <Link key={link.label} to={link.path} className="nav-link-elegant">
                  {link.label}
                </Link>
              )
            ))}
          </nav>

          {/* Sub-menu Dynamique pour les catégories */}
          {showSubMenu && activeCategories.length > 0 && (
            <div
              className="header-submenu animate-fade-in-down"
              onMouseEnter={() => setShowSubMenu(true)}
              onMouseLeave={() => setShowSubMenu(false)}
            >
              <div className="submenu-container">
                {activeCategories.map(cat => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug || cat.id}`}
                    className="submenu-link"
                    onClick={() => setShowSubMenu(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Menu Mobile Dropdown */}
        {isMobileOpen && (
          <nav className="mobile-nav">
            {navLinks.map((link) => (
              link.type === 'section' ? (
                <div key={link.label}>
                  <button
                    className={`mobile-nav-link w-full text-left flex justify-between items-center ${activeSection === link.id ? 'active' : ''}`}
                    onClick={() => setActiveSection(activeSection === link.id ? null : link.id)}
                  >
                    {link.label}
                    <span>{activeSection === link.id ? '-' : '+'}</span>
                  </button>
                  {activeSection === link.id && (
                    <div className="mobile-submenu">
                      {categories.filter(c => c.section_id === link.id).map(cat => (
                        <Link
                          key={cat.id}
                          to={`/category/${cat.slug || cat.id}`}
                          className="mobile-submenu-link"
                          onClick={() => setIsMobileOpen(false)}
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.label}
                  to={link.path}
                  className="mobile-nav-link"
                  onClick={() => setIsMobileOpen(false)}
                >
                  {link.label}
                </Link>
              )
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