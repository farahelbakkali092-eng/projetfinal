import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ChevronDown,
  HelpCircle,
  Truck,
  RotateCcw,
  ShieldCheck,
  Scale,
  Lock,
  Eye,
  ArrowRight,
} from 'lucide-react';
import './Support.css';

const Support = () => {
  const { hash } = useLocation();
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [hash]);

  const faqs = [
    {
      question: "Quels sont les délais de livraison ?",
      answer:
        "Les délais de livraison varient entre 2 et 5 jours ouvrés selon votre localisation. Vous recevrez un numéro de suivi dès l'expédition de votre commande.",
    },
    {
      question: "Comment puis-je retourner un produit ?",
      answer:
        "Vous disposez de 14 jours après réception pour nous retourner un produit non ouvert. Contactez notre support pour obtenir une étiquette de retour.",
    },
    {
      question: "Les produits sont-ils testés sur les animaux ?",
      answer:
        "Absolument pas. Tous nos produits sont certifiés Cruelty-Free et nous privilégions les ingrédients d'origine naturelle et éthique.",
    },
    {
      question: "Puis-je modifier ma commande après validation ?",
      answer:
        "Une fois validée, une commande est rapidement préparée. Si elle n'a pas encore été expédiée, nous pouvons tenter de la modifier. Contactez-nous au plus vite.",
    },
    {
      question: "Quels modes de paiement acceptez-vous ?",
      answer:
        "Nous acceptons les cartes bancaires (Visa, Mastercard, AMEX), PayPal et Apple Pay.",
    },
  ];

  const navSections = [
    { id: 'faq',      title: 'FAQ',                    icon: <HelpCircle size={15} /> },
    { id: 'livraison',title: 'Livraison & Retours',     icon: <Truck size={15} /> },
    { id: 'cgv',      title: 'Termes & Conditions',     icon: <Scale size={15} /> },
    { id: 'privacy',  title: 'Confidentialité',         icon: <Lock size={15} /> },
  ];

  const toggleFaq = (index) =>
    setOpenFaqIndex(openFaqIndex === index ? null : index);

  return (
    <div className="sp-page">

      {/* ── Sticky header ── */}
      <header className="sp-header">
        <h1>Centre de Support</h1>
        <nav className="sp-nav" aria-label="Sections">
          {navSections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="sp-nav-link">
              {s.icon}
              {s.title}
            </a>
          ))}
        </nav>
      </header>

      {/* ── Page body ── */}
      <main className="sp-content">

        {/* ─── FAQ ─────────────────────────────────────────────── */}
        <section id="faq" className="sp-section">
          <div className="sp-section-header">
            <HelpCircle size={28} />
            <h2>Questions Fréquentes</h2>
          </div>

          <div className="sp-faq-list">
            {faqs.map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div key={i} className="sp-faq-item">
                  <button
                    className="sp-faq-btn"
                    aria-expanded={isOpen}
                    onClick={() => toggleFaq(i)}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown size={18} className="sp-faq-icon" />
                  </button>
                  <div className={`sp-faq-body${isOpen ? ' open' : ''}`}>
                    <p>{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── Delivery & Returns ──────────────────────────────── */}
        <section id="livraison" className="sp-section">
          <div className="sp-section-header">
            <Truck size={28} />
            <h2>Livraison &amp; Retours</h2>
          </div>

          <div className="sp-delivery-grid">
            <div className="sp-card sp-delivery-card">
              <h3><Truck size={18} /> Livraison</h3>
              <ul className="sp-delivery-list">
                <li><ArrowRight size={14} /> Livraison standard (3–5 jours) : 4,90 € (Gratuit dès 50 €)</li>
                <li><ArrowRight size={14} /> Livraison Express (24–48 h) : 9,90 €</li>
                <li><ArrowRight size={14} /> Expédition sous 24 h pour les commandes avant midi</li>
              </ul>
            </div>

            <div className="sp-card sp-delivery-card">
              <h3><RotateCcw size={18} /> Retours</h3>
              <ul className="sp-delivery-list">
                <li><ArrowRight size={14} /> Délai de rétractation de 14 jours</li>
                <li><ArrowRight size={14} /> Produits intacts et emballage d'origine requis</li>
                <li><ArrowRight size={14} /> Remboursement sous 7 jours après réception</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ─── Terms & Conditions ──────────────────────────────── */}
        <section id="cgv" className="sp-section">
          <div className="sp-section-header">
            <Scale size={28} />
            <h2>Termes &amp; Conditions</h2>
          </div>

          <div className="sp-card sp-terms-card">
            <div className="sp-terms-article">
              <h3>1. Objet des Services</h3>
              <p>Les présentes CGV régissent l'ensemble des relations entre DAWSM et ses clients. Toute commande sur le site implique l'adhésion totale à ces conditions.</p>
            </div>
            <div className="sp-terms-article">
              <h3>2. Produits et Tarification</h3>
              <p>Nos produits sont décrits avec la plus grande précision. Les prix sont TTC en euros. DAWSM se réserve le droit de modifier ses prix, mais applique le tarif au moment de la commande.</p>
            </div>
            <div className="sp-terms-article">
              <h3>3. Sécurité des Transactions</h3>
              <p>Le paiement s'effectue via des passerelles sécurisées (Stripe, PayPal). Aucune donnée bancaire n'est stockée sur nos serveurs.</p>
            </div>
          </div>
        </section>

        {/* ─── Privacy ─────────────────────────────────────────── */}
        <section id="privacy" className="sp-section">
          <div className="sp-section-header">
            <Lock size={28} />
            <h2>Confidentialité</h2>
          </div>

          <div className="sp-privacy-list">
            <div className="sp-card sp-privacy-card">
              <Eye size={36} />
              <div>
                <h3>Transparence des données</h3>
                <p>Nous collectons uniquement les informations nécessaires au traitement de vos commandes et à la personnalisation de votre diagnostic. Vos données ne sont jamais vendues.</p>
              </div>
            </div>

            <div className="sp-card sp-privacy-card">
              <ShieldCheck size={36} />
              <div>
                <h3>Conformité RGPD</h3>
                <p>Vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles à tout moment via votre espace client ou par email.</p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Support;