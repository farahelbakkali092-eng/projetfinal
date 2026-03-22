import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import './ChatBot.css';

const BOT_INTRO = {
  from: 'bot',
  text: "Bonjour ! 👋 Je suis votre conseillère beauté. Décrivez-moi votre type de peau ou votre besoin, et je vous recommande les produits les plus adaptés de notre boutique.",
  products: [],
};

// Conversation steps:
//  'idle'            → waiting for user skin concern
//  'awaiting_gender' → concern received, waiting for gender selection
const STEPS = { IDLE: 'idle', AWAITING_GENDER: 'awaiting_gender' };

const ChatBot = () => {
  const [open, setOpen]               = useState(false);
  const [messages, setMessages]       = useState([BOT_INTRO]);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [step, setStep]               = useState(STEPS.IDLE);
  const [pendingMessage, setPending]  = useState('');
  const bottomRef                     = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const addBotMessage = (text, products = []) => {
    setMessages(prev => [...prev, { from: 'bot', text, products }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { from: 'user', text }]);
  };

  /**
   * Called when the user submits their skin concern (step = IDLE).
   * We save the message and ask for gender instead of calling the API directly.
   */
  const handleConcern = useCallback((text) => {
    if (!text || loading) return;
    addUserMessage(text);
    setInput('');
    setPending(text);
    setStep(STEPS.AWAITING_GENDER);
    // Bot asks for gender
    addBotMessage("Merci ! Avant de vous recommander les meilleurs produits, puis-je vous demander : êtes-vous un homme ou une femme ?");
  }, [loading]);

  /**
   * Called when the user picks a gender quick-reply button.
   * Now we fire the actual API call with both message and gender.
   */
  const handleGenderSelect = useCallback(async (gender) => {
    if (loading) return;

    const genderLabel = gender === 'homme' ? '👨 Homme' : '👩 Femme';
    addUserMessage(genderLabel);
    setStep(STEPS.IDLE);
    setLoading(true);

    try {
      const res  = await api.post('/chat/recommend', { message: pendingMessage, gender });
      const data = res.data?.data || {};
      addBotMessage(
        data.reply || "Voici ce que j'ai trouvé :",
        data.products || []
      );
    } catch {
      addBotMessage('Désolée, une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
      setPending('');
    }
  }, [loading, pendingMessage]);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || loading) return;
    // Always treat a typed message as a new skin concern
    handleConcern(text);
  }, [input, loading, handleConcern]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const isInputDisabled = loading || step === STEPS.AWAITING_GENDER;

  return (
    <div className="chatbot-wrapper">
      {/* Floating toggle button */}
      <button
        className={`chatbot-fab ${open ? 'chatbot-fab--open' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label="Ouvrir le chatbot beauté"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
        {!open && <span className="chatbot-fab-label">Conseil beauté</span>}
      </button>

      {/* Chat window */}
      {open && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-avatar">✨</div>
            <div>
              <div className="chatbot-header-name">Conseillère Beauté</div>
              <div className="chatbot-header-status">En ligne · Propulsé par IA</div>
            </div>
            <button className="chatbot-close-btn" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg chatbot-msg--${msg.from}`}>
                {msg.from === 'bot' && (
                  <div className="chatbot-bot-avatar">✨</div>
                )}
                <div className="chatbot-msg-content">
                  <p className="chatbot-msg-text">{msg.text}</p>

                  {/* Product cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="chatbot-products">
                      {msg.products.map((p) => (
                        <Link
                          to={`/product/${p.id}`}
                          key={p.id}
                          className="chatbot-product-card"
                          onClick={() => setOpen(false)}
                        >
                          {p.image_url && (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="chatbot-product-img"
                              loading="lazy"
                            />
                          )}
                          <div className="chatbot-product-info">
                            <div className="chatbot-product-name">{p.name}</div>
                            {p.category && (
                              <div className="chatbot-product-category">{p.category}</div>
                            )}
                            <div className="chatbot-product-price">
                              {p.price_sold ? (
                                <>
                                  <span className="chatbot-price-sold">{Number(p.price_sold).toFixed(2)} MAD</span>
                                  <span className="chatbot-price-original">{Number(p.price).toFixed(2)}</span>
                                </>
                              ) : (
                                <span className="chatbot-price-sold">{Number(p.price).toFixed(2)} MAD</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Gender quick-reply buttons — shown after bot asks the question */}
            {step === STEPS.AWAITING_GENDER && !loading && (
              <div className="chatbot-quick-replies">
                <button
                  className="chatbot-quick-btn"
                  onClick={() => handleGenderSelect('homme')}
                >
                  👨 Homme
                </button>
                <button
                  className="chatbot-quick-btn"
                  onClick={() => handleGenderSelect('femme')}
                >
                  👩 Femme
                </button>
              </div>
            )}

            {/* Loading indicator */}
            {loading && (
              <div className="chatbot-msg chatbot-msg--bot">
                <div className="chatbot-bot-avatar">✨</div>
                <div className="chatbot-msg-content">
                  <div className="chatbot-typing">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-area">
            <input
              className="chatbot-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={
                step === STEPS.AWAITING_GENDER
                  ? "Cliquez sur Homme ou Femme ci-dessus..."
                  : "Décrivez votre besoin beauté..."
              }
              disabled={isInputDisabled}
              maxLength={500}
            />
            <button
              className="chatbot-send-btn"
              onClick={sendMessage}
              disabled={isInputDisabled || !input.trim()}
              aria-label="Envoyer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
