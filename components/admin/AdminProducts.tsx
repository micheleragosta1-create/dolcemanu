"use client"

import { useEffect, useState } from 'react'
import { useAdmin } from '@/hooks/useAdmin'
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Package,
  Euro,
  AlertCircle,
  Image as ImageIcon
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
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [sortKey, setSortKey] = useState<'name' | 'price' | 'stock' | 'category'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image_url: '',
    category: ''
  })

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
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      image_url: '',
      category: ''
    })
    setShowProductModal(true)
  }

  const openEditProduct = (product: any) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: (product.stock_quantity ?? 0).toString(),
      image_url: product.image_url || '',
      category: product.category || ''
    })
    setShowProductModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock),
      image_url: formData.image_url || '',
      category: formData.category || ''
    }

    try {
      if (editingProduct) {
        await editProduct(editingProduct.id, productData)
      } else {
        await addProduct(productData)
      }
      setShowProductModal(false)
      fetchProducts()
    } catch (error) {
      alert(`Errore: ${error}`)
    }
  }

  const handleDelete = async (productId: string) => {
    if (confirm('Sei sicuro di voler eliminare questo prodotto?')) {
      try {
        await removeProduct(productId)
        fetchProducts()
      } catch (error) {
        alert(`Errore: ${error}`)
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
    if (stock === 0) return 'text-red-600 bg-red-100'
    if (stock < 10) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
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

  // Sottocomponente per la card prodotto con descrizione espandibile
  const ProductCard = ({ product }: { product: any }) => {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
      <div className="card overflow-hidden hover:shadow-lg transition-shadow">
        {/* Immagine prodotto */}
        <div className="h-48 bg-gray-100 flex items-center justify-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-gray-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Nessuna immagine</p>
            </div>
          )}
        </div>

        {/* Informazioni prodotto */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">
              {product.name}
            </h3>
            <span className="text-lg font-bold text-pink-600">
              {formatCurrency(product.price)}
            </span>
          </div>

          {/* Descrizione con toggle */}
          <div className="relative mb-3">
            <p
              className={
                `text-gray-700 text-sm whitespace-pre-line ` +
                (isExpanded ? '' : 'line-clamp-3 pr-6')
              }
            >
              {product.description}
            </p>
            {!isExpanded && (
              <div className="absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white to-transparent pointer-events-none" />
            )}
            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={() => setIsExpanded((v) => !v)}
              className="mt-1 text-xs font-medium text-pink-600 hover:text-pink-700 focus:outline-none"
            >
              {isExpanded ? 'Chiudi' : 'Mostra tutto'}
            </button>
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockColor(product.stock_quantity)}`}>
              {getStockLabel(product.stock_quantity)}
            </span>
            <span className="text-sm text-gray-500">
              Stock: {product.stock_quantity}
            </span>
          </div>

          {product.category && (
            <p className="text-xs text-gray-500 mb-4">
              Categoria: <span className="inline-block px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-md text-gray-700">{product.category}</span>
            </p>
          )}

          {/* Azioni */}
          <div className="flex space-x-2">
            <button
              onClick={() => openEditProduct(product)}
              className="btn btn-secondary small flex-1 flex items-center justify-center"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Modifica
            </button>
            <button
              onClick={() => handleDelete(product.id)}
              className="btn btn-primary small flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-container" style={{ padding: '2rem' }}>
      {/* Header e filtri */}
      <div className="card" style={{marginBottom:'1.5rem'}}>
        <div className="card-head">
          <h3>Gestione Prodotti</h3>
          <button onClick={openAddProduct} className="btn btn-primary flex items-center">
            <Plus className="w-4 h-4 mr-2" /> Nuovo Prodotto
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
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Lista prodotti in tabella: una riga per prodotto */}
      <div className="card">
        <div className="card-head"><h3>Prodotti</h3></div>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{cursor:'pointer'}} onClick={()=>handleSort('name')}>Nome {sortKey==='name' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th style={{cursor:'pointer'}} onClick={()=>handleSort('price')}>Prezzo {sortKey==='price' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th style={{cursor:'pointer'}} onClick={()=>handleSort('stock')}>Stock {sortKey==='stock' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th style={{cursor:'pointer'}} onClick={()=>handleSort('category')}>Categoria {sortKey==='category' ? (sortDir==='asc'?'↑':'↓') : ''}</th>
                <th>Immagine</th>
                <th>Stato</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map(product => (
                <tr key={product.id}>
                  <td className="semibold">{product.name}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>{product.stock_quantity}</td>
                  <td>{product.category || '-'}</td>
                  <td>
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} style={{width:48,height:36,objectFit:'cover',borderRadius:6}} />
                    ) : (
                      <span className="text-gray-400">N/D</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${product.stock_quantity === 0 ? 'cancelled' : product.stock_quantity < 10 ? 'pending' : 'delivered'}`}>
                      {getStockLabel(product.stock_quantity)}
                    </span>
                  </td>
                  <td>
                    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                      <button onClick={() => openEditProduct(product)} className="btn btn-secondary small">
                        <Edit3 className="w-4 h-4 mr-1" /> Modifica
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="btn btn-primary small">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="card-body" style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem'}}>
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
      </div>

      {filteredProducts.length === 0 && (
        <div className="card text-center py-12 text-gray-500">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Nessun prodotto trovato</p>
          <p className="text-sm">Prova a modificare i filtri di ricerca o aggiungi un nuovo prodotto</p>
        </div>
      )}

      {/* Modal prodotto */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingProduct ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
                </h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Prodotto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Nome del prodotto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrizione *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Descrizione del prodotto"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prezzo (€) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL Immagine
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="es. Dolci, Bevande, etc."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="btn btn-secondary"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editingProduct ? 'Aggiorna' : 'Crea'} Prodotto
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
