import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const AdminLanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Parse lang properly (e.g., handles "en-US" vs "en")
  const currentLang = (i18n.language || 'fr').split('-')[0].toLowerCase();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const switchLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={toggleDropdown}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          background: '#fff',
          border: '1px solid var(--border-light)',
          borderRadius: '12px',
          cursor: 'pointer',
          color: 'var(--primary)',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
        onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
      >
        <Globe size={18} />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
          {currentLang}
        </span>
      </button>

      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            width: '140px',
            background: '#fff',
            border: '1px solid var(--border-light)',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            zIndex: 50,
            overflow: 'hidden'
          }}
        >
          <div style={{ padding: '6px 0' }}>
            <button
              onClick={() => switchLanguage('fr')}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 16px',
                fontSize: '0.85rem',
                border: 'none',
                background: currentLang === 'fr' ? '#f3f4f6' : 'transparent',
                fontWeight: currentLang === 'fr' ? 'bold' : 'normal',
                color: 'var(--primary)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.background = currentLang === 'fr' ? '#f3f4f6' : 'transparent'}
            >
              Français (FR)
            </button>
            <button
              onClick={() => switchLanguage('en')}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 16px',
                fontSize: '0.85rem',
                border: 'none',
                background: currentLang === 'en' ? '#f3f4f6' : 'transparent',
                fontWeight: currentLang === 'en' ? 'bold' : 'normal',
                color: 'var(--primary)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.background = currentLang === 'en' ? '#f3f4f6' : 'transparent'}
            >
              English (EN)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLanguageSwitcher;
