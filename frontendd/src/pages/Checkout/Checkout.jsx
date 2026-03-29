import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { ChevronLeft, Truck, CreditCard, CheckCircle, Loader2, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { isAdmin } = useAuth();
    const { cartItems, subtotal, clearCart } = useCart();

    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [isOrdered, setIsOrdered] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        city: '',
        address: '',
        postalCode: '',
    });

    if (isAdmin) {
        return <Navigate to="/" replace />;
    }

    if (cartItems.length === 0 && !isOrdered) {
        return (
            <div className="checkout-empty">
                <Package size={64} strokeWidth={1} color="#c9a49a" />
                <h2>{t('checkout.emptyCart')}</h2>
                <Link to="/" className="back-shop-btn">{t('checkout.backToShop')}</Link>
            </div>
        );
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const buildOrderPayload = () => ({
        shipping_address: `${formData.address}, ${formData.city}, ${formData.postalCode}`,
        payment_method: paymentMethod,
        items: cartItems.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
        })),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const orderRes = await api.post('/orders', buildOrderPayload());
            const order = orderRes?.data?.data;

            if (!order?.id) {
                throw new Error('Commande creee mais identifiant introuvable');
            }

            if (paymentMethod === 'stripe') {
                const payRes = await api.post(`/orders/${order.id}/pay`);
                const checkoutUrl = payRes?.data?.data?.checkout_url;

                if (!checkoutUrl) {
                    throw new Error('URL Stripe Checkout introuvable');
                }

                // Redirect to Stripe Checkout (don't clear cart yet, it'll be cleared on confirmation)
                window.location.href = checkoutUrl;
                return;
            }

            clearCart();
            setIsOrdered(true);
            toast.success('Commande validee avec succes !');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || error.message || 'Erreur lors de la creation de la commande');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isOrdered) {
        return (
            <div className="confirmation-container">
                <div className="confirmation-card fade-in">
                    <div className="success-icon">
                        <CheckCircle size={72} color="#c0675a" strokeWidth={1.5} />
                    </div>
                    <h1>{t('checkout.thankYou')}</h1>
                    <p>{t('checkout.successMsg')}</p>
                    <button onClick={() => navigate('/')} className="back-shop-btn">
                        {t('checkout.backToShop')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <div className="checkout-header">
                <button onClick={() => navigate('/cart')} className="back-to-cart">
                    <ChevronLeft size={20} /> {t('checkout.backToCart')}
                </button>
                <h1>{t('checkout.title')}</h1>
                <div className="checkout-total">{t('checkout.total')}: {subtotal.toFixed(2)} MAD</div>
            </div>

            <div className="checkout-layout">
                <aside className="checkout-summary">
                    <h3 className="summary-title">Recapitulatif</h3>
                    <div className="summary-items">
                        {cartItems.map(item => (
                            <div key={item.id} className="summary-item">
                                <div className="summary-item-img">
                                    <img
                                        src={item.images?.[0]
                                            ? `http://localhost:8000/storage/${item.images[0].image_path}`
                                            : 'https://placehold.co/80?text=P'}
                                        alt={item.name}
                                    />
                                    <span className="summary-qty">{item.quantity}</span>
                                </div>
                                <div className="summary-item-info">
                                    <span className="summary-item-name">{item.name}</span>
                                    <span className="summary-item-price">
                                        {(parseFloat(item.price_sold || item.price) * item.quantity).toFixed(2)} MAD
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="summary-divider" />
                    <div className="summary-total-row">
                        <span>Total</span>
                        <span className="summary-total-price">{subtotal.toFixed(2)} MAD</span>
                    </div>
                </aside>

                <form onSubmit={handleSubmit} className="checkout-form">
                    <section className="form-section">
                        <h2>{t('checkout.shipping')}</h2>
                        <div className="input-row">
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder={t('checkout.fullName')}
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder={t('checkout.phone')}
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="input-row">
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="city"
                                    placeholder={t('checkout.city')}
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <input
                                    type="text"
                                    name="postalCode"
                                    placeholder={t('checkout.postalCode')}
                                    value={formData.postalCode}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="input-group">
                            <input
                                type="text"
                                name="address"
                                placeholder={t('checkout.address')}
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </section>

                    <section className="payment-section">
                        <h2>{t('checkout.payment')}</h2>
                        <div className="payment-options">
                            <div
                                className={`payment-card ${paymentMethod === 'cod' ? 'selected' : ''}`}
                                onClick={() => setPaymentMethod('cod')}
                            >
                                <div className="payment-icon"><Truck size={24} /></div>
                                <div className="payment-text">
                                    <span className="payment-title">{t('checkout.cod')}</span>
                                    <span className="payment-desc">Payez a la reception</span>
                                </div>
                            </div>
                            <div
                                className={`payment-card ${paymentMethod === 'stripe' ? 'selected' : ''}`}
                                onClick={() => setPaymentMethod('stripe')}
                            >
                                <div className="payment-icon"><CreditCard size={24} /></div>
                                <div className="payment-text">
                                    <span className="payment-title">Stripe</span>
                                    <span className="payment-desc">Carte bancaire securisee</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <button type="submit" className="submit-order-btn" disabled={isProcessing}>
                        {isProcessing ? (
                            <Loader2 className="animate-spin" size={20} style={{ margin: '0 auto' }} />
                        ) : (
                            paymentMethod === 'stripe'
                                ? `${t('checkout.pay')} ${subtotal.toFixed(2)} MAD`
                                : t('checkout.placeOrder')
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Checkout;