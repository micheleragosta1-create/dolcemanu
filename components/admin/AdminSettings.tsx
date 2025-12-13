"use client"

import { useState, useEffect } from 'react'
import { Save, Truck, Package, AlertCircle, Check, Euro, Gift } from 'lucide-react'

interface Settings {
  shipping_cost: string
  free_shipping_threshold: string
  shipping_enabled: string
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({
    shipping_cost: '5.00',
    free_shipping_threshold: '50.00',
    shipping_enabled: 'true'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings({
          shipping_cost: data.shipping_cost || '5.00',
          free_shipping_threshold: data.free_shipping_threshold || '50.00',
          shipping_enabled: data.shipping_enabled || 'true'
        })
      }
    } catch (error) {
      console.error('Errore caricamento impostazioni:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Impostazioni salvate con successo!' })
      } else {
        throw new Error('Errore salvataggio')
      }
    } catch (error) {
      console.error('Errore salvataggio:', error)
      setMessage({ type: 'error', text: 'Errore durante il salvataggio. Riprova.' })
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(null), 5000)
    }
  }

  if (loading) {
    return (
      <div className="settings-loading">
        <div className="spinner"></div>
        <p>Caricamento impostazioni...</p>
      </div>
    )
  }

  return (
    <div className="admin-settings">
      <div className="settings-header">
        <h2>
          <Package size={24} />
          Impostazioni Sito
        </h2>
        <p className="settings-subtitle">
          Configura le opzioni di spedizione e altre impostazioni del negozio
        </p>
      </div>

      {message && (
        <div className={`settings-message ${message.type}`}>
          {message.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      {/* Sezione Spedizioni */}
      <div className="settings-section">
        <div className="section-header">
          <Truck size={22} />
          <div>
            <h3>Spedizioni</h3>
            <p>Configura i costi e le soglie per le spedizioni</p>
          </div>
        </div>

        <div className="settings-grid">
          {/* Costo Spedizione */}
          <div className="setting-card">
            <div className="setting-icon">
              <Euro size={24} />
            </div>
            <div className="setting-content">
              <label htmlFor="shipping_cost">Costo Spedizione Standard</label>
              <p className="setting-description">
                Il costo applicato per ogni ordine (in EUR)
              </p>
              <div className="input-with-suffix">
                <input
                  type="number"
                  id="shipping_cost"
                  value={settings.shipping_cost}
                  onChange={(e) => setSettings({ ...settings, shipping_cost: e.target.value })}
                  min="0"
                  step="0.01"
                  placeholder="5.00"
                />
                <span className="suffix">€</span>
              </div>
            </div>
          </div>

          {/* Soglia Spedizione Gratuita */}
          <div className="setting-card">
            <div className="setting-icon gift">
              <Gift size={24} />
            </div>
            <div className="setting-content">
              <label htmlFor="free_shipping_threshold">Soglia Spedizione Gratuita</label>
              <p className="setting-description">
                Ordini sopra questa soglia hanno spedizione gratuita
              </p>
              <div className="input-with-suffix">
                <input
                  type="number"
                  id="free_shipping_threshold"
                  value={settings.free_shipping_threshold}
                  onChange={(e) => setSettings({ ...settings, free_shipping_threshold: e.target.value })}
                  min="0"
                  step="0.01"
                  placeholder="50.00"
                />
                <span className="suffix">€</span>
              </div>
            </div>
          </div>

          {/* Toggle Spedizioni Attive */}
          <div className="setting-card full-width">
            <div className="setting-icon toggle-icon">
              <Truck size={24} />
            </div>
            <div className="setting-content toggle-content">
              <div>
                <label>Spedizioni Attive</label>
                <p className="setting-description">
                  Abilita o disabilita le spedizioni nel checkout
                </p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.shipping_enabled === 'true'}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    shipping_enabled: e.target.checked ? 'true' : 'false' 
                  })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Anteprima */}
      <div className="settings-preview">
        <h4>📦 Anteprima Carrello</h4>
        <div className="preview-content">
          <div className="preview-row">
            <span>Subtotale</span>
            <span>€ 45.00</span>
          </div>
          <div className="preview-row shipping">
            <span>Spedizione</span>
            <span>
              {parseFloat(settings.free_shipping_threshold) > 45 
                ? `€ ${parseFloat(settings.shipping_cost).toFixed(2)}`
                : <span className="free">GRATIS</span>
              }
            </span>
          </div>
          <div className="preview-row total">
            <span>Totale</span>
            <span>
              € {parseFloat(settings.free_shipping_threshold) > 45 
                ? (45 + parseFloat(settings.shipping_cost)).toFixed(2)
                : '45.00'
              }
            </span>
          </div>
          {parseFloat(settings.free_shipping_threshold) > 45 && (
            <div className="preview-hint">
              💡 Aggiungi € {(parseFloat(settings.free_shipping_threshold) - 45).toFixed(2)} per la spedizione gratuita!
            </div>
          )}
        </div>
      </div>

      {/* Pulsante Salva */}
      <div className="settings-actions">
        <button 
          className="save-button"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <span className="spinner-small"></span>
              Salvataggio...
            </>
          ) : (
            <>
              <Save size={20} />
              Salva Impostazioni
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        .admin-settings {
          max-width: 800px;
        }

        .settings-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          color: #6b7280;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top-color: var(--color-brown);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        .spinner-small {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .settings-header {
          margin-bottom: 2rem;
        }

        .settings-header h2 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-navy);
          margin-bottom: 0.5rem;
        }

        .settings-subtitle {
          color: #6b7280;
          font-size: 0.95rem;
        }

        .settings-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-weight: 500;
        }

        .settings-message.success {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #bbf7d0;
        }

        .settings-message.error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .settings-section {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          border: 1px solid #e5e7eb;
        }

        .section-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .section-header svg {
          color: var(--color-brown);
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .section-header h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--color-navy);
          margin-bottom: 0.25rem;
        }

        .section-header p {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .setting-card {
          display: flex;
          gap: 1rem;
          padding: 1.25rem;
          background: #f9fafb;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .setting-card.full-width {
          grid-column: 1 / -1;
        }

        .setting-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--color-brown), #8b5a3c);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .setting-icon.gift {
          background: linear-gradient(135deg, #059669, #10b981);
        }

        .setting-icon.toggle-icon {
          background: linear-gradient(135deg, #3b82f6, #60a5fa);
        }

        .setting-content {
          flex: 1;
        }

        .setting-content label {
          display: block;
          font-weight: 600;
          color: var(--color-navy);
          margin-bottom: 0.25rem;
          font-size: 0.95rem;
        }

        .setting-description {
          font-size: 0.8rem;
          color: #6b7280;
          margin-bottom: 0.75rem;
        }

        .input-with-suffix {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-suffix input {
          width: 100%;
          padding: 0.75rem 2.5rem 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--color-navy);
          transition: all 0.2s;
        }

        .input-with-suffix input:focus {
          outline: none;
          border-color: var(--color-brown);
          box-shadow: 0 0 0 3px rgba(94, 54, 33, 0.1);
        }

        .input-with-suffix .suffix {
          position: absolute;
          right: 1rem;
          color: #6b7280;
          font-weight: 600;
        }

        .toggle-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .toggle-content > div {
          flex: 1;
        }

        .toggle-content .setting-description {
          margin-bottom: 0;
        }

        .toggle-switch {
          position: relative;
          width: 56px;
          height: 30px;
          flex-shrink: 0;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #d1d5db;
          border-radius: 30px;
          transition: 0.3s;
        }

        .toggle-slider::before {
          position: absolute;
          content: "";
          height: 24px;
          width: 24px;
          left: 3px;
          bottom: 3px;
          background: white;
          border-radius: 50%;
          transition: 0.3s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }

        .toggle-switch input:checked + .toggle-slider {
          background: linear-gradient(135deg, #059669, #10b981);
        }

        .toggle-switch input:checked + .toggle-slider::before {
          transform: translateX(26px);
        }

        .settings-preview {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border: 2px dashed #d1d5db;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .settings-preview h4 {
          font-size: 1rem;
          color: var(--color-navy);
          margin-bottom: 1rem;
        }

        .preview-content {
          background: white;
          border-radius: 12px;
          padding: 1rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .preview-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          font-size: 0.9rem;
          color: #4b5563;
        }

        .preview-row.shipping {
          border-top: 1px dashed #e5e7eb;
        }

        .preview-row.total {
          border-top: 2px solid #e5e7eb;
          font-weight: 700;
          color: var(--color-navy);
          font-size: 1rem;
          padding-top: 0.75rem;
          margin-top: 0.25rem;
        }

        .preview-row .free {
          color: #059669;
          font-weight: 600;
        }

        .preview-hint {
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: #fef3c7;
          border-radius: 8px;
          font-size: 0.8rem;
          color: #92400e;
          text-align: center;
        }

        .settings-actions {
          display: flex;
          justify-content: flex-end;
        }

        .save-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.75rem;
          background: linear-gradient(135deg, var(--color-brown), #8b5a3c);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(94, 54, 33, 0.25);
        }

        .save-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(94, 54, 33, 0.35);
        }

        .save-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }

          .setting-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .toggle-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .settings-header h2 {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  )
}

