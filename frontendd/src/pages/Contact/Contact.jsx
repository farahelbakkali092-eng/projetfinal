import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios'; // ⚠️ MODIFIÉ: On utilise 'api' au lieu de 'axiosClient'
import './Contact.css';

const Contact = () => {
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
      newErrors.name = "Le nom est obligatoire.";
    } else if (!nameRegex.test(formData.name)) {
      newErrors.name = "Nom invalide.";
    }

    if (!formData.email.trim()) {
       newErrors.email = "L'email est obligatoire.";
    } else if (!emailRegex.test(formData.email)) {
       newErrors.email = "Email invalide.";
    }

    if (!formData.subject.trim()) newErrors.subject = "Le sujet est obligatoire.";
    if (!formData.message.trim()) newErrors.message = "Le message est obligatoire.";

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
      toast.success('Votre message a bien été envoyé !');
      setFormData({ name: '', email: '', subject: '', message: '' }); // On vide le formulaire
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setLoading(false);
    }
  };

  const errorMsgStyle = { color: 'red', fontSize: '12px', marginTop: '5px', display: 'block' };

  return (
    <div className="contact-page container">
      <main className="contact-main">
        <section className="contact-form-section">
          <h2>Contactez-nous</h2>
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
                <label htmlFor="name">Nom complet</label>
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
                <label htmlFor="email">Adresse Email</label>
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
              <label htmlFor="subject">Sujet de votre demande</label>
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
              <label htmlFor="message">Votre Message</label>
              <div className="underline"></div>
              {errors.message && <span style={errorMsgStyle}>{errors.message}</span>}
            </div>

            <button type="submit" className="btn-luxury" disabled={loading}>
              <span>{loading ? "Envoi..." : "Envoyer le message"}</span>
              <div className="shine"></div>
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Contact;