import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../api';

const OrdersPage = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.listOrders({ page, per_page: 15 });
      const paginated = res?.data?.data;
      if (paginated) {
        setItems(paginated.data || []);
        setMeta({ current_page: paginated.current_page, last_page: paginated.last_page });
      }
    } catch (e) {
      console.error('Admin: Error updating order status:', e);
      if (e.response?.data?.errors) {
        const errs = e.response.data.errors;
        Object.values(errs).flat().forEach((msg) => toast.error(String(msg)));
      } else {
        toast.error(e.response?.data?.message || 'Erreur lors de la mise à jour');
      }
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
          <h1>{t('admin.orders')}</h1>
          <div className="admin-muted">{t('admin.manage')} {t('admin.orders').toLowerCase()}</div>
        </div>
      </div>

      {loading ? (
        <div className="admin-muted">{t('admin.loading')}</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('admin.id')}</th>
              <th>{t('admin.orderNumber')}</th>
              <th>{t('admin.customer')}</th>
              <th>{t('admin.total')}</th>
              <th>{t('admin.status')}</th>
              <th>{t('admin.paymentStatus')}</th>
              <th>{t('admin.actions')}</th>
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
                  <Link className="admin-btn secondary" to={`/admin/commandes/${o.id}`}>{t('admin.seeDetail')}</Link>
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
            {t('admin.prev')}
          </button>
          <div className="admin-muted" style={{ alignSelf: 'center' }}>
            Page {meta.current_page} / {meta.last_page}
          </div>
          <button
            className="admin-btn secondary"
            disabled={meta.current_page >= meta.last_page}
            onClick={() => load(meta.current_page + 1)}
          >
            {t('admin.next')}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
