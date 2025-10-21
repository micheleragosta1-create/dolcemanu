"use client"

import { useEffect, useState } from 'react'
import { useAdmin } from '@/hooks/useAdmin'
import { uploadProductImage } from '@/lib/image-upload'
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Package,
  Euro,
  AlertCircle,
  Image as ImageIcon,
  X,
  Upload,
  Loader
} from 'lucide-react'

export default function AdminProducts() {
  const { 
    fetchProducts, 
    addProduct, 
    editProduct, 
    removeProduct,
    products, 
    productsLoading 
  } = useAdmin()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [sortKey, setSortKey] = useState<'name' | 'price' | 'stock' | 'category'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [boxFormats, setBoxFormats] = useState<{[key: string]: { enabled: boolean; price: string }}>({
    '6': { enabled: false, price: '' },
    '9': { enabled: false, price: '' },
    '12': { enabled: false, price: '' }
  })
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image_url: '',
    category: '',
    collection: '',
    chocolate_type: '',
    is_new: true,
    is_bestseller: false,
    discount_percentage: ''
  })
  
  // Collezioni predefinite
  const collections = [
    'Costiera Amalfitana',
    'Tradizione Napoletana',
    'Sapori di Sicilia',
    'Dolci Mediterranei',
    'Limited Edition',
    'Stagionale',
    'Praline dal Mondo'
  ]
  
  // Tipi di cioccolato
  const chocolateTypes = [
    'fondente',
    'latte',
    'bianco',
    'ruby',
    'misto'
  ]

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1
    let va: any = ''
    let vb: any = ''
    switch (sortKey) {
      case 'name': va = (a.name||'').toLowerCase(); vb = (b.name||'').toLowerCase(); break
      case 'price': va = a.price||0; vb = b.price||0; break
      case 'stock': va = (a as any).stock_quantity||0; vb = (b as any).stock_quantity||0; break
      case 'category': va = (a.category||'').toLowerCase(); vb = (b.category||'').toLowerCase(); break
    }
    if (va < vb) return -1 * dir
    if (va > vb) return 1 * dir
    return 0
  })

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * pageSize
  const paginatedProducts = sortedProducts.slice(pageStart, pageStart + pageSize)

  const openAddProduct = () => {
    setEditingProduct(null)
    setImageFile(null)
    setImagePreview('')
    setBoxFormats({
      '6': { enabled: false, price: '' },
      '9': { enabled: false, price: '' },
      '12': { enabled: false, price: '' }
    })
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      image_url: '',
      category: '',
      collection: '',
      chocolate_type: '',
      is_new: true,
      is_bestseller: false,
      discount_percentage: ''
    })
    setSelectedProduct('new')
  }

  const openEditProduct = (product: any) => {
    setEditingProduct(product)
    setImageFile(null)
    setImagePreview(product.image_url || '')
    
    // Carica i formati box esistenti
    const existingFormats = product.box_formats || {}
    setBoxFormats({
      '6': { 
        enabled: existingFormats['6'] !== undefined, 
        price: existingFormats['6']?.toString() || '' 
      },
      '9': { 
        enabled: existingFormats['9'] !== undefined, 
        price: existingFormats['9']?.toString() || '' 
      },
      '12': { 
        enabled: existingFormats['12'] !== undefined, 
        price: existingFormats['12']?.toString() || '' 
      }
    })
    
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: (product.stock_quantity ?? 0).toString(),
      image_url: product.image_url || '',
      category: product.category || '',
      collection: (product as any).collection || '',
      chocolate_type: (product as any).chocolate_type || '',
      is_new: (product as any).is_new ?? false,
      is_bestseller: (product as any).is_bestseller ?? false,
      discount_percentage: (product as any).discount_percentage?.toString() || ''
    })
    setSelectedProduct(product)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      // Crea preview locale
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview('')
    setFormData({ ...formData, image_url: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      let imageUrl = formData.image_url

      // Se c'è un nuovo file da caricare
      if (imageFile) {
        setUploadingImage(true)
        const { url, error } = await uploadProductImage(imageFile, formData.name, true)
        setUploadingImage(false)
        
        if (error || !url) {
          alert(`Errore caricamento immagine: ${error}`)
          return
        }
        
        imageUrl = url
      }

      // Prepara i formati box selezionati
      const boxFormatsData: {[key: string]: number} = {}
      Object.entries(boxFormats).forEach(([size, data]) => {
        if (data.enabled && data.price) {
          const price = parseFloat(data.price)
          if (!isNaN(price) && price > 0) {
            boxFormatsData[size] = price
          }
        }
      })

      const productData: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock),
        image_url: imageUrl || '',
        category: formData.category || '',
        collection: formData.collection || null,
        chocolate_type: formData.chocolate_type || null,
        box_formats: Object.keys(boxFormatsData).length > 0 ? boxFormatsData : null,
        is_new: formData.is_new,
        is_bestseller: formData.is_bestseller,
        discount_percentage: formData.discount_percentage ? parseInt(formData.discount_percentage) : null
      }

      if (editingProduct) {
        const result = await editProduct(editingProduct.id, productData)
        if (result.error) {
          alert(`Errore aggiornamento: ${result.error}`)
          return
        }
        alert('Prodotto aggiornato con successo!')
      } else {
        const result = await addProduct(productData)
        if (result.error) {
          alert(`Errore creazione: ${result.error}`)
          return
        }
        alert('Prodotto creato con successo!')
      }
      
      // Chiudi il form
      setSelectedProduct(null)
      setEditingProduct(null)
      setImageFile(null)
      setImagePreview('')
      
      // Ricarica i prodotti dal database
      await fetchProducts()
    } catch (error) {
      console.error('Errore nel salvataggio prodotto:', error)
      alert(`Errore: ${error}`)
    }
  }

  const handleDelete = async (productId: string) => {
    if (confirm('Sei sicuro di voler eliminare questo prodotto? Questa azione non può essere annullata.')) {
      try {
        console.log('🗑️ Eliminazione prodotto:', productId)
        const result = await removeProduct(productId)
        
        if (result.error) {
          console.error('❌ Errore eliminazione:', result.error)
          alert(`Errore nell'eliminazione: ${result.error}`)
          return
        }
        
        console.log('✅ Prodotto eliminato con successo')
        
        // Chiudi il pannello se è aperto il prodotto eliminato
        if (selectedProduct?.id === productId) {
          setSelectedProduct(null)
        }
        
        // Ricarica la lista prodotti dal database
        await fetchProducts()
        
        alert('Prodotto eliminato con successo!')
      } catch (error) {
        console.error('❌ Errore catch eliminazione:', error)
        alert(`Errore imprevisto: ${error}`)
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getStockColor = (stock: number) => {
    if (stock === 0) return { color: '#ef4444', bgColor: '#fee2e2' }
    if (stock < 10) return { color: '#f59e0b', bgColor: '#fef3c7' }
    return { color: '#10b981', bgColor: '#d1fae5' }
  }

  const getStockLabel = (stock: number) => {
    if (stock === 0) return 'Esaurito'
    if (stock < 10) return 'Scorte basse'
    return 'Disponibile'
  }

  if (productsLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          <span className="ml-2 text-gray-600">Caricamento prodotti...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-container" style={{ padding: '2rem' }}>
      {/* Header e ricerca */}
      <div className="card" style={{marginBottom:'1.5rem'}}>
        <div className="card-head">
          <h3>Gestione Prodotti</h3>
          <button onClick={openAddProduct} className="btn-add-product">
            <Plus size={18} /> Nuovo Prodotto
          </button>
        </div>
        <div className="card-body">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cerca prodotti per nome, descrizione o categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-product"
            />
          </div>
        </div>
      </div>

      {/* Lista prodotti in tabella */}
      <div className="card">
        <div className="card-head"><h3>Prodotti ({filteredProducts.length})</h3></div>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{cursor:'pointer'}} onClick={()=>handleSort('name')}>Nome {sortKey==='name' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th style={{cursor:'pointer'}} onClick={()=>handleSort('category')}>Categoria {sortKey==='category' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th style={{cursor:'pointer'}} onClick={()=>handleSort('price')}>Prezzo {sortKey==='price' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th style={{cursor:'pointer'}} onClick={()=>handleSort('stock')}>Stock {sortKey==='stock' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map(product => {
                const stockInfo = getStockColor(product.stock_quantity)
                
                return (
                  <tr key={product.id} className={selectedProduct?.id === product.id ? 'selected-row' : ''}>
                    <td>
                      <div className="product-name-cell">
                        {product.image_url && (
                          <img src={product.image_url} alt={product.name} className="product-thumb" />
                        )}
                        <span className="semibold">{product.name}</span>
                      </div>
                    </td>
                    <td>{product.category || '-'}</td>
                    <td className="semibold">{formatCurrency(product.price)}</td>
                    <td>{product.stock_quantity}</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{
                          backgroundColor: stockInfo.bgColor,
                          color: stockInfo.color
                        }}
                      >
                        {getStockLabel(product.stock_quantity)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => openEditProduct(product)} 
                          className="btn-view-details"
                        >
                          Modifica
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)} 
                          className="btn-delete"
                          title="Elimina"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="card-body" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem',flexWrap:'wrap'}}>
          <div>
            <label style={{marginRight:8}}>Righe per pagina</label>
            <select value={pageSize} onChange={(e)=>{setPageSize(parseInt(e.target.value)); setPage(1)}} className="px-2 py-1 border border-gray-200 rounded-lg">
              {[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <button className="btn btn-secondary small" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={currentPage===1}>Precedente</button>
            <span>Pagina {currentPage} di {totalPages}</span>
            <button className="btn btn-primary small" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={currentPage===totalPages}>Successiva</button>
          </div>
        </div>

        {filteredProducts.length === 0 && (
          <div className="card-body center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Nessun prodotto trovato</p>
            <p className="text-sm">Prova a modificare i filtri di ricerca</p>
          </div>
        )}
      </div>

      {/* Pannello Dettagli Prodotto - Stile identico a ordini */}
      {selectedProduct && (
        <div className="product-details">
          <div className="details-header">
            <h2>{editingProduct ? 'Modifica Prodotto' : 'Nuovo Prodotto'}</h2>
            <button 
              className="close-btn"
              onClick={() => {
                setSelectedProduct(null)
                setEditingProduct(null)
              }}
            >
              ×
            </button>
          </div>

          <div className="details-content">
            <form onSubmit={handleSubmit} className="product-form">
              {/* Informazioni Base */}
              <div className="form-section">
                <h3>Informazioni Principali</h3>
                
                <div className="form-group">
                  <label>Nome Prodotto *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="form-input"
                    placeholder="Nome del prodotto"
                  />
                </div>

                <div className="form-group">
                  <label>Descrizione *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="form-textarea"
                    placeholder="Descrizione del prodotto"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Categoria *</label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="form-input"
                      placeholder="es. Praline, Tavolette, etc."
                    />
                  </div>

                  <div className="form-group">
                    <label>Stock *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      className="form-input"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Collezione</label>
                    <select
                      value={formData.collection}
                      onChange={(e) => setFormData({...formData, collection: e.target.value})}
                      className="form-input"
                    >
                      <option value="">Nessuna collezione</option>
                      {collections.map((col) => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                    <p className="field-hint">Raggruppa i prodotti in collezioni tematiche</p>
                  </div>

                  <div className="form-group">
                    <label>Tipo di Cioccolato</label>
                    <select
                      value={formData.chocolate_type}
                      onChange={(e) => setFormData({...formData, chocolate_type: e.target.value})}
                      className="form-input"
                    >
                      <option value="">Seleziona tipo</option>
                      {chocolateTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                    <p className="field-hint">Migliora i filtri nello shop</p>
                  </div>
                </div>

                {/* Badge e Promozioni */}
                <div className="form-section">
                  <h3>🏷️ Badge e Promozioni</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.is_new}
                          onChange={(e) => setFormData({...formData, is_new: e.target.checked})}
                        />
                        <span className="checkbox-text">
                          ⭐ Novità
                        </span>
                      </label>
                      <p className="field-hint">Mostra il badge "Novità" (auto-attivo per nuovi prodotti)</p>
                    </div>

                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.is_bestseller}
                          onChange={(e) => setFormData({...formData, is_bestseller: e.target.checked})}
                        />
                        <span className="checkbox-text">
                          🔥 Bestseller
                        </span>
                      </label>
                      <p className="field-hint">Mostra il badge "Bestseller" per prodotti più venduti</p>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>💰 Sconto (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData({...formData, discount_percentage: e.target.value})}
                      className="form-input"
                      placeholder="0"
                    />
                    <p className="field-hint">
                      Percentuale di sconto (0-100). Se maggiore di 0, mostra il badge "In Sconto"
                    </p>
                  </div>
                </div>

                <div className="form-group">
                  <label>Prezzo Base (EUR)</label>
                  <p className="field-hint">Usato solo se non selezioni formati box sotto</p>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="form-input"
                    placeholder="0.00"
                  />
                </div>

                <div className="form-group">
                  <label>Immagine Prodotto</label>
                  
                  {!imagePreview && !formData.image_url ? (
                    <div className="image-upload-area">
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleImageChange}
                        className="image-input-hidden"
                      />
                      <label htmlFor="image-upload" className="image-upload-label">
                        <Upload className="upload-icon" size={32} />
                        <span className="upload-text">Carica immagine prodotto</span>
                        <span className="upload-hint">JPG, PNG, GIF o WEBP (max 5MB)</span>
                      </label>
                    </div>
                  ) : (
                    <div className="image-preview-container">
                      <div className="image-preview">
                        <img src={imagePreview || formData.image_url} alt="Anteprima prodotto" />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="remove-image-btn"
                          title="Rimuovi immagine"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      {!imageFile && (
                        <div className="change-image-section">
                          <input
                            type="file"
                            id="image-change"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            onChange={handleImageChange}
                            className="image-input-hidden"
                          />
                          <label htmlFor="image-change" className="btn-change-image">
                            <Upload size={16} />
                            Cambia immagine
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {uploadingImage && (
                    <div className="uploading-message">
                      <Loader className="spinner" size={20} />
                      <span>Caricamento e ottimizzazione immagine...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Formati Box con Prezzi */}
              <div className="form-section">
                <h3>Formati Box Disponibili (Opzionale)</h3>
                <p className="form-hint">
                  Seleziona i formati box per questo prodotto e il prezzo specifico per ciascuno. 
                  Il "Prezzo base" sopra viene usato solo se non selezioni alcun formato.
                </p>
                
                <div className="box-formats-grid">
                  {Object.entries(boxFormats).map(([size, data]) => (
                    <div key={size} className="box-format-item">
                      <label className="box-format-checkbox">
                        <input
                          type="checkbox"
                          checked={data.enabled}
                          onChange={(e) => {
                            setBoxFormats({
                              ...boxFormats,
                              [size]: { ...data, enabled: e.target.checked }
                            })
                          }}
                        />
                        <span className="box-format-label">
                          Box da <strong>{size}</strong> praline
                        </span>
                      </label>
                      
                      {data.enabled && (
                        <div className="box-format-price-input">
                          <label className="price-label">Prezzo (EUR)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={data.price}
                            onChange={(e) => {
                              setBoxFormats({
                                ...boxFormats,
                                [size]: { ...data, price: e.target.value }
                              })
                            }}
                            className="form-input"
                            placeholder="0.00"
                            required={data.enabled}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {Object.values(boxFormats).some(f => f.enabled) && (
                  <div className="box-formats-preview">
                    <strong>Anteprima prezzi:</strong>
                    <div className="preview-items">
                      {Object.entries(boxFormats)
                        .filter(([_, data]) => data.enabled && data.price)
                        .map(([size, data]) => (
                          <span key={size} className="preview-badge">
                            {size} praline: €{parseFloat(data.price).toFixed(2)}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Azioni */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct(null)
                    setEditingProduct(null)
                  }}
                  className="btn-cancel"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <>
                      <Loader className="spinner" size={16} />
                      Caricamento...
                    </>
                  ) : (
                    `${editingProduct ? 'Aggiorna' : 'Crea'} Prodotto`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .btn-add-product {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--color-brown);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-add-product:hover {
          background: #a0522d;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
        }

        .search-input-product {
          width: 100%;
          padding: 0.8rem 1rem 0.8rem 3rem;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .search-input-product:focus {
          outline: none;
          border-color: var(--color-brown);
          box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
        }

        .product-name-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .product-thumb {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid #e9ecef;
        }

        .selected-row {
          background: #fef3c7 !important;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .btn-view-details {
          padding: 0.5rem 1rem;
          background: var(--color-brown);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .btn-view-details:hover {
          background: #a0522d;
          transform: translateY(-1px);
        }

        .btn-delete {
          padding: 0.5rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-delete:hover {
          background: #dc2626;
          transform: translateY(-1px);
        }

        /* Product Details Panel - Stile identico a /admin/orders */
        .product-details {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          margin-top: 2rem;
          overflow: hidden;
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #f0f0f0;
        }

        .details-header h2 {
          color: var(--color-navy);
          font-size: 1.3rem;
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #999;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .close-btn:hover {
          background: #f0f0f0;
          color: #666;
        }

        .details-content {
          padding: 1.5rem;
          max-height: calc(100vh - 200px);
          overflow-y: auto;
        }

        .product-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .form-section {
          border-bottom: 1px solid #e9ecef;
          padding-bottom: 1.5rem;
        }

        .form-section:last-of-type {
          border-bottom: none;
        }

        .form-section h3 {
          color: var(--color-navy);
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          color: var(--color-navy);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 0.95rem;
          font-family: inherit;
          transition: border-color 0.3s ease;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: var(--color-brown);
          box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .image-upload-area {
          margin-top: 0.5rem;
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .image-upload-area:hover {
          border-color: var(--color-brown);
          background: #fef3c7;
        }

        .image-input-hidden {
          display: none;
        }

        .image-upload-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          color: #6b7280;
        }

        .upload-icon {
          color: var(--color-brown);
        }

        .upload-text {
          font-weight: 600;
          font-size: 1rem;
          color: var(--color-navy);
        }

        .upload-hint {
          font-size: 0.85rem;
          color: #9ca3af;
        }

        .image-preview-container {
          margin-top: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .image-preview {
          position: relative;
          width: 100%;
          max-height: 300px;
          overflow: hidden;
          border-radius: 12px;
          border: 2px solid #e9ecef;
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-image-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .remove-image-btn:hover {
          background: #dc2626;
          transform: scale(1.1);
        }

        .change-image-section {
          display: flex;
          justify-content: center;
        }

        .btn-change-image {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          background: #f3f4f6;
          color: var(--color-navy);
          border: 2px solid #d1d5db;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-change-image:hover {
          background: #e5e7eb;
          border-color: var(--color-brown);
        }

        .uploading-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #fef3c7;
          border-radius: 8px;
          color: var(--color-brown);
          font-weight: 500;
          margin-top: 0.75rem;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .form-hint {
          font-size: 0.9rem;
          color: #6b7280;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .field-hint {
          font-size: 0.85rem;
          color: #9ca3af;
          margin-bottom: 0.5rem;
          font-style: italic;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: 0.75rem;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .checkbox-label:hover {
          background: #f3f4f6;
        }

        .checkbox-label input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: var(--color-brown);
        }

        .checkbox-text {
          font-size: 1rem;
          font-weight: 500;
          color: var(--color-text);
        }

        .box-formats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .box-format-item {
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.25rem;
          transition: all 0.3s ease;
        }

        .box-format-item:has(input[type="checkbox"]:checked) {
          border-color: var(--color-brown);
          background: #fef3c7;
        }

        .box-format-checkbox {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          margin-bottom: 1rem;
        }

        .box-format-checkbox input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: var(--color-brown);
        }

        .box-format-label {
          font-size: 1rem;
          color: var(--color-navy);
        }

        .box-format-label strong {
          font-size: 1.3rem;
          color: var(--color-brown);
        }

        .box-format-price-input {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .price-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-navy);
          margin-bottom: 0.5rem;
        }

        .box-formats-preview {
          background: #e0f2fe;
          border: 2px solid #7dd3fc;
          border-radius: 12px;
          padding: 1.25rem;
          margin-top: 1.5rem;
        }

        .box-formats-preview strong {
          color: #0369a1;
          font-size: 0.95rem;
          display: block;
          margin-bottom: 0.75rem;
        }

        .preview-items {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .preview-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background: white;
          border: 2px solid #7dd3fc;
          border-radius: 999px;
          color: #0369a1;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e9ecef;
        }

        .btn-cancel {
          padding: 0.75rem 1.5rem;
          background: #f3f4f6;
          border: 2px solid #d1d5db;
          color: #374151;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-cancel:hover {
          background: #e5e7eb;
          border-color: #9ca3af;
        }

        .btn-submit {
          padding: 0.75rem 1.5rem;
          background: var(--color-brown);
          border: none;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
        }

        .btn-submit:hover:not(:disabled) {
          background: #a0522d;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .details-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .form-row,
          .nutrition-grid {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn-cancel,
          .btn-submit {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
