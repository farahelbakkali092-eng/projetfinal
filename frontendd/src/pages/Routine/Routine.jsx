import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

import './Routine.css';

const Routine = () => {
  // --- État initial ---
  const [formData, setFormData] = useState({
    prenom: '',
    age: '',
    email: '',
    type_peau: '',
    problematiques: [],
    preferences: [],
    budget: ''
  });

  // État pour la validation et le chargement
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // --- Gestionnaires d'input ---
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    
    // Nettoyer toutes les erreurs du champ quand l'utilisateur tape
    if (errors[id]) {
      const newErrors = { ...errors };
      delete newErrors[id];
      setErrors(newErrors);
    }
  };

  const handleSingleSelect = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleMultiSelect = (name, value) => {
    setFormData(prev => {
      const currentArray = prev[name];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      if (errors[name] && newArray.length > 0) {
        const newErrors = { ...errors };
        delete newErrors[name];
        setErrors(newErrors);
      }
      return { ...prev, [name]: newArray };
    });
  };

  // --- Validation Frontend ---
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis.";
    if (!formData.age) newErrors.age = "L'âge est requis.";
    else if (formData.age < 12 || formData.age > 120) newErrors.age = "Âge invalide.";
    
    if (!formData.email.trim()) newErrors.email = "L'email est requis.";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Format invalide.";

    if (!formData.type_peau) newErrors.type_peau = "Sélectionnez un type de peau.";
    if (formData.problematiques.length === 0) newErrors.problematiques = "Choisissez au moins une option.";
    if (formData.preferences.length === 0) newErrors.preferences = "Choisissez au moins une option.";
    if (!formData.budget) newErrors.budget = "Le budget est requis.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Soumission vers Laravel ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Veuillez compléter le formulaire correctement.");
      return;
    }

    setLoading(true);

    try {
      // Route vers ton controller DiagnosticController.php
      await axiosClient.post('/diagnostic', formData);
      
      toast.success("Demande envoyée ! Nos experts reviennent vers vous.");
      
      // Reset du formulaire
      setFormData({
        prenom: '', age: '', email: '', type_peau: '',
        problematiques: [], preferences: [], budget: ''
      });
      setErrors({});

    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 422) {
        // Gestion des erreurs Laravel (Validation Backend)
        setErrors(error.response.data.errors);
        toast.error("Veuillez vérifier les informations saisies.");
      } else {
        toast.error("Une erreur est survenue lors de l'envoi.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Composant helper pour afficher les erreurs ---
  const ErrorMsg = ({ name }) => {
    const fieldErrors = errors[name];
    if (!fieldErrors) return null;

    // S'assurer que fieldErrors est un tableau (Laravel envoie des tableaux, validation locale peut envoyer des strings)
    const errorList = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];

    return (
      <div className="mt-1 flex flex-col gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
        {errorList.map((msg, index) => (
          <div key={index} className="flex items-center gap-1.5 text-rose-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span className="text-[11px] font-medium leading-tight tracking-wide uppercase italic">{msg}</span>
          </div>
        ))}
      </div>
    );
  };

  // --- Données ---
  const skinTypes = ['Sèche', 'Normale', 'Mixte', 'Grasse'];
  const concernsList = ['Acné & Imperfections', 'Rides & Âge', 'Taches Pigmentaires', 'Déshydratation', 'Rougeurs', 'Pores Dilatés'];
  const preferencesList = ['Bio / Naturel', 'Vegan', 'Made in France', 'Sans Parfum', 'Minimaliste'];
  const budgetList = [
    { value: 'eco', label: 'Essentiel (< 50€)' },
    { value: 'premium', label: 'Premium (50-100€)' },
    { value: 'luxe', label: 'Luxe (> 100€)' }
  ];

  return (
    <div className="routine-page">
      <main className="routine-main">
        <section className="routine-card">

          <div className="routine-header">
            <span className="subtitle">Diagnostic Personnalisé</span>
            <h2>Votre Routine <span className="text-gradient">Sur-Mesure</span></h2>
            <p className="description">
              Répondez à ces questions pour laisser nos experts composer votre rituel idéal.
            </p>
          </div>

          <form className="routine-form" onSubmit={handleSubmit}>

            {/* SECTION 1: PROFIL */}
            <div className="form-section">
              <h3 className="section-title"><span>01.</span> Votre Profil</h3>
              <div className="form-row">
                <div className="input-group">
                  <input type="text" id="prenom" placeholder=" " value={formData.prenom} onChange={handleInputChange} className={errors.prenom ? 'input-error' : ''} />
                  <label htmlFor="prenom">Prénom</label>
                  <div className="underline"></div>
                  <ErrorMsg name="prenom" />
                </div>
                <div className="input-group">
                  <input type="number" id="age" placeholder=" " value={formData.age} onChange={handleInputChange} className={errors.age ? 'input-error' : ''} />
                  <label htmlFor="age">Âge</label>
                  <div className="underline"></div>
                  <ErrorMsg name="age" />
                </div>
              </div>
              <div className="input-group">
                <input type="email" id="email" placeholder=" " value={formData.email} onChange={handleInputChange} className={errors.email ? 'input-error' : ''} />
                <label htmlFor="email">Adresse Email</label>
                <div className="underline"></div>
                <ErrorMsg name="email" />
              </div>
            </div>

            {/* SECTION 2: TYPE DE PEAU */}
            <div className="form-section">
              <h3 className="section-title"><span>02.</span> Type de Peau <span className="required-star">*</span></h3>
              <div className="selection-grid">
                {skinTypes.map(type => (
                  <button key={type} type="button" 
                    className={`selection-btn ${formData.type_peau === type ? 'active' : ''} ${errors.type_peau ? 'btn-error' : ''}`}
                    onClick={() => handleSingleSelect('type_peau', type)}>
                    {type}
                  </button>
                ))}
              </div>
              <ErrorMsg name="type_peau" />
            </div>

            {/* SECTION 3: PRÉOCCUPATIONS */}
            <div className="form-section">
              <h3 className="section-title"><span>03.</span> Vos Préoccupations <span className="required-star">*</span></h3>
              <div className="chips-container">
                {concernsList.map(item => (
                  <div key={item} 
                    className={`luxury-chip ${formData.problematiques.includes(item) ? 'active' : ''} ${errors.problematiques ? 'chip-error' : ''}`}
                    onClick={() => handleMultiSelect('problematiques', item)}>
                    {item}
                  </div>
                ))}
              </div>
              <ErrorMsg name="problematiques" />
            </div>

            {/* SECTION 4: PRÉFÉRENCES */}
            <div className="form-section">
              <h3 className="section-title"><span>04.</span> Préférences <span className="required-star">*</span></h3>
              <div className="chips-container">
                {preferencesList.map(pref => (
                  <div key={pref} 
                    className={`luxury-chip ${formData.preferences.includes(pref) ? 'active' : ''} ${errors.preferences ? 'chip-error' : ''}`}
                    onClick={() => handleMultiSelect('preferences', pref)}>
                    {pref}
                  </div>
                ))}
              </div>
              <ErrorMsg name="preferences" />
            </div>

            {/* SECTION 5: BUDGET */}
            <div className="form-section">
              <h3 className="section-title"><span>05.</span> Votre Budget <span className="required-star">*</span></h3>
              <div className="budget-grid">
                {budgetList.map(opt => (
                  <div key={opt.value} 
                    className={`budget-card ${formData.budget === opt.value ? 'active' : ''} ${errors.budget ? 'card-error' : ''}`}
                    onClick={() => handleSingleSelect('budget', opt.value)}>
                    <span className="budget-label">{opt.label}</span>
                  </div>
                ))}
              </div>
              <ErrorMsg name="budget" />
            </div>

            <div className="submit-container">
              <button type="submit" className="btn-luxury" disabled={loading}>
                <span>{loading ? "Analyse en cours..." : "Obtenir ma Routine"}</span>
                <div className="shine"></div>
              </button>
            </div>

          </form>
        </section>
      </main>
    </div>
  );
};

export default Routine;