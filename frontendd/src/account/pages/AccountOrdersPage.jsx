import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Loader2 } from 'lucide-react';

const statusColors = {
  pending:    { bg: '#fff8e6', color: '#b45309', border: '#fde68a' },
  confirmed:  { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  shipped:    { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  delivered:  { bg: '#f0fdf4', color: '#166534', border: '#86efac' },
  cancelled:  { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  paid:       { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  unpaid:     { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  refunded:   { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff' },
};

const StatusBadge = ({ value }) => {
  const key = value?.toLowerCase();
  const style = statusColors[key] || { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '999px',
      fontSize: '0.72rem',
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'capitalize',
      background: style.bg,
      color: style.color,
      border: `1px solid ${style.border}`,
      fontFamily: 'sans-serif',
    }}>
      {value}
    </span>
  );
};

const AccountOrdersPage = () => {
  const { t } = useTranslation();
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
      toast.error(t('admin.loading_error') || 'Impossible de charger les commandes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []);

  return (
    <div>
      <style>{`
        .orders-table-wrapper {
          width: 100%;
          overflow-x: auto;
          border-radius: 14px;
          border: 1px solid #ecddd8;
          background: #fff;
          box-shadow: 0 2px 12px rgba(38,24,18,0.06);
        }

        .orders-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-family: sans-serif;
        }

        .orders-table colgroup col:nth-child(1) { width: 22%; }
        .orders-table colgroup col:nth-child(2) { width: 18%; }
        .orders-table colgroup col:nth-child(3) { width: 18%; }
        .orders-table colgroup col:nth-child(4) { width: 22%; }
        .orders-table colgroup col:nth-child(5) { width: 20%; }

        .orders-table thead tr {
          background: #fdf6f1;
          border-bottom: 1px solid #ecddd8;
        }

        .orders-table thead th {
          padding: 13px 16px;
          text-align: left;
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #b89080;
          font-weight: 600;
        }

        .orders-table tbody tr {
          border-bottom: 1px solid #f5ece8;
          transition: background 0.15s;
        }

        .orders-table tbody tr:last-child { border-bottom: none; }
        .orders-table tbody tr:hover { background: #fdf9f7; }

        .orders-table tbody td {
          padding: 14px 16px;
          vertical-align: middle;
          text-align: left;
          font-size: 0.85rem;
          color: #261812;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .order-number-badge {
          display: inline-block;
          padding: 3px 10px;
          background: #fdf0eb;
          border: 1px solid #e8cfc6;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #8e6458;
          letter-spacing: 0.04em;
        }

        .order-price {
          font-weight: 600;
          color: #261812;
        }

        .order-date {
          font-size: 0.8rem;
          color: #b89080;
        }

        .orders-pagination {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 20px;
          font-family: sans-serif;
        }

        .orders-page-btn {
          padding: 8px 18px;
          border-radius: 999px;
          border: 1.5px solid #e8ddd8;
          background: #fff;
          color: #261812;
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          letter-spacing: 0.04em;
        }

        .orders-page-btn:hover:not(:disabled) {
          background: #fdf6f1;
          border-color: #d4a373;
        }

        .orders-page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .orders-page-info {
          font-size: 0.78rem;
          color: #b89080;
        }

        .orders-loading {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 48px 0;
          color: #b89080;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-family: sans-serif;
        }
      `}</style>

      {/* Header */}
      <div className="account-page-header">
        <div>
          <h1>{t('admin.orders')}</h1>
          <div className="account-muted">
            {'Historique de vos commandes passées'}
          </div>
        </div>
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="orders-loading">
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
          {t('admin.loading') || 'Chargement...'}
        </div>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <colgroup>
              <col /><col /><col /><col /><col />
            </colgroup>
            <thead>
              <tr>
                <th>{t('admin.orderNumber') || 'N° commande'}</th>
                <th>{t('admin.total') || 'Total'}</th>
                <th>{t('admin.status') || 'Statut'}</th>
                <th>{t('admin.paymentStatus') || 'Paiement'}</th>
                <th>{t('admin.date') || 'Date'}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr key={o.id}>
                  <td>
                    <span className="order-number-badge">{o.order_number}</span>
                  </td>
                  <td>
                    <span className="order-price">{o.total_price} MAD</span>
                  </td>
                  <td><StatusBadge value={o.status} /></td>
                  <td><StatusBadge value={o.payment_status} /></td>
                  <td>
                    <span className="order-date">
                      {new Date(o.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="orders-pagination">
          <button
            className="orders-page-btn"
            disabled={meta.current_page <= 1}
            onClick={() => load(meta.current_page - 1)}
          >
            {t('admin.prev') || '← Précédent'}
          </button>
          <span className="orders-page-info">
            Page {meta.current_page} / {meta.last_page}
          </span>
          <button
            className="orders-page-btn"
            disabled={meta.current_page >= meta.last_page}
            onClick={() => load(meta.current_page + 1)}
          >
            {t('admin.next') || 'Suivant →'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountOrdersPage;