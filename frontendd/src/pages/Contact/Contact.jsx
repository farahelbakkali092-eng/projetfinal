import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import './Contact.css';

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });

    if (errors[id]) {
      setErrors({ ...errors, [id]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[a-zA-Z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      newErrors.name = t('contact.name') + " " + (i18n.language === 'fr' ? 'est obligatoire' : 'is required');
    } else if (!nameRegex.test(formData.name)) {
      newErrors.name = i18n.language === 'fr' ? 'Nom invalide' : 'Invalid name';
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contact.email') + " " + (i18n.language === 'fr' ? 'est obligatoire' : 'is required');
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = i18n.language === 'fr' ? 'Email invalide' : 'Invalid email';
    }

    if (!formData.subject.trim()) newErrors.subject = i18n.language === 'fr' ? 'Sujet obligatoire' : 'Subject required';
    if (!formData.message.trim()) newErrors.message = i18n.language === 'fr' ? 'Message obligatoire' : 'Message required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ⚠️ NOUVELLE FONCTION: Envoi des données à Laravel
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await api.post('/contact/messages', formData);
      toast.success(i18n.language === 'fr' ? 'Votre message a bien été envoyé !' : 'Your message has been sent!');
      setFormData({ name: '', email: '', subject: '', message: '' }); // On vide le formulaire
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const errorMsgStyle = { color: 'red', fontSize: '12px', marginTop: '5px', display: 'block' };

  return (
    <div className="contact-page container">
      <main className="contact-main">
        <section className="contact-form-section">
          <h2>{t('contact.title')}</h2>
          {/* ⚠️ MODIFIÉ: Ajout de onSubmit={handleSubmit} */}
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="input-group">
                <input
                  type="text"
                  id="name"
                  placeholder=" "
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? "input-error" : ""}
                />
                <label htmlFor="name">{t('contact.name')}</label>
                <div className="underline"></div>
                {errors.name && <span style={errorMsgStyle}>{errors.name}</span>}
              </div>

              <div className="input-group">
                <input
                  type="email"
                  id="email"
                  placeholder=" "
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "input-error" : ""}
                />
                <label htmlFor="email">{t('contact.email')}</label>
                <div className="underline"></div>
                {errors.email && <span style={errorMsgStyle}>{errors.email}</span>}
              </div>
            </div>

            <div className="input-group">
              <input
                type="text"
                id="subject"
                placeholder=" "
                value={formData.subject}
                onChange={handleChange}
                className={errors.subject ? "input-error" : ""}
              />
              <label htmlFor="subject">{t('contact.subject')}</label>
              <div className="underline"></div>
              {errors.subject && <span style={errorMsgStyle}>{errors.subject}</span>}
            </div>

            <div className="input-group">
              <textarea
                id="message"
                rows="4"
                placeholder=" "
                value={formData.message}
                onChange={handleChange}
                className={errors.message ? "input-error" : ""}
              ></textarea>
              <label htmlFor="message">{t('contact.message')}</label>
              <div className="underline"></div>
              {errors.message && <span style={errorMsgStyle}>{errors.message}</span>}
            </div>

            <button type="submit" className="btn-luxury" disabled={loading}>
              <span>{loading ? t('contact.sending') : t('contact.send')}</span>
              <div className="shine"></div>
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Contact;