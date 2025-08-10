"use client"

import { useProducts } from '@/hooks/useSupabase'
import { useAuth } from './AuthContext'

export default function SupabaseTest() {
  const { products, loading, error } = useProducts()
  const { user, signOut } = useAuth()

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">🧪 Test Integrazione Supabase</h2>
      
      {/* Test Autenticazione */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">🔐 Stato Autenticazione</h3>
        {user ? (
          <div className="space-y-2">
            <p className="text-green-600">✅ Utente autenticato</p>
            <p><strong>Email:</strong> {user.email}</p>
            <button
              onClick={() => signOut()}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-orange-600">⚠️ Non autenticato</p>
            <a
              href="/auth"
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 inline-block"
            >
              Vai al Login
            </a>
          </div>
        )}
      </div>

      {/* Test Prodotti */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">📦 Test Prodotti Database</h3>
        
        {loading && <p className="text-blue-600">🔄 Caricamento prodotti...</p>}
        
        {error && (
          <div className="text-red-600 p-2 bg-red-50 rounded">
            ❌ Errore: {error}
          </div>
        )}
        
        {products && products.length > 0 && (
          <div className="space-y-2">
            <p className="text-green-600">✅ {products.length} prodotti caricati da Supabase</p>
            <div className="space-y-1 text-sm">
              {products.map(product => (
                <div key={product.id} className="flex justify-between items-center p-2 bg-white rounded border">
                  <span>{product.name}</span>
                  <span className="font-semibold">€{product.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {products && products.length === 0 && !loading && (
          <p className="text-orange-600">⚠️ Nessun prodotto trovato</p>
        )}
      </div>

      {/* Test Connessione */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">🔌 Test Connessione</h3>
        <div className="space-y-2 text-sm">
          <p><strong>URL Supabase:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurato' : '❌ Non configurato'}</p>
          <p><strong>Chiave Supabase:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurato' : '❌ Non configurato'}</p>
          <p><strong>Hook useProducts:</strong> ✅ Importato correttamente</p>
          <p><strong>Hook useAuth:</strong> ✅ Importato correttamente</p>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-600">
        <p>Questo componente mostra lo stato dell'integrazione Supabase</p>
        <p>Rimuovilo quando sei sicuro che tutto funzioni</p>
      </div>
    </div>
  )
}
