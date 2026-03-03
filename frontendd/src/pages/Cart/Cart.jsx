import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Minus, Plus, Loader2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';
import './Cart.css';

const CartDrawer = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, subtotal, clearCart } = useCart();
  const { user, isAdmin } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour commander');
      return;
    }

    if (cartItems.length === 0) return;

    onClose();
    navigate('/checkout');
  };

  return (
    <>
      <div
        className={`cart-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <div className="cart-header-title">
            <ShoppingBag size={20} />
            <h2>Votre Panier <span className="cart-count">({cartItems.length})</span></h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <ShoppingBag size={48} strokeWidth={1} color="#ccc" />
              <p>Votre panier est vide</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img src={item.images && item.images.length > 0 ? `http://localhost:8000/storage/${item.images[0].image_path}` : 'https://placehold.co/200?text=Produit'} alt={item.name} />
                </div>

                <div className="item-details">
                  <div className="item-header">
                    <span className="item-brand">{item.brand?.name || 'DAWSM'}</span>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}><X size={16} /></button>
                  </div>

                  <h3 className="item-name">{item.name}</h3>
                  <div className="item-price">{parseFloat(item.price_sold || item.price).toFixed(2)} MAD</div>

                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="subtotal-row">
              <span>Sous-total</span>
              <span className="subtotal-price">${subtotal.toFixed(2)}</span>
            </div>
            <p className="shipping-note">Frais de port calculés à la caisse</p>

            {!isAdmin && (
              <button
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="animate-spin mx-auto" /> : 'Commander'}
              </button>
            )}

            <button className="continue-link" onClick={onClose}>
              Continuer mes achats
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;