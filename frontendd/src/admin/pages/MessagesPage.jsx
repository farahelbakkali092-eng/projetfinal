import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { adminApi } from '../api';

const MessagesPage = () => {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminApi.listMessages({ page, per_page: 15 });
      const paginated = res?.data?.data;
      if (paginated) {
        setItems(paginated.data || []);
        setMeta({ current_page: paginated.current_page, last_page: paginated.last_page });
      }
    } catch (e) {
      console.error(e);
      toast.error('Impossible de charger les messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  const openMessage = async (m) => {
    setSelected(m);
    if (!m.is_read) {
      try {
        await adminApi.markMessageRead(m.id);
        await load(meta?.current_page || 1);
      } catch (e) {
        console.error(e);
        toast.error('Impossible de marquer comme lu');
      }
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Messages clients</h1>
          <div className="admin-muted">Consulter et marquer comme lu</div>
        </div>
      </div>

      {loading ? (
        <div className="admin-muted">Chargement...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
          <div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Lu</th>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Sujet</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map((m) => (
                  <tr key={m.id} style={{ cursor: 'pointer' }} onClick={() => openMessage(m)}>
                    <td>
                      <span className="admin-badge" style={{
                        borderColor: m.is_read ? 'var(--border-light)' : 'rgba(212, 163, 115, 0.6)',
                        background: m.is_read ? '#fff' : 'rgba(212, 163, 115, 0.15)'
                      }}>
                        {m.is_read ? 'Oui' : 'Non'}
                      </span>
                    </td>
                    <td>{m.name}</td>
                    <td>{m.email}</td>
                    <td>{m.subject}</td>
                    <td>{new Date(m.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

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

          <div>
            <div className="admin-card" style={{ minHeight: 240 }}>
              <div className="admin-card-label">Détail</div>
              {!selected ? (
                <div className="admin-muted" style={{ marginTop: 10 }}>Sélectionne un message pour voir le contenu.</div>
              ) : (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', color: 'var(--burgundy)' }}>
                    {selected.subject}
                  </div>
                  <div className="admin-muted" style={{ marginTop: 6 }}>
                    {selected.name} — {selected.email}
                  </div>
                  <div className="admin-muted" style={{ marginTop: 6 }}>
                    {new Date(selected.created_at).toLocaleString()}
                  </div>

                  <div style={{ marginTop: 12, whiteSpace: 'pre-wrap', color: 'var(--text)' }}>
                    {selected.message}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
