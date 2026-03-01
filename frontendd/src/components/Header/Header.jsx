import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, LogOut, Menu, X, ShieldCheck } from "lucide-react";
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import './Header.css';

const Header = ({ onLoginClick }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, logout, isAdmin } = useAuth();
  const { cartItems } = useCart();
  const { favorites } = useFavorites();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [advertisingText, setAdvertisingText] = useState(" ");

  // Language switcher
  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'fr';

  const toggleLanguage = () => {
    const newLang = currentLang === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
    localStorage.setItem('lang', newLang);
  };

  // Récupération dynamique des catégories et sections pour le menu
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const [catRes, secRes, settingsRes] = await Promise.all([
          api.get('/products/categories'),
          api.get('/sections'),
          api.get('/settings')
        ]);

        setCategories(Array.isArray(catRes?.data?.data) ? catRes.data.data : []);
        setSections(Array.isArray(secRes?.data?.data) ? secRes.data.data : []);

        if (settingsRes?.data?.data?.advertising_text) {
          setAdvertisingText(settingsRes.data.data.advertising_text);
        }
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
    { label: t('nav.home'), path: "/", type: 'link' },
    ...sections.map(sec => ({
      label: t(`sections.${sec.name.toLowerCase()}`, { defaultValue: sec.name.toUpperCase() }),
      id: sec.id,
      type: 'section'
    })),
    { label: t('nav.offers'), path: "/promotions", type: 'link' },
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
        {advertisingText}
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
                  placeholder={t('nav.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pill-search-input"
                />
                <button type="submit" className="pill-search-btn">
                  SEARCH
                </button>
              </form>
            </div>

            {/* Actions (Compte, Favoris, Panier, Langue) */}
            <div className="header-actions">
              {/* Language switcher */}
              <button
                className="lang-switcher-btn"
                onClick={toggleLanguage}
                title={currentLang === 'fr' ? 'Switch to English' : 'Passer en Français'}
              >
                {currentLang === 'fr' ? 'EN' : 'FR'}
              </button>

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

                  <Link to="/cart" className="icon-btn relative">
                    <ShoppingBag size={20} />
                    {cartCount > 0 && <span className="badge">{cartCount}</span>}
                  </Link>
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
            {/* Mobile language switcher */}
            <button
              className="mobile-nav-link w-full text-left"
              onClick={toggleLanguage}
            >
              {currentLang === 'fr' ? '🇬🇧 English' : '🇫🇷 Français'}
            </button>
            {user && !isAdmin && (
              <Link to="/account" className="mobile-nav-link" onClick={() => setIsMobileOpen(false)}>
                {t('auth.account')}
              </Link>
            )}
            {!user && (
              <button
                className="mobile-nav-link w-full text-left"
                onClick={() => { setIsMobileOpen(false); onLoginClick(); }}
              >
                {t('auth.login')}
              </button>
            )}
          </nav>
        )}
      </header>
    </>
  );
};

export default Header;