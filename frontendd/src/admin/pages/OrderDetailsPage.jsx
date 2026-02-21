import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { adminApi } from '../api';

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const OrderDetailsPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('pending');

  const totalItems = useMemo(() => order?.items?.reduce((acc, it) => acc + (it.quantity || 0), 0) || 0, [order]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOrder(id);
      setOrder(res.data.data);
      setStatus(res.data.data.status);
    } catch (e) {
      console.error(e);
      toast.error('Impossible de charger la commande');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateOrderStatus(id, status);
      toast.success('Statut mis à jour');
      await load();
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Commande #{id}</h1>
          <div className="admin-muted">Détails et gestion du statut</div>
        </div>
        {!loading && order && (
          <div className="admin-actions">
            <select className="admin-input" value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 220 }}>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button className="admin-btn" disabled={saving} onClick={onSave}>{saving ? '...' : 'Enregistrer'}</button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="admin-muted">Chargement...</div>
      ) : !order ? (
        <div className="admin-muted">Commande introuvable</div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div className="admin-card">
              <div className="admin-card-label">Client</div>
              <div className="admin-card-value" style={{ fontSize: '1.4rem' }}>{order.user?.email}</div>
            </div>
            <div className="admin-card">
              <div className="admin-card-label">Résumé</div>
              <div className="admin-muted">Articles: {totalItems}</div>
              <div className="admin-muted">Total: {order.total_price}</div>
              <div className="admin-muted">Paiement: {order.payment_status}</div>
            </div>
          </div>

          <h2 style={{ margin: '8px 0', fontFamily: 'var(--font-heading)', color: 'var(--burgundy)' }}>Articles</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Prix</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((it) => (
                <tr key={it.id}>
                  <td>{it.product?.name || '-'}</td>
                  <td>{it.quantity}</td>
                  <td>{it.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;
