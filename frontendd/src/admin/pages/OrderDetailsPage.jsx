import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../api';
import { Package, User, CreditCard, ShoppingBag, ArrowLeft, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const OrderDetailsPage = () => {
    const { t } = useTranslation();
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
            toast.error(t('admin.loading_error') || 'Impossible de charger la commande');
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
            toast.success(t('admin.status_updated') || 'Statut mis à jour avec succès');
            await load();
        } catch (e) {
            console.error(e);
            toast.error(e.response?.data?.message || t('admin.error') || 'Erreur lors de la mise à jour');
        } finally {
            setSaving(false);
        }
    };

    const getStatusDisplay = (currentStatus) => {
        switch(currentStatus) {
            case 'pending': return { icon: <Clock size={16} />, className: 'badge-pending', label: 'En attente' };
            case 'processing': return { icon: <Package size={16} />, className: 'badge-processing', label: 'En traitement' };
            case 'shipped': return { icon: <Truck size={16} />, className: 'badge-shipped', label: 'Expédiée' };
            case 'delivered': return { icon: <CheckCircle size={16} />, className: 'badge-delivered', label: 'Livrée' };
            case 'cancelled': return { icon: <XCircle size={16} />, className: 'badge-cancelled', label: 'Annulée' };
            default: return { icon: <Clock size={16} />, className: 'badge-pending', label: currentStatus };
        }
    };

    if (loading) {
        return (
            <div className="admin-loading-state">
                <style>{styles}</style>
                <div className="spinner"></div>
                <p>{t('admin.loading') || 'Chargement de la commande...'}</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="admin-empty-state">
                <style>{styles}</style>
                <Package size={48} />
                <p>{t('admin.order_not_found') || 'Commande introuvable'}</p>
            </div>
        );
    }

    const currentStatusConfig = getStatusDisplay(order.status);

    return (
        <div className="admin-order-page">
            {/* Injection du CSS directement dans le composant */}
            <style>{styles}</style>

            <Link to="/admin/orders" className="admin-back-link">
                <ArrowLeft size={16} /> {t('admin.back_to_orders') || 'Retour aux commandes'}
            </Link>

            <header className="admin-page-header">
                <div className="header-title-group">
                    <h1>{t('admin.orderDetail') || 'Commande'} #{id}</h1>
                    <span className={`status-badge ${currentStatusConfig.className}`}>
                        {currentStatusConfig.icon}
                        {t(`status.${order.status}`) || currentStatusConfig.label}
                    </span>
                </div>
                
                <div className="admin-actions-group">
                    <div className="status-updater">
                        <select 
                            className="admin-select" 
                            value={status} 
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            {statuses.map((s) => (
                                <option key={s} value={s}>{t(`status.${s}`) || s}</option>
                            ))}
                        </select>
                        <button 
                            className="admin-btn-primary" 
                            disabled={saving || status === order.status} 
                            onClick={onSave}
                        >
                            {saving ? '...' : t('admin.update') || 'Mettre à jour'}
                        </button>
                    </div>
                </div>
            </header>

            <div className="admin-order-grid">
                <div className="main-column">
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <ShoppingBag size={20} className="icon-burgundy" />
                            <h2>{t('admin.items') || 'Articles commandés'} ({totalItems})</h2>
                        </div>
                        <div className="table-responsive">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>{t('admin.product') || 'Produit'}</th>
                                        <th className="text-center">{t('admin.quantity') || 'Quantité'}</th>
                                        <th className="text-right">{t('admin.price') || 'Prix unitaire'}</th>
                                        <th className="text-right">{t('admin.total') || 'Total'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(order.items || []).map((it) => (
                                        <tr key={it.id}>
                                            <td className="product-cell">
                                                <div className="product-info-cell">
                                                    <span className="product-name">{it.product?.name || 'Produit inconnu'}</span>
                                                </div>
                                            </td>
                                            <td className="text-center font-medium">{it.quantity}</td>
                                            <td className="text-right">{parseFloat(it.price).toFixed(2)} MAD</td>
                                            <td className="text-right font-bold">{(parseFloat(it.price) * it.quantity).toFixed(2)} MAD</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="side-column">
                    <div className="admin-card">
                        <div className="admin-card-header">
                            <User size={20} className="icon-burgundy" />
                            <h2>{t('admin.customer') || 'Client'}</h2>
                        </div>
                        <div className="admin-card-body">
                            <p className="customer-email">{order.user?.email || 'Email non fourni'}</p>
                            {order.user?.name && <p className="text-muted">{order.user.name}</p>}
                            {order.user?.phone && <p className="text-muted">{order.user.phone}</p>}
                        </div>
                    </div>

                    <div className="admin-card">
                        <div className="admin-card-header">
                            <CreditCard size={20} className="icon-burgundy" />
                            <h2>{t('admin.summary') || 'Paiement & Résumé'}</h2>
                        </div>
                        <div className="admin-card-body summary-body">
                            <div className="summary-row">
                                <span className="text-muted">{t('admin.payment_status') || 'Statut paiement'}</span>
                                <span className={`payment-status ${order.payment_status === 'paid' ? 'paid' : 'unpaid'}`}>
                                    {order.payment_status}
                                </span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-row total-row">
                                <span>{t('admin.total') || 'Total TTC'}</span>
                                <span className="total-price">{parseFloat(order.total_price).toFixed(2)} MAD</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// On place le CSS dans une variable string à l'extérieur du composant
const styles = `
    :root {
        --admin-bg: #f4f6f8;
        --admin-card-bg: #ffffff;
        --admin-text-main: #212b36;
        --admin-text-muted: #637381;
        --admin-border: #dfe3e8;
        --admin-primary: #4a2b3d;
        --admin-primary-hover: #3a1b2d;
    }

    .admin-order-page {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
        color: var(--admin-text-main);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    .admin-back-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: var(--admin-text-muted);
        text-decoration: none;
        font-size: 0.9rem;
        margin-bottom: 20px;
        transition: color 0.2s;
    }

    .admin-back-link:hover {
        color: var(--admin-primary);
    }

    .admin-page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 32px;
        flex-wrap: wrap;
        gap: 20px;
    }

    .header-title-group {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .header-title-group h1 {
        margin: 0;
        font-size: 1.8rem;
        font-weight: 700;
    }

    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .badge-pending { background-color: #fff4e5; color: #b76e00; }
    .badge-processing { background-color: #e3f2fd; color: #0d47a1; }
    .badge-shipped { background-color: #f3e5f5; color: #6a1b9a; }
    .badge-delivered { background-color: #e8f5e9; color: #1b5e20; }
    .badge-cancelled { background-color: #ffebee; color: #b71c1c; }

    .status-updater {
        display: flex;
        gap: 12px;
        background: var(--admin-card-bg);
        padding: 8px;
        border-radius: 8px;
        border: 1px solid var(--admin-border);
        box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }

    .admin-select {
        padding: 8px 12px;
        border: 1px solid var(--admin-border);
        border-radius: 4px;
        font-size: 0.95rem;
        background-color: #fff;
        min-width: 150px;
        cursor: pointer;
    }

    .admin-select:focus {
        outline: none;
        border-color: var(--admin-primary);
    }

    .admin-btn-primary {
        background-color: var(--admin-primary);
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 16px;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .admin-btn-primary:hover:not(:disabled) {
        background-color: var(--admin-primary-hover);
    }

    .admin-btn-primary:disabled {
        background-color: #c4cdd5;
        cursor: not-allowed;
    }

    .admin-order-grid {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 24px;
    }

    .admin-card {
        background: var(--admin-card-bg);
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        border: 1px solid var(--admin-border);
        margin-bottom: 24px;
        overflow: hidden;
    }

    .admin-card-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 20px 24px;
        border-bottom: 1px solid var(--admin-border);
        background-color: #fafbfc;
    }

    .admin-card-header h2 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
    }

    .icon-burgundy { color: var(--admin-primary); }
    .admin-card-body { padding: 24px; }
    .text-muted { color: var(--admin-text-muted); font-size: 0.95rem; margin: 4px 0; }
    .font-medium { font-weight: 500; }
    .font-bold { font-weight: 700; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }

    .customer-email {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0 0 8px 0;
        word-break: break-all;
    }

    .summary-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }

    .summary-divider {
        height: 1px;
        background-color: var(--admin-border);
        margin: 16px 0;
    }

    .total-row {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--admin-primary);
        margin-bottom: 0;
    }

    .payment-status {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    .payment-status.paid { background-color: #e8f5e9; color: #1b5e20; }
    .payment-status.unpaid { background-color: #fff3e0; color: #e65100; }

    .table-responsive { overflow-x: auto; }
    .admin-table { width: 100%; border-collapse: collapse; }
    .admin-table th {
        background-color: #fafbfc;
        color: var(--admin-text-muted);
        font-weight: 600;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 16px 24px;
        border-bottom: 1px solid var(--admin-border);
        text-align: left;
    }
    .admin-table td {
        padding: 16px 24px;
        border-bottom: 1px solid var(--admin-border);
        vertical-align: middle;
    }
    .admin-table tr:last-child td { border-bottom: none; }
    .product-name { font-weight: 600; color: var(--admin-text-main); }

    .admin-loading-state, .admin-empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 50vh;
        color: var(--admin-text-muted);
        gap: 16px;
    }

    .spinner {
        border: 3px solid rgba(0,0,0,0.1);
        border-top: 3px solid var(--admin-primary);
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    @media (max-width: 900px) {
        .admin-order-grid { grid-template-columns: 1fr; }
        .admin-page-header { flex-direction: column; align-items: stretch; }
        .status-updater { justify-content: space-between; }
    }
`;

export default OrderDetailsPage;