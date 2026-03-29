import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, CircleX, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const canceled = searchParams.get('canceled') === '1';

  const [loading, setLoading] = useState(!canceled);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  
  const { clearCart } = useCart();

  const title = useMemo(() => {
    if (canceled) return 'Paiement annule';
    if (error) return 'Paiement non confirme';
    return 'Paiement confirme';
  }, [canceled, error]);

  useEffect(() => {
    if (canceled) {
      setLoading(false);
      return;
    }

    if (!sessionId) {
      setError('Session Stripe manquante.');
      setLoading(false);
      return;
    }

    const confirmStripeSession = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await api.get('/payments/stripe/session', {
          params: { session_id: sessionId },
        });

        const nextOrder = res?.data?.data?.order;
        if (!nextOrder) {
          throw new Error('Commande introuvable apres confirmation Stripe.');
        }

        setOrder(nextOrder);
        
        // Clear cart securely upon successful validation
        if (nextOrder.payment_status === 'paid' || nextOrder.status === 'processing') {
            clearCart();
        }
      } catch (e) {
        setError(e.response?.data?.message || e.message || 'Impossible de confirmer le paiement.');
      } finally {
        setLoading(false);
      }
    };

    confirmStripeSession();
  }, [canceled, sessionId, clearCart]);

  return (
    <div className="order-confirmation-page">
      <div className="order-confirmation-card">
        <div className="order-confirmation-icon">
          {loading ? <Loader2 className="spin" size={56} /> : canceled || error ? <CircleX size={56} /> : <CheckCircle2 size={56} />}
        </div>

        <h1>{title}</h1>

        {loading && <p>Verification du paiement en cours...</p>}

        {!loading && canceled && (
          <p>Le paiement a ete annule. Votre commande reste en attente de paiement.</p>
        )}

        {!loading && !canceled && error && (
          <p>{error}</p>
        )}

        {!loading && !canceled && !error && order && (
          <div className="order-confirmation-details">
            <p>
              Commande <strong>{order.order_number}</strong> confirmee.
            </p>
            <p>
              Statut commande: <strong>{order.status}</strong>
            </p>
            <p>
              Statut paiement: <strong>{order.payment_status}</strong>
            </p>
          </div>
        )}

        <div className="order-confirmation-actions">
          <Link to="/account/orders" className="order-confirmation-btn secondary">
            Voir mes commandes
          </Link>
          <Link to="/" className="order-confirmation-btn">
            Retour a l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;