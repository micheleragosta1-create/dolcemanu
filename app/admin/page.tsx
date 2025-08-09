"use client"

import { useState, useEffect } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Plus, Minus, Edit2, Trash2, Package } from 'lucide-react'

type Prodotto = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  stock_quantity: number
  created_at: string
  updated_at: string
}

export default function AdminPage() {
  const [prodotti, setProdotti] = useState<Prodotto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [updatingStock, setUpdatingStock] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: '',
    stock_quantity: ''
  })

  // Fetch products
  useEffect(() => {
    fetchProdotti()
  }, [])

  const fetchProdotti = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProdotti(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          image_url: formData.image_url,
          category: formData.category,
          stock_quantity: parseInt(formData.stock_quantity)
        }),
      })

      if (response.ok) {
        const newProduct = await response.json()
        setProdotti(prev => [newProduct, ...prev])
        setFormData({
          name: '',
          description: '',
          price: '',
          image_url: '',
          category: '',
          stock_quantity: ''
        })
        setShowForm(false)
        alert('Prodotto aggiunto con successo!')
      } else {
        const error = await response.json()
        alert('Errore: ' + error.error)
      }
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Errore nel salvataggio del prodotto')
    }
  }

  const updateStock = async (productId: string, newStock: number) => {
    if (newStock < 0) return // Non permettere stock negativi
    
    try {
      setUpdatingStock(productId)
      
      const response = await fetch(`/api/products/${productId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock_quantity: newStock }),
      })

      if (response.ok) {
        const updatedData = await response.json()
        
        // Aggiorna lo stato locale
        setProdotti(prev => prev.map(product => 
          product.id === productId 
            ? { ...product, stock_quantity: newStock, updated_at: updatedData.updated_at }
            : product
        ))
        
        console.log(`Stock aggiornato per prodotto ${productId}: ${newStock}`)
      } else {
        const error = await response.json()
        alert('Errore: ' + error.error)
      }
    } catch (error) {
      console.error('Errore aggiornamento stock:', error)
      alert('Errore nell\'aggiornamento dello stock')
    } finally {
      setUpdatingStock(null)
    }
  }

  const incrementStock = (productId: string, currentStock: number) => {
    updateStock(productId, currentStock + 1)
  }

  const decrementStock = (productId: string, currentStock: number) => {
    updateStock(productId, Math.max(0, currentStock - 1))
  }

  const testAPI = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      console.log('API Response:', data)
      alert(`API Test OK! Trovati ${data.length} prodotti`)
    } catch (error) {
      console.error('API Test Error:', error)
      alert('API Test FAILED!')
    }
  }

  return (
    <main>
      <Header />
      <section className="admin-section">
        <div className="admin-container">
          <div className="admin-header">
            <h1 className="poppins">Admin Panel</h1>
            <div className="admin-actions">
              <a href="/admin/orders" className="btn btn-secondary">
                Gestisci Ordini
              </a>
              <button className="btn btn-secondary" onClick={testAPI}>
                Test API
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? 'Chiudi Form' : 'Aggiungi Prodotto'}
              </button>
            </div>
          </div>

          {showForm && (
            <div className="product-form">
              <h2>Aggiungi Nuovo Prodotto</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nome Prodotto</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                      placeholder="es. Cioccolatini Artigianali"
                    />
                  </div>
                  <div className="form-group">
                    <label>Categoria</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                    >
                      <option value="">Seleziona categoria</option>
                      <option value="cioccolatini">Cioccolatini</option>
                      <option value="tavolette">Tavolette</option>
                      <option value="praline">Praline</option>
                      <option value="tartufi">Tartufi</option>
                      <option value="creme">Creme</option>
                      <option value="confezioni">Confezioni Regalo</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Descrizione</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                    placeholder="Descrizione dettagliata del prodotto..."
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Prezzo (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
                      placeholder="24.90"
                    />
                  </div>
                  <div className="form-group">
                    <label>Quantità Disponibile</label>
                    <input
                      type="number"
                      required
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData(prev => ({...prev, stock_quantity: e.target.value}))}
                      placeholder="50"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>URL Immagine</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({...prev, image_url: e.target.value}))}
                    placeholder="/images/prodotto-1.svg"
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                    Annulla
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Salva Prodotto
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="products-list">
            <h2>Gestione Prodotti ({prodotti.length})</h2>
            
            {loading ? (
              <div className="loading">Caricamento...</div>
            ) : (
              <div className="products-table">
                <div className="table-header">
                  <div className="col-image">Immagine</div>
                  <div className="col-product">Prodotto</div>
                  <div className="col-category">Categoria</div>
                  <div className="col-price">Prezzo</div>
                  <div className="col-stock">Stock</div>
                  <div className="col-actions">Azioni</div>
                </div>
                
                <div className="table-body">
                  {prodotti.map((prodotto) => (
                    <div key={prodotto.id} className="table-row">
                      <div className="col-image">
                        <img 
                          src={prodotto.image_url} 
                          alt={prodotto.name}
                          className="product-thumbnail"
                        />
                      </div>
                      
                      <div className="col-product">
                        <h3 className="product-name">{prodotto.name}</h3>
                        <p className="product-description">{prodotto.description}</p>
                        <small className="product-date">
                          Creato: {new Date(prodotto.created_at).toLocaleDateString('it-IT')}
                        </small>
                      </div>
                      
                      <div className="col-category">
                        <span className="category-badge">{prodotto.category}</span>
                      </div>
                      
                      <div className="col-price">
                        <span className="price">€ {prodotto.price.toFixed(2)}</span>
                      </div>
                      
                      <div className="col-stock">
                        <div className="stock-controls">
                          <button
                            className="stock-btn decrease"
                            onClick={() => decrementStock(prodotto.id, prodotto.stock_quantity)}
                            disabled={updatingStock === prodotto.id || prodotto.stock_quantity === 0}
                            title="Diminuisci stock"
                          >
                            <Minus size={14} />
                          </button>
                          
                          <span className={`stock-value ${prodotto.stock_quantity === 0 ? 'out-of-stock' : ''}`}>
                            {updatingStock === prodotto.id ? '...' : prodotto.stock_quantity}
                          </span>
                          
                          <button
                            className="stock-btn increase"
                            onClick={() => incrementStock(prodotto.id, prodotto.stock_quantity)}
                            disabled={updatingStock === prodotto.id}
                            title="Aumenta stock"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        
                        {prodotto.stock_quantity === 0 && (
                          <div className="stock-warning">Esaurito</div>
                        )}
                        {prodotto.stock_quantity > 0 && prodotto.stock_quantity < 10 && (
                          <div className="stock-low">Scorte basse</div>
                        )}
                      </div>
                      
                      <div className="col-actions">
                        <button className="action-btn edit" title="Modifica prodotto">
                          <Edit2 size={14} />
                        </button>
                        <button className="action-btn delete" title="Elimina prodotto">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {prodotti.length === 0 && (
                  <div className="empty-state">
                    <Package size={48} />
                    <h3>Nessun prodotto trovato</h3>
                    <p>Inizia aggiungendo il tuo primo prodotto.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />

      <style jsx global>{`
        .admin-section {
          padding: 7rem 2rem 3rem;
          background: var(--color-cream);
          min-height: 100vh;
        }
        
        .admin-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .admin-header h1 {
          font-size: 2rem;
          color: var(--color-navy);
        }

        .admin-actions {
          display: flex;
          gap: 1rem;
        }

        .product-form {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          margin-bottom: 2rem;
          box-shadow: 0 10px 30px rgba(0,0,0,.08);
        }

        .product-form h2 {
          margin-bottom: 1.5rem;
          color: var(--color-navy);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--color-navy);
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.8rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.95rem;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--color-brown);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }

        .products-list h2 {
          color: var(--color-navy);
          margin-bottom: 1.5rem;
        }

        .products-table {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,.08);
        }

        .table-header {
          display: grid;
          grid-template-columns: 80px 1fr 120px 100px 140px 100px;
          gap: 1rem;
          padding: 1rem 1.5rem;
          background: #f8f9fa;
          font-weight: 600;
          color: var(--color-navy);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e9ecef;
        }

        .table-body {
          divide-y divide-gray-100;
        }

        .table-row {
          display: grid;
          grid-template-columns: 80px 1fr 120px 100px 140px 100px;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f0f0f0;
          align-items: center;
          transition: background-color 0.3s ease;
        }

        .table-row:hover {
          background: #fafbfc;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .product-thumbnail {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          background: #f8f9fa;
        }

        .product-name {
          font-size: 1rem;
          color: var(--color-navy);
          margin-bottom: 0.25rem;
          font-weight: 600;
        }

        .product-description {
          font-size: 0.85rem;
          color: #666;
          line-height: 1.3;
          margin-bottom: 0.25rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-date {
          font-size: 0.75rem;
          color: #999;
        }

        .category-badge {
          background: var(--color-cream);
          color: var(--color-brown);
          padding: 0.3rem 0.8rem;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid var(--color-brown);
        }

        .price {
          font-weight: 700;
          color: var(--color-brown);
          font-size: 1.1rem;
        }

        .stock-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .stock-btn {
          width: 28px;
          height: 28px;
          border: 2px solid #e9ecef;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .stock-btn:hover:not(:disabled) {
          border-color: var(--color-brown);
          background: var(--color-brown);
          color: white;
        }

        .stock-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .stock-btn.decrease {
          border-color: #dc2626;
        }

        .stock-btn.decrease:hover:not(:disabled) {
          background: #dc2626;
          border-color: #dc2626;
        }

        .stock-btn.increase {
          border-color: #16a34a;
        }

        .stock-btn.increase:hover:not(:disabled) {
          background: #16a34a;
          border-color: #16a34a;
        }

        .stock-value {
          min-width: 30px;
          text-align: center;
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--color-navy);
        }

        .stock-value.out-of-stock {
          color: #dc2626;
        }

        .stock-warning {
          font-size: 0.75rem;
          color: #dc2626;
          font-weight: 600;
          text-transform: uppercase;
        }

        .stock-low {
          font-size: 0.75rem;
          color: #f59e0b;
          font-weight: 600;
        }

        .col-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border: 2px solid #e9ecef;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .action-btn.edit {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .action-btn.edit:hover {
          background: #3b82f6;
          color: white;
        }

        .action-btn.delete {
          border-color: #dc2626;
          color: #dc2626;
        }

        .action-btn.delete:hover {
          background: #dc2626;
          color: white;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        .empty-state svg {
          color: #ccc;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          color: var(--color-navy);
          margin-bottom: 0.5rem;
        }

        .loading {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .admin-section {
            padding: 6rem 1rem 2rem;
          }
          
          .admin-header {
            flex-direction: column;
            text-align: center;
          }
          
          .admin-header h1 {
            font-size: 1.6rem;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .form-actions {
            justify-content: stretch;
          }
          
          .form-actions button {
            flex: 1;
          }

          /* Mobile table layout */
          .table-header {
            display: none;
          }

          .table-row {
            display: block;
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 12px;
            border: 1px solid #e9ecef;
            background: white;
          }

          .col-image,
          .col-product,
          .col-category,
          .col-price,
          .col-stock,
          .col-actions {
            display: block;
            margin-bottom: 0.75rem;
          }

          .col-image {
            text-align: center;
            margin-bottom: 1rem;
          }

          .product-thumbnail {
            width: 80px;
            height: 80px;
          }

          .col-product {
            text-align: center;
            margin-bottom: 1rem;
          }

          .col-category::before {
            content: "Categoria: ";
            font-weight: 600;
            color: var(--color-navy);
          }

          .col-price::before {
            content: "Prezzo: ";
            font-weight: 600;
            color: var(--color-navy);
          }

          .stock-controls {
            justify-content: center;
            margin-bottom: 0.5rem;
          }

          .col-actions {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 0;
          }
        }
      `}</style>
    </main>
  )
}