"use client"

import { useState, useMemo, useEffect } from 'react'
import Image from 'next/image'
import { useCartWithToast } from '@/components/useCartWithToast'
import type { Product } from '@/lib/supabase'
import { 
  Package, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Check,
  X,
  Sparkles
} from 'lucide-react'

interface BoxConfiguratorProps {
  pralines: Product[]
}

interface SelectedPraline {
  product: Product
  quantity: number
}

// Ottiene il prezzo unitario della pralina (single_price o price)
const getPralinePrice = (product: Product): number => {
  return (product as any).single_price || product.price || 0
}

export default function BoxConfigurator({ pralines }: BoxConfiguratorProps) {
  const { addItem } = useCartWithToast()
  const [boxSize, setBoxSize] = useState<8 | 16>(8)
  const [selections, setSelections] = useState<Map<string, SelectedPraline>>(new Map())
  const [isAdding, setIsAdding] = useState(false)

  // Calcola il totale praline selezionate
  const totalSelected = useMemo(() => {
    return Array.from(selections.values()).reduce((sum, sel) => sum + sel.quantity, 0)
  }, [selections])

  // Praline rimanenti da selezionare
  const remaining = boxSize - totalSelected

  // Calcola il prezzo totale della box (somma dei prezzi unitari)
  const totalPrice = useMemo(() => {
    return Array.from(selections.values()).reduce((sum, sel) => {
      const unitPrice = getPralinePrice(sel.product)
      return sum + (unitPrice * sel.quantity)
    }, 0)
  }, [selections])

  // Aggiunge una pralina alla selezione
  const addPraline = (product: Product) => {
    if (remaining <= 0) return

    setSelections(prev => {
      const newMap = new Map(prev)
      const existing = newMap.get(product.id)
      if (existing) {
        newMap.set(product.id, { ...existing, quantity: existing.quantity + 1 })
      } else {
        newMap.set(product.id, { product, quantity: 1 })
      }
      return newMap
    })
  }

  // Rimuove una pralina dalla selezione
  const removePraline = (productId: string) => {
    setSelections(prev => {
      const newMap = new Map(prev)
      const existing = newMap.get(productId)
      if (existing) {
        if (existing.quantity > 1) {
          newMap.set(productId, { ...existing, quantity: existing.quantity - 1 })
        } else {
          newMap.delete(productId)
        }
      }
      return newMap
    })
  }

  // Reset selezioni quando cambia la dimensione box
  useEffect(() => {
    setSelections(new Map())
  }, [boxSize])

  // Aggiunge la box configurata al carrello
  const addBoxToCart = () => {
    if (remaining > 0) return

    setIsAdding(true)

    // Crea descrizione delle praline selezionate
    const pralinesList = Array.from(selections.values())
      .map(sel => `${sel.quantity}x ${sel.product.name}`)
      .join(', ')

    // Crea l'item per il carrello
    const boxItem = {
      id: `custom-box-${boxSize}-${Date.now()}`,
      nome: `Box Personalizzata ${boxSize} Praline`,
      prezzo: totalPrice,
      immagine: '/images/custom-box.png',
      tipo: 'box-personalizzata',
      pezzi: boxSize,
      customDetails: pralinesList
    }

    addItem(boxItem)

    // Reset dopo aggiunta
    setTimeout(() => {
      setSelections(new Map())
      setIsAdding(false)
    }, 500)
  }

  // Ottieni la quantità selezionata per una pralina
  const getSelectedQty = (productId: string) => {
    return selections.get(productId)?.quantity || 0
  }

  return (
    <div className="box-configurator">
      {/* Header */}
      <div className="configurator-header">
        <div className="header-icon">
          <Package size={32} />
        </div>
        <h2>Configura la tua Box</h2>
        <p>Scegli le praline che preferisci e crea la tua combinazione perfetta</p>
      </div>

      {/* Selezione dimensione box */}
      <div className="box-size-selection">
        <h3>
          <Sparkles size={20} />
          Scegli la dimensione
        </h3>
        <div className="size-options">
          <button
            className={`size-option ${boxSize === 8 ? 'active' : ''}`}
            onClick={() => setBoxSize(8)}
          >
            <span className="size-number">8</span>
            <span className="size-label">praline</span>
          </button>
          <button
            className={`size-option ${boxSize === 16 ? 'active' : ''}`}
            onClick={() => setBoxSize(16)}
          >
            <span className="size-number">16</span>
            <span className="size-label">praline</span>
            <span className="size-badge">Più scelta!</span>
          </button>
        </div>
        <p className="price-info">
          💡 Il prezzo finale dipenderà dalle praline che sceglierai
        </p>
      </div>

      {/* Progress bar */}
      <div className="selection-progress">
        <div className="progress-info">
          <span>
            <strong>{totalSelected}</strong> di <strong>{boxSize}</strong> praline selezionate
          </span>
          {remaining > 0 ? (
            <span className="remaining">Seleziona ancora {remaining} praline</span>
          ) : (
            <span className="complete">
              <Check size={16} /> Selezione completa!
            </span>
          )}
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(totalSelected / boxSize) * 100}%` }}
          />
        </div>
      </div>

      {/* Riepilogo selezione */}
      {selections.size > 0 && (
        <div className="selection-summary">
          <div className="summary-header">
            <h4>La tua selezione:</h4>
            <span className="running-total">Totale: €{totalPrice.toFixed(2)}</span>
          </div>
          <div className="selected-items">
            {Array.from(selections.values()).map(sel => {
              const unitPrice = getPralinePrice(sel.product)
              const subtotal = unitPrice * sel.quantity
              return (
                <div key={sel.product.id} className="selected-item">
                  <div className="item-thumb">
                    <Image
                      src={sel.product.image_url}
                      alt={sel.product.name}
                      width={40}
                      height={40}
                      style={{ objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </div>
                  <div className="item-details">
                    <span className="item-name">{sel.product.name}</span>
                    <span className="item-price">€{unitPrice.toFixed(2)} cad.</span>
                  </div>
                  <div className="item-controls">
                    <button 
                      className="qty-btn"
                      onClick={() => removePraline(sel.product.id)}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="item-qty">{sel.quantity}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => addPraline(sel.product)}
                      disabled={remaining <= 0}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="item-subtotal">€{subtotal.toFixed(2)}</span>
                </div>
              )
            })}
          </div>
          <button 
            className="clear-btn"
            onClick={() => setSelections(new Map())}
          >
            <X size={16} /> Svuota selezione
          </button>
        </div>
      )}

      {/* Griglia praline disponibili */}
      <div className="pralines-section">
        <h3>Scegli le tue praline</h3>
        <div className="pralines-grid">
          {pralines.map(praline => {
            const selectedQty = getSelectedQty(praline.id)
            const isSelected = selectedQty > 0
            const canAdd = remaining > 0
            const unitPrice = getPralinePrice(praline)

            return (
              <div 
                key={praline.id} 
                className={`praline-card ${isSelected ? 'selected' : ''} ${!canAdd && !isSelected ? 'disabled' : ''}`}
              >
                {isSelected && (
                  <div className="selected-badge">
                    <span>{selectedQty}</span>
                  </div>
                )}
                
                <div className="praline-image">
                  <Image
                    src={praline.image_url}
                    alt={praline.name}
                    fill
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                
                <div className="praline-info">
                  <h4>{praline.name}</h4>
                  {praline.description && (
                    <p className="praline-desc">{praline.description}</p>
                  )}
                  <div className="praline-meta">
                    {praline.chocolate_type && (
                      <span className="praline-type">{praline.chocolate_type}</span>
                    )}
                    <span className="praline-price">€{unitPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="praline-actions">
                  {isSelected ? (
                    <div className="qty-controls">
                      <button 
                        className="qty-btn remove"
                        onClick={() => removePraline(praline.id)}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="qty-display">{selectedQty}</span>
                      <button 
                        className="qty-btn add"
                        onClick={() => addPraline(praline)}
                        disabled={!canAdd}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="add-praline-btn"
                      onClick={() => addPraline(praline)}
                      disabled={!canAdd}
                    >
                      <Plus size={18} />
                      Aggiungi
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer con totale e pulsante aggiungi */}
      <div className="configurator-footer">
        <div className="footer-info">
          <div className="total-section">
            <span className="total-label">Totale Box:</span>
            <span className="total-price">€{totalPrice.toFixed(2)}</span>
          </div>
          {totalSelected > 0 && (
            <div className="price-breakdown">
              {totalSelected} preline × prezzo unitario
            </div>
          )}
        </div>
        
        <button 
          className={`add-to-cart-btn ${remaining === 0 ? 'ready' : ''}`}
          onClick={addBoxToCart}
          disabled={remaining > 0 || isAdding}
        >
          {isAdding ? (
            <>Aggiunto! ✓</>
          ) : remaining > 0 ? (
            <>Seleziona ancora {remaining} praline</>
          ) : (
            <>
              <ShoppingCart size={20} />
              Aggiungi al carrello - €{totalPrice.toFixed(2)}
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        .box-configurator {
          background: white;
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
        }

        .configurator-header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .header-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--color-brown) 0%, #6d3d0f 100%);
          border-radius: 16px;
          color: white;
          margin-bottom: 1rem;
        }

        .configurator-header h2 {
          font-size: 2rem;
          color: var(--color-navy);
          margin: 0 0 0.5rem 0;
          font-family: 'Poppins', sans-serif;
        }

        .configurator-header p {
          color: #666;
          margin: 0;
          font-size: 1.1rem;
        }

        /* Box Size Selection */
        .box-size-selection {
          margin-bottom: 2rem;
        }

        .box-size-selection h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.1rem;
          color: var(--color-navy);
          margin-bottom: 1rem;
        }

        .size-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .size-option {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.5rem;
          border: 3px solid #e9ecef;
          border-radius: 16px;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .size-option:hover {
          border-color: var(--color-brown);
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(139, 69, 19, 0.15);
        }

        .size-option.active {
          border-color: var(--color-brown);
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        }

        .size-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--color-brown);
        }

        .size-label {
          font-size: 0.9rem;
          color: #666;
        }

        .size-badge {
          position: absolute;
          top: -10px;
          right: -10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 700;
        }

        .price-info {
          text-align: center;
          margin-top: 1rem;
          font-size: 0.9rem;
          color: #666;
          background: #f8f9fa;
          padding: 0.75rem;
          border-radius: 8px;
        }

        /* Progress Bar */
        .selection-progress {
          background: #f8f9fa;
          padding: 1.25rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .progress-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
        }

        .remaining {
          color: #f59e0b;
          font-weight: 600;
        }

        .complete {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #10b981;
          font-weight: 600;
        }

        .progress-bar {
          height: 8px;
          background: #e9ecef;
          border-radius: 999px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-brown) 0%, #f59e0b 100%);
          border-radius: 999px;
          transition: width 0.3s ease;
        }

        /* Selection Summary */
        .selection-summary {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          padding: 1.25rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          border: 2px solid var(--color-brown);
        }

        .summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .summary-header h4 {
          font-size: 0.95rem;
          color: var(--color-navy);
          margin: 0;
        }

        .running-total {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-brown);
        }

        .selected-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .selected-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: white;
          padding: 0.5rem;
          border-radius: 8px;
        }

        .item-thumb {
          flex-shrink: 0;
        }

        .item-details {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .item-name {
          font-weight: 500;
          font-size: 0.9rem;
        }

        .item-price {
          font-size: 0.75rem;
          color: #666;
        }

        .item-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .qty-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          border-radius: 6px;
          background: #e9ecef;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .qty-btn:hover:not(:disabled) {
          background: var(--color-brown);
          color: white;
        }

        .qty-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .item-qty {
          font-weight: 700;
          min-width: 24px;
          text-align: center;
        }

        .item-subtotal {
          font-weight: 700;
          color: var(--color-brown);
          min-width: 60px;
          text-align: right;
        }

        .clear-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.625rem;
          border: 2px solid #dc3545;
          border-radius: 8px;
          background: white;
          color: #dc3545;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-btn:hover {
          background: #dc3545;
          color: white;
        }

        /* Pralines Grid */
        .pralines-section h3 {
          font-size: 1.25rem;
          color: var(--color-navy);
          margin-bottom: 1.5rem;
        }

        .pralines-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .praline-card {
          position: relative;
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 16px;
          padding: 1rem;
          transition: all 0.3s ease;
        }

        .praline-card:hover:not(.disabled) {
          border-color: var(--color-brown);
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }

        .praline-card.selected {
          border-color: var(--color-brown);
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
        }

        .praline-card.disabled {
          opacity: 0.5;
        }

        .selected-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 28px;
          height: 28px;
          background: var(--color-brown);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          z-index: 10;
        }

        .praline-image {
          position: relative;
          width: 100%;
          height: 140px;
          margin-bottom: 1rem;
        }

        .praline-info h4 {
          font-size: 1rem;
          color: var(--color-navy);
          margin: 0 0 0.5rem 0;
          line-height: 1.3;
        }

        .praline-desc {
          font-size: 0.85rem;
          color: #666;
          margin: 0 0 0.5rem 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .praline-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .praline-type {
          background: #f0f0f0;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          color: #666;
          text-transform: capitalize;
        }

        .praline-price {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-brown);
        }

        .praline-actions {
          margin-top: 1rem;
        }

        .add-praline-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--color-brown) 0%, #6d3d0f 100%);
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-praline-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);
        }

        .add-praline-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .qty-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .qty-controls .qty-btn {
          width: 36px;
          height: 36px;
        }

        .qty-controls .qty-btn.remove {
          background: #fee2e2;
          color: #dc3545;
        }

        .qty-controls .qty-btn.remove:hover {
          background: #dc3545;
          color: white;
        }

        .qty-controls .qty-btn.add {
          background: #d1fae5;
          color: #10b981;
        }

        .qty-controls .qty-btn.add:hover:not(:disabled) {
          background: #10b981;
          color: white;
        }

        .qty-display {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-navy);
          min-width: 30px;
          text-align: center;
        }

        /* Footer */
        .configurator-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 16px;
          margin-top: 2rem;
          gap: 1.5rem;
        }

        .total-section {
          display: flex;
          flex-direction: column;
        }

        .total-label {
          font-size: 0.9rem;
          color: #666;
        }

        .total-price {
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-brown);
        }

        .price-breakdown {
          font-size: 0.8rem;
          color: #666;
          margin-top: 0.25rem;
        }

        .add-to-cart-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          border: none;
          border-radius: 12px;
          background: #e9ecef;
          color: #666;
          font-size: 1rem;
          font-weight: 700;
          cursor: not-allowed;
          transition: all 0.3s ease;
        }

        .add-to-cart-btn.ready {
          background: linear-gradient(135deg, var(--color-brown) 0%, #6d3d0f 100%);
          color: white;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);
        }

        .add-to-cart-btn.ready:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(139, 69, 19, 0.4);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .box-configurator {
            padding: 1.25rem;
            border-radius: 16px;
          }

          .configurator-header h2 {
            font-size: 1.5rem;
          }

          .size-options {
            grid-template-columns: 1fr;
          }

          .pralines-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .configurator-footer {
            flex-direction: column;
            text-align: center;
          }

          .add-to-cart-btn {
            width: 100%;
          }

          .selected-item {
            flex-wrap: wrap;
          }

          .item-subtotal {
            width: 100%;
            text-align: left;
            margin-top: 0.5rem;
            padding-top: 0.5rem;
            border-top: 1px dashed #ddd;
          }
        }

        @media (max-width: 480px) {
          .pralines-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
