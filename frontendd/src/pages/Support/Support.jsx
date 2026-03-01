import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
    { question: t('support.faq1q'), answer: t('support.faq1a') },
    { question: t('support.faq2q'), answer: t('support.faq2a') },
    { question: t('support.faq3q'), answer: t('support.faq3a') },
    { question: t('support.faq4q'), answer: t('support.faq4a') },
    { question: t('support.faq5q'), answer: t('support.faq5a') },
  ];

  const navSections = [
    { id: 'faq', title: t('support.faq'), icon: <HelpCircle size={15} /> },
    { id: 'livraison', title: t('support.deliveryNav'), icon: <Truck size={15} /> },
    { id: 'cgv', title: t('support.termsNav'), icon: <Scale size={15} /> },
    { id: 'privacy', title: t('support.privacyNav'), icon: <Lock size={15} /> },
  ];

  const toggleFaq = (index) =>
    setOpenFaqIndex(openFaqIndex === index ? null : index);

  return (
    <div className="sp-page">

      {/* ── Sticky header ── */}
      <header className="sp-header">
        <h1>{t('support.pageTitle')}</h1>
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
            <h2>{t('support.faqTitle')}</h2>
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
            <h2>{t('support.deliveryTitle')}</h2>
          </div>

          <div className="sp-delivery-grid">
            <div className="sp-card sp-delivery-card">
              <h3><Truck size={18} /> {t('support.deliveryLabel')}</h3>
              <ul className="sp-delivery-list">
                <li><ArrowRight size={14} /> {t('support.delivery1')}</li>
                <li><ArrowRight size={14} /> {t('support.delivery2')}</li>
                <li><ArrowRight size={14} /> {t('support.delivery3')}</li>
              </ul>
            </div>

            <div className="sp-card sp-delivery-card">
              <h3><RotateCcw size={18} /> {t('support.returnsLabel')}</h3>
              <ul className="sp-delivery-list">
                <li><ArrowRight size={14} /> {t('support.returns1')}</li>
                <li><ArrowRight size={14} /> {t('support.returns2')}</li>
                <li><ArrowRight size={14} /> {t('support.returns3')}</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ─── Terms & Conditions ──────────────────────────────── */}
        <section id="cgv" className="sp-section">
          <div className="sp-section-header">
            <Scale size={28} />
            <h2>{t('support.termsTitle')}</h2>
          </div>

          <div className="sp-card sp-terms-card">
            <div className="sp-terms-article">
              <h3>{t('support.terms1title')}</h3>
              <p>{t('support.terms1')}</p>
            </div>
            <div className="sp-terms-article">
              <h3>{t('support.terms2title')}</h3>
              <p>{t('support.terms2')}</p>
            </div>
            <div className="sp-terms-article">
              <h3>{t('support.terms3title')}</h3>
              <p>{t('support.terms3')}</p>
            </div>
          </div>
        </section>

        {/* ─── Privacy ─────────────────────────────────────────── */}
        <section id="privacy" className="sp-section">
          <div className="sp-section-header">
            <Lock size={28} />
            <h2>{t('support.privacyTitle')}</h2>
          </div>

          <div className="sp-privacy-list">
            <div className="sp-card sp-privacy-card">
              <Eye size={36} />
              <div>
                <h3>{t('support.privacy1title')}</h3>
                <p>{t('support.privacy1')}</p>
              </div>
            </div>

            <div className="sp-card sp-privacy-card">
              <ShieldCheck size={36} />
              <div>
                <h3>{t('support.privacy2title')}</h3>
                <p>{t('support.privacy2')}</p>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Support;