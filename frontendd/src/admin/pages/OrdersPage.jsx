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
        toast.error(e.response?.data?.message || t('admin.update_error'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="admin-page-header">
        <div>
          <h1>{t('admin.orders')}</h1>
        </div>
      </div>

      {loading ? (
        <div className="admin-muted">{t('admin.loading')}</div>
      ) : (
        <table className="admin-table">
          <colgroup>
            <col style={{ width: '16%' }} />
            <col style={{ width: '26%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '16%' }} />
          </colgroup>
          <thead>
            <tr>
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
        <div className="admin-pagination">
          <button
            className="admin-btn secondary"
            disabled={meta.current_page <= 1}
            onClick={() => load(meta.current_page - 1)}
          >
            {t('admin.prev')}
          </button>
          <div className="admin-muted admin-pagination__label">
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