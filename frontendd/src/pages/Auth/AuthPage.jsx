import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import './AuthPage.css';

const AuthPage = ({ isOpen, onClose, initialView = 'signin' }) => {
  const { login, register, forgotPassword, loading } = useAuth();
  const [view, setView] = useState(initialView);
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setIsAnimating(true);
      setFormData({ first_name: '', last_name: '', email: '', phone: '', password: '', password_confirmation: '' });
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
    let success = false;

    if (view === 'signin') {
      success = await login(formData.email, formData.password);
      if (success) handleClose();
    } else if (view === 'signup') {
      if (formData.password !== formData.password_confirmation) {
        toast.error("Les mots de passe ne correspondent pas");
        return;
      }
      success = await register(formData);
      if (success) handleClose();
    } else if (view === 'forgot') {
      success = await forgotPassword(formData.email);
      if (success) setView('signin');
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

        <form onSubmit={handleSubmit} className="auth-form">
          {view === 'signup' && (
            <div className="form-group-row">
              <div className="form-group">
                <input type="text" name="first_name" placeholder="Prénom" value={formData.first_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <input type="text" name="last_name" placeholder="Nom" value={formData.last_name} onChange={handleChange} required />
              </div>
            </div>
          )}

          <div className="form-group">
            <input type="email" name="email" placeholder="Adresse email" value={formData.email} onChange={handleChange} required />
          </div>

          {view === 'signup' && (
            <div className="form-group">
              <input type="tel" name="phone" placeholder="Téléphone (optionnel)" value={formData.phone} onChange={handleChange} />
            </div>
          )}

          {view !== 'forgot' && (
            <div className="form-group password-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" placeholder="Mot de passe" 
                value={formData.password} onChange={handleChange} required 
              />
              <button type="button" className="toggle-pass" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          )}

          {view === 'signup' && (
            <div className="form-group password-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password_confirmation" placeholder="Confirmer le mot de passe" 
                value={formData.password_confirmation} onChange={handleChange} required 
              />
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