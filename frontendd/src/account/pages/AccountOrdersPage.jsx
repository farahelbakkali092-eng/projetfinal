import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const AccountOrdersPage = () => {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/orders', { params: { page, per_page: 15 } });
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
      <div className="account-page-header">
        <div>
          <h1>Commandes</h1>
          <div className="account-muted">Historique des commandes passées</div>
        </div>
      </div>

      {loading ? (
        <div className="account-muted">Chargement...</div>
      ) : (
        <table className="account-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Numéro</th>
              <th>Total</th>
              <th>Statut</th>
              <th>Paiement</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td><span className="account-badge">{o.order_number}</span></td>
                <td>{o.total_price}</td>
                <td><span className="account-badge">{o.status}</span></td>
                <td><span className="account-badge">{o.payment_status}</span></td>
                <td>{new Date(o.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {meta && meta.last_page > 1 && (
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button
            className="account-btn secondary"
            disabled={meta.current_page <= 1}
            onClick={() => load(meta.current_page - 1)}
          >
            Précédent
          </button>
          <div className="account-muted" style={{ alignSelf: 'center' }}>
            Page {meta.current_page} / {meta.last_page}
          </div>
          <button
            className="account-btn secondary"
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

export default AccountOrdersPage;
