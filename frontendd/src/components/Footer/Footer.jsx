import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="footer">
      {/* Decorative top divider */}
      <div className="footer-divider">
        <span className="divider-line" />
        <span className="divider-ornament">✦</span>
        <span className="divider-line" />
      </div>

      <div className="footer-inner">

        {/* ── Brand Block ── */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo-group">
            <div className="footer-logo-text">
              <span>D</span><span>A</span><span>W</span><span>S</span><span>M</span>
            </div>
          </Link>
          <p className="footer-tagline">
            L'art de la beauté raffinée,<br />cultivé au cœur du Maroc.
          </p>
          <div className="footer-socials">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-link" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-link" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="social-link" aria-label="TikTok">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
              </svg>
            </a>
          </div>
        </div>

        {/* ── Navigation Columns ── */}
        <div className="footer-columns">

          <div className="footer-col">
            <h4 className="footer-col-heading">
              <span>Navigation</span>
            </h4>
            <ul className="footer-col-list">
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/promotions">Promotions</Link></li>
              <li><Link to="/#brands">Nos Marques</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-heading">
              <span>Support</span>
            </h4>
            <ul className="footer-col-list">
              <li><Link to="/faq#faq">FAQ</Link></li>
              <li><Link to="/livraison#livraison">Livraison & Retours</Link></li>
              <li><Link to="/cgv#cgv">Termes & Conditions</Link></li>
              <li><Link to="/privacy#privacy">Confidentialité</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-heading">
              <span>Contact</span>
            </h4>
            <ul className="footer-col-list contact-list">
              <li>
                <a href="mailto:dawsmcosmetiques@gmail.com">
                  dawsmcosmetiques@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+212677128184">+212 677-128184</a>
              </li>
              <li className="location-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                Maroc
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* ── Bottom Bar ── */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span className="footer-copyright">
            © {new Date().getFullYear()} DAWSM Cosmétiques. Tous droits réservés.
          </span>
          <div className="footer-bottom-badges">
            <span className="badge-item">✦ Livraison Maroc</span>
            <span className="badge-sep">·</span>
            <span className="badge-item">✦ Paiement Sécurisé</span>
            <span className="badge-sep">·</span>
            <span className="badge-item">✦ Produits Authentiques</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;