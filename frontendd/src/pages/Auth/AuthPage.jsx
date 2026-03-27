import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import FormError from '../../components/FormError';
import './AuthPage.css';

const AuthPage = ({ isOpen, onClose, initialView = 'signin' }) => {
  const { login, register, forgotPassword, loading } = useAuth();
  const [view, setView] = useState(initialView);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: ''
  });

  const content = {
    signin: { title: 'Bon retour', btn: 'Se connecter' },
    signup: { title: 'Créer un compte', btn: 'S\'inscrire' },
    forgot: { title: 'Mot de passe oublié', btn: 'Envoyer le lien' }
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthLabels = ['', 'Faible', 'Moyen', 'Fort', 'Très fort'];
  const strengthColors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
  const strength = getPasswordStrength(formData.password);

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setIsAnimating(true);
      setShowPassword(false);
      setShowConfirmPassword(false);
      setFormData({ first_name: '', last_name: '', email: '', phone: '', password: '', password_confirmation: '' });
      setErrors({});
    }
  }, [isOpen, initialView]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => onClose(), 300);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    let res = null;

    if (view === 'signin') {
      res = await login(formData.email, formData.password);
      if (res.success) handleClose();
      else if (res.errors) setErrors(res.errors);
    } else if (view === 'signup') {
      if (formData.password !== formData.password_confirmation) {
        setErrors({ password_confirmation: ["Les mots de passe ne correspondent pas"] });
        return;
      }
      res = await register(formData);
      if (res.success) handleClose();
      else if (res.errors) setErrors(res.errors);
    } else if (view === 'forgot') {
      res = await forgotPassword(formData.email);
      if (res.success) setView('signin');
      else if (res.errors) setErrors(res.errors);
    }
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div className={`auth-overlay ${isAnimating ? 'visible' : 'hidden'}`}>
      <div className="auth-card">
        <button onClick={handleClose} className="btn-close"><X size={20} /></button>

        <div className="auth-header">
          <h2>{content[view].title}</h2>
          <p>
            {view === 'signin' && "Veuillez entrer vos identifiants."}
            {view === 'signup' && "Rejoignez l'expérience DAWSM."}
            {view === 'forgot' && "Entrez votre email pour réinitialiser votre mot de passe."}
          </p>
        </div>

        <div style={{ padding: '0 30px' }}><FormError error={errors.general} /></div>

        <form onSubmit={handleSubmit} className="auth-form">
          {view === 'signup' && (
            <div className="form-group-row">
              <div className="form-group">
                <input type="text" name="first_name" placeholder="Prénom" value={formData.first_name} onChange={handleChange} required />
                <FormError error={errors.first_name} />
              </div>
              <div className="form-group">
                <input type="text" name="last_name" placeholder="Nom" value={formData.last_name} onChange={handleChange} required />
                <FormError error={errors.last_name} />
              </div>
            </div>
          )}

          <div className="form-group">
            <input type="email" name="email" placeholder="Adresse email" value={formData.email} onChange={handleChange} required />
            <FormError error={errors.email} />
          </div>

          {view === 'signup' && (
            <div className="form-group">
              <input type="tel" name="phone" placeholder="Téléphone (optionnel)" value={formData.phone} onChange={handleChange} />
              <FormError error={errors.phone} />
            </div>
          )}

          {/* Champ mot de passe */}
          {view !== 'forgot' && (
            <div className="form-group">
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Mot de passe"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FormError error={errors.password} />

              {/* Indicateur de force — inscription uniquement */}
              {view === 'signup' && formData.password && (
                <div style={{ marginTop: 8, display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 2,
                      background: i <= strength ? strengthColors[strength] : '#e5e7eb',
                      transition: 'background 0.3s',
                    }} />
                  ))}
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 500,
                    marginLeft: 8, minWidth: 56,
                    color: strengthColors[strength], transition: 'color 0.3s',
                  }}>
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Champ confirmation — icône indépendante */}
          {view === 'signup' && (
            <div className="form-group">
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="password_confirmation"
                  placeholder="Confirmer le mot de passe"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FormError error={errors.password_confirmation} />

              {formData.password_confirmation && (
                <div style={{ marginTop: 6, fontSize: '0.75rem', fontWeight: 500 }}>
                  {formData.password === formData.password_confirmation
                    ? <span style={{ color: '#10b981' }}>✓ Les mots de passe correspondent</span>
                    : <span style={{ color: '#ef4444' }}>✗ Les mots de passe ne correspondent pas</span>
                  }
                </div>
              )}
            </div>
          )}

          {view === 'signin' && (
            <div className="forgot-link">
              <span onClick={() => setView('forgot')}>Mot de passe oublié ?</span>
            </div>
          )}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Traitement...' : content[view].btn}
          </button>
        </form>

        <div className="auth-footer">
          {view === 'signin' && <p>Nouveau client ? <span onClick={() => setView('signup')} className="link-gold">Créer un compte</span></p>}
          {view === 'signup' && <p>Déjà client ? <span onClick={() => setView('signin')} className="link-gold">Se connecter</span></p>}
          {view === 'forgot' && <p><span onClick={() => setView('signin')} className="link-gold">Retour à la connexion</span></p>}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;