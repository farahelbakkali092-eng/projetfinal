import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import './Cart.css';
import './CartPage.css';

/**
 * CartPage — full page version of the cart (used via /cart route)
 * Different from Cart.jsx which is the slide-in drawer
 */
const CartPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { cartItems, updateQuantity, removeFromCart, subtotal } = useCart();
    const { user, isAdmin } = useAuth();

    const handleCheckout = () => {
        if (!user) {
            toast.error('Veuillez vous connecter pour commander');
            return;
        }
        navigate('/checkout');
    };

    return (
        <div className="cart-page-container">
            <div className="cart-page-header">
                <h1>{t('cart.title')}</h1>
                <span className="cart-page-count">{cartItems.length} {cartItems.length === 1 ? 'article' : 'articles'}</span>
            </div>

            {cartItems.length === 0 ? (
                <div className="cart-page-empty">
                    <ShoppingBag size={64} strokeWidth={1} color="#c9a49a" />
                    <h2>{t('cart.empty')}</h2>
                    <button className="cart-page-explore-btn" onClick={() => navigate('/')}>
                        Continuer mes achats
                    </button>
                </div>
            ) : (
                <div className="cart-page-layout">
                    {/* Items list */}
                    <div className="cart-page-items">
                        {cartItems.map((item) => (
                            <div key={item.id} className="cart-page-item">
                                <div className="cart-page-item-img">
                                    <img
                                        src={item.images && item.images.length > 0
                                            ? `http://localhost:8000/storage/${item.images[0].image_path}`
                                            : 'https://placehold.co/120?text=P'}
                                        alt={item.name}
                                    />
                                </div>
                                <div className="cart-page-item-details">
                                    <div className="cart-page-item-top">
                                        <div>
                                            <span className="cart-page-item-brand">{item.brand?.name || ''}</span>
                                            <h3 className="cart-page-item-name">{item.name}</h3>
                                        </div>
                                        <button className="cart-page-remove-btn" onClick={() => removeFromCart(item.id)}>
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <div className="cart-page-item-bottom">
                                        <div className="cart-page-qty-controls">
                                            <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                                        </div>
                                        <div className="cart-page-item-price">
                                            {(parseFloat(item.price_sold || item.price) * item.quantity).toFixed(2)} MAD
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="cart-page-summary">
                        <h3>Récapitulatif</h3>
                        <div className="cart-page-summary-row">
                            <span>{t('cart.subtotal')}</span>
                            <span>{subtotal.toFixed(2)} MAD</span>
                        </div>
                        <p className="cart-page-shipping-note">{t('cart.shippingNote')}</p>
                        <div className="cart-page-summary-divider" />
                        <div className="cart-page-summary-row cart-page-total-row">
                            <span>Total</span>
                            <span className="cart-page-total-price">{subtotal.toFixed(2)} MAD</span>
                        </div>
                        {!isAdmin && (
                            <button className="cart-page-checkout-btn" onClick={handleCheckout}>
                                {t('cart.checkout')}
                            </button>
                        )}
                        <button className="cart-page-continue-btn" onClick={() => navigate('/')}>
                            {t('cart.continue')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
