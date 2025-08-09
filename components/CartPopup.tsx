"use client"

import { useCart } from './CartContext'
import { ShoppingCart, Plus, Minus, X } from 'lucide-react'

interface CartPopupProps {
  isVisible: boolean
  onClose: () => void
}

export default function CartPopup({ isVisible, onClose }: CartPopupProps) {
  const { items, totalAmount, totalQty, updateQty, removeItem, clear } = useCart()

  if (!isVisible) return null

  return (
    <div className="cart-popup">
      <div className="cart-popup-header">
        <h3>
          <ShoppingCart size={18} />
          Carrello ({totalQty})
        </h3>
        <button className="close-btn" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <div className="cart-popup-content">
        {items.length === 0 ? (
          <div className="empty-cart">
            <ShoppingCart size={32} />
            <p>Il carrello è vuoto</p>
            <small>Aggiungi prodotti dal nostro shop</small>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.slice(0, 3).map((item) => (
                <div key={item.id} className="cart-item">
                  <img 
                    src={item.immagine} 
                    alt={item.nome}
                    className="item-image"
                  />
                  <div className="item-details">
                    <h4>{item.nome}</h4>
                    <p className="item-price">€ {item.prezzo.toFixed(2)}</p>
                    {item.tipo && <span className="item-type">{item.tipo}</span>}
                  </div>
                  <div className="item-controls">
                    <div className="quantity-controls">
                      <button 
                        className="qty-btn"
                        onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                        disabled={item.qty <= 1}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="qty-display">{item.qty}</span>
                      <button 
                        className="qty-btn"
                        onClick={() => updateQty(item.id, item.qty + 1)}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button 
                      className="remove-btn"
                      onClick={() => removeItem(item.id)}
                      title="Rimuovi dal carrello"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
              
              {items.length > 3 && (
                <div className="more-items">
                  +{items.length - 3} altri prodotti
                </div>
              )}
            </div>

            <div className="cart-summary">
              <div className="total-row">
                <span>Totale:</span>
                <strong>€ {totalAmount.toFixed(2)}</strong>
              </div>
            </div>

            <div className="cart-actions">
              <a href="/cart" className="btn btn-secondary">
                Vedi Carrello
              </a>
              <a href="/checkout" className="btn btn-primary">
                Checkout
              </a>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .cart-popup {
          position: absolute;
          top: 100%;
          right: 0;
          width: 380px;
          max-width: calc(100vw - 2rem);
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          border: 1px solid #e9ecef;
          z-index: 1000;
          animation: slideIn 0.2s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .cart-popup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #f0f0f0;
        }

        .cart-popup-header h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-navy);
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          color: #666;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: #f0f0f0;
          color: #333;
        }

        .cart-popup-content {
          max-height: 400px;
          overflow-y: auto;
        }

        .empty-cart {
          padding: 2rem;
          text-align: center;
          color: #666;
        }

        .empty-cart svg {
          color: #ccc;
          margin-bottom: 0.5rem;
        }

        .empty-cart p {
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .empty-cart small {
          font-size: 0.85rem;
          opacity: 0.8;
        }

        .cart-items {
          padding: 0.75rem 0;
        }

        .cart-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          border-bottom: 1px solid #f8f9fa;
          transition: background-color 0.2s ease;
        }

        .cart-item:hover {
          background: #fafbfc;
        }

        .cart-item:last-child {
          border-bottom: none;
        }

        .item-image {
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 6px;
          background: #f8f9fa;
        }

        .item-details {
          flex: 1;
          min-width: 0;
        }

        .item-details h4 {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-navy);
          margin: 0 0 0.25rem 0;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item-price {
          font-size: 0.85rem;
          color: var(--color-brown);
          font-weight: 600;
          margin: 0 0 0.25rem 0;
        }

        .item-type {
          background: var(--color-cream);
          color: var(--color-brown);
          padding: 0.1rem 0.5rem;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .item-controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: #f8f9fa;
          border-radius: 6px;
          padding: 0.1rem;
        }

        .qty-btn {
          width: 24px;
          height: 24px;
          border: none;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          color: #666;
        }

        .qty-btn:hover:not(:disabled) {
          background: var(--color-brown);
          color: white;
        }

        .qty-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .qty-display {
          min-width: 24px;
          text-align: center;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-navy);
        }

        .remove-btn {
          width: 24px;
          height: 24px;
          border: none;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .remove-btn:hover {
          background: #dc2626;
          color: white;
        }

        .more-items {
          padding: 0.5rem 1.25rem;
          font-size: 0.8rem;
          color: #666;
          font-style: italic;
          text-align: center;
          background: #f8f9fa;
        }

        .cart-summary {
          padding: 0.75rem 1.25rem;
          border-top: 1px solid #f0f0f0;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1rem;
        }

        .total-row strong {
          color: var(--color-brown);
          font-size: 1.1rem;
        }

        .cart-actions {
          display: flex;
          gap: 0.5rem;
          padding: 1rem 1.25rem;
          border-top: 1px solid #f0f0f0;
        }

        .cart-actions .btn {
          flex: 1;
          text-align: center;
          padding: 0.6rem 1rem;
          font-size: 0.85rem;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 480px) {
          .cart-popup {
            width: calc(100vw - 2rem);
            right: 1rem;
          }
          
          .cart-item {
            padding: 0.5rem 1rem;
          }
          
          .item-details h4 {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  )
}