import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import FormError from '../../components/FormError';
import { useCart } from '../../context/CartContext';

import './Routine.css';

const Routine = () => {
  const { t, i18n } = useTranslation();
  // Récupération de la fonction d'ajout au panier depuis le contexte
  const { addToCart } = useCart();
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

  // Nouveaux états pour l'IA
  const [recommendations, setRecommendations] = useState([]);
  const [iaError, setIaError] = useState('');

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

    if (!formData.nom.trim()) newErrors.nom = t('errors.lastNameRequired') || "Le nom est requis.";
    if (!formData.prenom.trim()) newErrors.prenom = t('errors.firstNameRequired') || "Le prénom est requis.";
    if (!formData.age) newErrors.age = t('errors.ageRequired') || "L'âge est requis.";
    else if (formData.age < 12 || formData.age > 120) newErrors.age = t('errors.ageInvalid') || "Âge invalide.";

    if (!formData.email.trim()) newErrors.email = t('errors.emailRequired') || "L'email est requis.";
    else if (!emailRegex.test(formData.email)) newErrors.email = t('errors.emailInvalid') || "Format invalide.";

    if (!formData.type_peau) newErrors.type_peau = t('errors.skinTypeRequired') || "Sélectionnez un type de peau.";
    if (formData.problematiques.length === 0) newErrors.problematiques = t('errors.optionsRequired') || "Choisissez au moins une option.";
    if (formData.preferences.length === 0) newErrors.preferences = t('errors.optionsRequired') || "Choisissez au moins une option.";
    if (!formData.budget.toString().trim()) newErrors.budget = t('errors.budgetRequired') || "Le budget est requis.";
    else if (isNaN(Number(formData.budget)) || Number(formData.budget) <= 0) newErrors.budget = t('errors.budgetInvalid') || "Entrez un budget valide (ex: 200).";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Soumission vers Laravel ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setRecommendations([]);
    setIaError('');

    try {
      // 1. Sauvegarder le diagnostic en BDD
      await api.post('/diagnostic', formData);

      // 2. Interroger le microservice IA via Laravel
      const iaResponse = await api.post('/routine/recommend', formData);
      const responseData = iaResponse.data;

      // Le backend utilise ApiResponseTrait pour le succès (returnData={"status": "success", "data": {"recommendations": []}})
      // mais renvoie parfois un JSON direct pour le cas sans produits (returnData={"success": false, "message": "..."})
      const isSuccess = responseData.status === 'success' || responseData.success === true;
      const routineData = responseData.data || responseData;

      if (isSuccess && routineData.recommendations) {
        setRecommendations(routineData.recommendations);
        toast.success(i18n.language === 'fr' ? "Votre routine est prête !" : "Your routine is ready!");
      } else {
        // Cas : l'IA a répondu mais sans produits adaptés (success: false, HTTP 200)
        setIaError(responseData.message || routineData.message || (i18n.language === 'fr' ? "Aucun produit skincare adapté à votre profil pour le moment." : "No suitable skincare products found for your profile."));
      }

    } catch (error) {
      console.error(error);
      const status = error.response?.status;
      if (status === 422) {
        // Erreurs de validation Laravel
        setErrors(error.response.data.errors ?? {});
      } else if (status === 503) {
        setIaError(
          i18n.language === 'fr'
            ? "Le service IA est temporairement indisponible. Veuillez réessayer."
            : "The AI service is temporarily unavailable. Please try again."
        );
      } else {
        setIaError(
          error.response?.data?.data?.message ||
          error.response?.data?.message ||
          error.message ||
          (t('routine.aiErrorGeneric') || "Une erreur est survenue lors de l'appel à l'IA.")
        );
      }
    } finally {
      setLoading(false);
    }
  };


  // --- Données ---
  const skinTypes = [
    { key: 'dry', label: t('routine.dry') },
    { key: 'normal', label: t('routine.normal') },
    { key: 'combo', label: t('routine.combo') },
    { key: 'oily', label: t('routine.oily') }
  ];
  const concernsList = [
    t('routine.concern1') || 'Acné & Imperfections', 
    t('routine.concern2') || 'Rides & Âge', 
    t('routine.concern3') || 'Taches Pigmentaires', 
    t('routine.concern4') || 'Déshydratation', 
    t('routine.concern5') || 'Rougeurs', 
    t('routine.concern6') || 'Pores Dilatés'
  ];
  const preferencesList = [
    t('routine.pref1') || 'Bio / Naturel', 
    t('routine.pref2') || 'Vegan', 
    t('routine.pref3') || 'Made in France', 
    t('routine.pref4') || 'Sans Parfum', 
    t('routine.pref5') || 'Minimaliste'
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
          <FormError error={errors.general} />
          <form className="routine-form" onSubmit={handleSubmit}>

            {/* SECTION 1: PROFIL */}
            <div className="form-section">
              <h3 className="section-title"><span>01.</span> {t('routine.profile')}</h3>
              <div className="form-row">
                <div className="input-group">
                  <input type="text" id="nom" placeholder=" " value={formData.nom} onChange={handleInputChange} className={errors.nom ? 'input-error' : ''} />
                  <label htmlFor="nom">{t('routine.nom')}</label>
                  <div className="underline"></div>
                  <FormError error={errors.nom} />
                </div>
                <div className="input-group">
                  <input type="text" id="prenom" placeholder=" " value={formData.prenom} onChange={handleInputChange} className={errors.prenom ? 'input-error' : ''} />
                  <label htmlFor="prenom">{t('routine.prenom')}</label>
                  <div className="underline"></div>
                  <FormError error={errors.prenom} />
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <input type="number" id="age" placeholder=" " value={formData.age} onChange={handleInputChange} className={errors.age ? 'input-error' : ''} />
                  <label htmlFor="age">{t('routine.age')}</label>
                  <div className="underline"></div>
                  <FormError error={errors.age} />
                </div>
                <div className="input-group">
                  <input type="email" id="email" placeholder=" " value={formData.email} onChange={handleInputChange} className={errors.email ? 'input-error' : ''} />
                  <label htmlFor="email">{t('routine.email')}</label>
                  <div className="underline"></div>
                  <FormError error={errors.email} />
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
              <FormError error={errors.type_peau} />
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
              <FormError error={errors.problematiques} />
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
              <FormError error={errors.preferences} />
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
                <FormError error={errors.budget} />
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

        {/* --- SECTION DES RÉSULTATS IA --- */}
        {loading && (
          <div className="reco-loading">
            <div className="loader-spinner"></div>
            <p>{t('routine.generating') || "Notre IA génère votre routine sur-mesure..."}</p>
          </div>
        )}

        {iaError && !loading && (
          <div className="reco-error">
            <p>{iaError}</p>
          </div>
        )}

        {recommendations.length > 0 && !loading && (
          <section className="recommendations-section">
            <div className="reco-header">
              <h3>{t('routine.customRoutineTitle') || "Votre Routine Personnalisée"}</h3>
              <p>{t('routine.customRoutineSubtitle') || "Sélectionnée par notre intelligence artificielle"}</p>
            </div>

            <div className="reco-grid">
              {recommendations.map((product, index) => (
                <div key={product.id} className="reco-card" style={{ animationDelay: `${index * 0.15}s` }}>
                  <div className="reco-badge">{t('routine.step') || "Étape"} {index + 1}</div>
                  <div className="reco-image-wrapper">
                    <img src={product.image} alt={product.nom} className="reco-image" />
                  </div>
                  <div className="reco-content">
                    <h4>{product.nom}</h4>
                    <p className="reco-desc">{product.description}</p>
                    <div className="reco-footer">
                      <span className="reco-price">{Number(product.prix).toFixed(2)} dhs</span>
                      <button
                        className="btn-add-cart"
                        onClick={() => addToCart({
                          id: product.id,
                          name: product.nom,
                          price: product.prix,
                          image: product.image,
                          quantity: 1
                        })}
                      >
                        {t('routine.addButton') || "Ajouter"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Routine;