import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { ChevronLeft, Truck, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';
import api from '../../api/axios'; // ⚠️ MODIFIÉ: Import de l'API
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const { cartItems, subtotal, clearCart } = useCart();

    if (isAdmin) {
        return <Navigate to="/" replace />;
    }
    
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [isOrdered, setIsOrdered] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false); // ⚠️ AJOUTÉ: État de chargement

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        city: '',
        address: '',
        postalCode: '',
        cardName: '',
        cardNumber: '',
        expiry: '',
        cvv: ''
    });

    if (cartItems.length === 0 && !isOrdered) {
        return (
            <div className="checkout-empty">
                <h2>Votre panier est vide</h2>
                <Link to="/" className="back-btn">Retour à la boutique</Link>
            </div>
        );
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // ⚠️ NOUVELLE FONCTION: Envoi de la commande avec les articles du panier
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        const orderPayload = {
            shipping_address: `${formData.address}, ${formData.city}, ${formData.postalCode}`,
            phone: formData.phone,
            payment_method: paymentMethod,
            items: cartItems.map(item => ({
                product_id: item.id,
                quantity: item.quantity
            }))
        };

        try {
           await api.get('/sanctum/csrf-cookie', { baseURL: 'http://localhost:8000' });
            await api.post('/orders', orderPayload);
            
            clearCart();
            setIsOrdered(true);
            toast.success('Commande validée avec succès !');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Erreur lors de la création de la commande');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isOrdered) {
        return (
            <div className="checkout-container">
                <div className="confirmation-card">
                    <CheckCircle size={64} color="#c0675a" className="success-icon" style={{ margin: '0 auto' }} />
                    <h1>Merci pour votre commande !</h1>
                    <p>Votre commande a été traitée avec succès et sera expédiée très bientôt.</p>
                    <button onClick={() => navigate('/')} className="back-shop-btn">
                        Retour à la boutique
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <div className="checkout-header">
                <button onClick={() => navigate('/cart')} className="back-to-cart">
                    <ChevronLeft size={20} /> Retour au panier
                </button>
                <h1>Finaliser la commande</h1>
                <div className="checkout-total">Total: {subtotal.toFixed(2)} MAD</div>
            </div>

            {/* ⚠️ MODIFIÉ: Ajout de onSubmit={handleSubmit} */}
            <form onSubmit={handleSubmit} className="checkout-form">
                <section className="form-section">
                    <h2>1. Informations de livraison</h2>
                    <div className="input-group">
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Nom complet"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Téléphone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="text"
                            name="city"
                            placeholder="Ville"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="text"
                            name="address"
                            placeholder="Adresse"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="text"
                            name="postalCode"
                            placeholder="Code postal"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </section>

                <section className="form-section">
                    <h2>2. Méthode de paiement</h2>
                    <div className="payment-methods">
                        <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="payment"
                                value="cod"
                                checked={paymentMethod === 'cod'}
                                onChange={() => setPaymentMethod('cod')}
                            />
                            <Truck size={20} />
                            Paiement à la livraison
                        </label>
                        <label className={`payment-option ${paymentMethod === 'online' ? 'selected' : ''}`}>
                            <input
                                type="radio"
                                name="payment"
                                value="online"
                                checked={paymentMethod === 'online'}
                                onChange={() => setPaymentMethod('online')}
                            />
                            <CreditCard size={20} />
                            Paiement en ligne
                        </label>
                    </div>
                </section>

                <button type="submit" className="submit-order-btn" disabled={isProcessing}>
                    {isProcessing ? (
                        <Loader2 className="animate-spin" style={{ margin: '0 auto' }} />
                    ) : (
                        paymentMethod === 'online' ? `Payer ${subtotal.toFixed(2)} MAD` : 'Passer la commande'
                    )}
                </button>
            </form>
        </div>
    );
};

export default Checkout;