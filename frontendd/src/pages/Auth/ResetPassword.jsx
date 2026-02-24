import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Lock } from 'lucide-react';
import './AuthPage.css'; // Reuse existing styles

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { resetPassword, loading } = useAuth();

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        password: '',
        password_confirmation: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token || !email) {
            toast.error("Lien de réinitialisation invalide ou expiré.");
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            toast.error("Les mots de passe ne correspondent pas.");
            return;
        }

        const success = await resetPassword({
            token,
            email,
            password: formData.password,
            password_confirmation: formData.password_confirmation
        });

        if (success) {
            setTimeout(() => navigate('/'), 2000);
        }
    };

    return (
        <div className="reset-password-page" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
            <div className="auth-card" style={{ position: 'relative', transform: 'none', top: 'auto', left: 'auto' }}>
                <div className="auth-header">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                        <div style={{ padding: '15px', background: 'var(--blush)', borderRadius: '50%', color: 'var(--gold)' }}>
                            <Lock size={30} />
                        </div>
                    </div>
                    <h2>Nouveau mot de passe</h2>
                    <p>Veuillez choisir votre nouveau mot de passe sécurisé.</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Nouveau mot de passe"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={8}
                        />
                        <button type="button" className="toggle-pass" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    <div className="form-group password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password_confirmation"
                            placeholder="Confirmer le mot de passe"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-submit" disabled={loading || !token}>
                        {loading ? 'Réinitialisation...' : 'Changer le mot de passe'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p><span onClick={() => navigate('/')} className="link-gold">Retour à l'accueil</span></p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
