import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { adminApi } from '../api';

const OrdersPage = () => {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.listOrders({ page, per_page: 15 });
      const paginated = res.data.data;
      setItems(paginated.data);
      setMeta({ current_page: paginated.current_page, last_page: paginated.last_page });
    } catch (e) {
      console.error(e);
      toast.error('Impossible de charger les commandes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Commandes</h1>
          <div className="admin-muted">Liste des commandes</div>
        </div>
      </div>

      {loading ? (
        <div className="admin-muted">Chargement...</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Numéro</th>
              <th>Utilisateur</th>
              <th>Total</th>
              <th>Statut</th>
              <th>Paiement</th>
              <th>Détails</th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td><span className="admin-badge">{o.order_number}</span></td>
                <td>{o.user?.email || '-'}</td>
                <td>{o.total_price}</td>
                <td><span className="admin-badge">{o.status}</span></td>
                <td><span className="admin-badge">{o.payment_status}</span></td>
                <td>
                  <Link className="admin-btn secondary" to={`/admin/orders/${o.id}`}>Voir</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {meta && meta.last_page > 1 && (
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button
            className="admin-btn secondary"
            disabled={meta.current_page <= 1}
            onClick={() => load(meta.current_page - 1)}
          >
            Précédent
          </button>
          <div className="admin-muted" style={{ alignSelf: 'center' }}>
            Page {meta.current_page} / {meta.last_page}
          </div>
          <button
            className="admin-btn secondary"
            disabled={meta.current_page >= meta.last_page}
            onClick={() => load(meta.current_page + 1)}
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
