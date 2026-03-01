import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';

import './Routine.css';

const Routine = () => {
  const { t, i18n } = useTranslation();
  // --- État initial ---
  const [formData, setFormData] = useState({
    nom: '',
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

    if (!formData.nom.trim()) newErrors.nom = i18n.language === 'fr' ? "Le nom est requis." : "Last name is required.";
    if (!formData.prenom.trim()) newErrors.prenom = i18n.language === 'fr' ? "Le prénom est requis." : "First name is required.";
    if (!formData.age) newErrors.age = i18n.language === 'fr' ? "L'âge est requis." : "Age is required.";
    else if (formData.age < 12 || formData.age > 120) newErrors.age = i18n.language === 'fr' ? "Âge invalide." : "Invalid age.";

    if (!formData.email.trim()) newErrors.email = i18n.language === 'fr' ? "L'email est requis." : "Email is required.";
    else if (!emailRegex.test(formData.email)) newErrors.email = i18n.language === 'fr' ? "Format invalide." : "Invalid format.";

    if (!formData.type_peau) newErrors.type_peau = i18n.language === 'fr' ? "Sélectionnez un type de peau." : "Select a skin type.";
    if (formData.problematiques.length === 0) newErrors.problematiques = i18n.language === 'fr' ? "Choisissez au moins une option." : "Choose at least one option.";
    if (formData.preferences.length === 0) newErrors.preferences = i18n.language === 'fr' ? "Choisissez au moins une option." : "Choose at least one option.";
    if (!formData.budget.toString().trim()) newErrors.budget = i18n.language === 'fr' ? "Le budget est requis." : "Budget is required.";
    else if (isNaN(Number(formData.budget)) || Number(formData.budget) <= 0) newErrors.budget = i18n.language === 'fr' ? "Entrez un budget valide (ex: 200)." : "Enter a valid budget (e.g. 200).";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Soumission vers Laravel ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(i18n.language === 'fr' ? "Veuillez compléter le formulaire correctement." : "Please complete the form correctly.");
      return;
    }

    setLoading(true);

    try {
      // Route vers ton controller DiagnosticController.php
      await api.post('/diagnostic', formData);

      toast.success(t('routine.successMsg'));

      // Reset du formulaire
      setFormData({
        nom: '', prenom: '', age: '', email: '', type_peau: '',
        problematiques: [], preferences: [], budget: ''
      });
      setErrors({});

    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 422) {
        // Gestion des erreurs Laravel (Validation Backend)
        setErrors(error.response.data.errors);
        toast.error(i18n.language === 'fr' ? "Veuillez vérifier les informations saisies." : "Please check the entered information.");
      } else {
        toast.error(i18n.language === 'fr' ? "Une erreur est survenue lors de l'envoi." : "An error occurred during sending.");
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
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            <span className="text-[11px] font-medium leading-tight tracking-wide uppercase italic">{msg}</span>
          </div>
        ))}
      </div>
    );
  };

  // --- Données ---
  const skinTypes = [
    { key: 'dry', label: t('routine.dry') },
    { key: 'normal', label: t('routine.normal') },
    { key: 'combo', label: t('routine.combo') },
    { key: 'oily', label: t('routine.oily') }
  ];
  const concernsList = [
    'Acné & Imperfections', 'Rides & Âge', 'Taches Pigmentaires', 'Déshydratation', 'Rougeurs', 'Pores Dilatés'
  ];
  const preferencesList = [
    'Bio / Naturel', 'Vegan', 'Made in France', 'Sans Parfum', 'Minimaliste'
  ];

  return (
    <div className="routine-page">
      <main className="routine-main">
        <section className="routine-card">

          <div className="routine-header">
            <span className="subtitle">{t('routine.subtitle')}</span>
            <h2>{t('routine.title')} <span className="text-gradient">{t('routine.titleGradient')}</span></h2>
            <p className="description">
              {t('routine.desc')}
            </p>
          </div>

          <form className="routine-form" onSubmit={handleSubmit}>

            {/* SECTION 1: PROFIL */}
            <div className="form-section">
              <h3 className="section-title"><span>01.</span> {t('routine.profile')}</h3>
              <div className="form-row">
                <div className="input-group">
                  <input type="text" id="nom" placeholder=" " value={formData.nom} onChange={handleInputChange} className={errors.nom ? 'input-error' : ''} />
                  <label htmlFor="nom">{t('routine.nom')}</label>
                  <div className="underline"></div>
                  <ErrorMsg name="nom" />
                </div>
                <div className="input-group">
                  <input type="text" id="prenom" placeholder=" " value={formData.prenom} onChange={handleInputChange} className={errors.prenom ? 'input-error' : ''} />
                  <label htmlFor="prenom">{t('routine.prenom')}</label>
                  <div className="underline"></div>
                  <ErrorMsg name="prenom" />
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <input type="number" id="age" placeholder=" " value={formData.age} onChange={handleInputChange} className={errors.age ? 'input-error' : ''} />
                  <label htmlFor="age">{t('routine.age')}</label>
                  <div className="underline"></div>
                  <ErrorMsg name="age" />
                </div>
                <div className="input-group">
                  <input type="email" id="email" placeholder=" " value={formData.email} onChange={handleInputChange} className={errors.email ? 'input-error' : ''} />
                  <label htmlFor="email">{t('routine.email')}</label>
                  <div className="underline"></div>
                  <ErrorMsg name="email" />
                </div>
              </div>
            </div>

            {/* SECTION 2: TYPE DE PEAU */}
            <div className="form-section">
              <h3 className="section-title"><span>02.</span> {t('routine.skinType')} <span className="required-star">*</span></h3>
              <div className="selection-grid">
                {skinTypes.map(type => (
                  <button key={type.key} type="button"
                    className={`selection-btn ${formData.type_peau === type.label ? 'active' : ''} ${errors.type_peau ? 'btn-error' : ''}`}
                    onClick={() => handleSingleSelect('type_peau', type.label)}>
                    {type.label}
                  </button>
                ))}
              </div>
              <ErrorMsg name="type_peau" />
            </div>

            {/* SECTION 3: PRÉOCCUPATIONS */}
            <div className="form-section">
              <h3 className="section-title"><span>03.</span> {t('routine.concerns')} <span className="required-star">*</span></h3>
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
              <h3 className="section-title"><span>04.</span> {t('routine.preferences')} <span className="required-star">*</span></h3>
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
              <h3 className="section-title"><span>05.</span> {t('routine.budget')} <span className="required-star">*</span></h3>
              <div className="input-group">
                <input
                  type="number"
                  id="budget"
                  placeholder=" "
                  min="1"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className={errors.budget ? 'input-error' : ''}
                />
                <label htmlFor="budget">{t('routine.budgetPlaceholder')}</label>
                <div className="underline"></div>
                <ErrorMsg name="budget" />
              </div>
            </div>

            <div className="submit-container">
              <button type="submit" className="btn-luxury" disabled={loading}>
                <span>{loading ? t('routine.loading') : t('routine.submit')}</span>
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