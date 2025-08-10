"use client"

import { useState } from 'react'
import { useAuth } from './AuthContext'
import { useOrders } from '@/hooks/useSupabase'
import { useCartWithToast } from './useCartWithToast'

interface CheckoutData {
  email: string
  shippingAddress: string
  city: string
  postalCode: string
  country: string
}

export default function CheckoutWithSupabase() {
  const { user } = useAuth()
  const { createOrder } = useOrders(user?.email)
  const { cart, clearCart } = useCartWithToast()
  
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    email: user?.email || '',
    shippingAddress: '',
    city: '',
    postalCode: '',
    country: 'Italia'
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!user) {
        throw new Error('Devi essere autenticato per completare l\'ordine')
      }

      // Crea l'ordine principale
      const orderId = await createOrder({
        user_email: user.email,
        total_amount: totalAmount,
        status: 'pending',
        shipping_address: `${checkoutData.shippingAddress}, ${checkoutData.city}, ${checkoutData.postalCode}, ${checkoutData.country}`
      })

      if (!orderId) {
        throw new Error('Errore nella creazione dell\'ordine')
      }

      // Qui potresti creare gli item dell'ordine usando createOrderItem
      // Per ora mostriamo solo il successo
      setSuccess(true)
      clearCart()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il checkout')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-green-600 text-6xl mb-4">✓</div>
        <h2 className="text-2xl font-bold mb-2">Ordine completato!</h2>
        <p className="text-gray-600 mb-4">
          Grazie per il tuo ordine. Riceverai una conferma via email.
        </p>
        <button
          onClick={() => window.location.href = '/shop'}
          className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
        >
          Continua lo shopping
        </button>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Accesso richiesto</h2>
        <p className="text-gray-600 mb-4">
          Devi accedere per completare l'ordine
        </p>
        <a
          href="/auth"
          className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
        >
          Accedi
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Completa il tuo ordine</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={checkoutData.email}
            onChange={(e) => setCheckoutData({...checkoutData, email: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Indirizzo di spedizione
          </label>
          <input
            type="text"
            value={checkoutData.shippingAddress}
            onChange={(e) => setCheckoutData({...checkoutData, shippingAddress: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Via Roma 123"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Città
            </label>
            <input
              type="text"
              value={checkoutData.city}
              onChange={(e) => setCheckoutData({...checkoutData, city: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CAP
            </label>
            <input
              type="text"
              value={checkoutData.postalCode}
              onChange={(e) => setCheckoutData({...checkoutData, postalCode: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Paese
          </label>
          <select
            value={checkoutData.country}
            onChange={(e) => setCheckoutData({...checkoutData, country: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="Italia">Italia</option>
            <option value="Francia">Francia</option>
            <option value="Germania">Germania</option>
            <option value="Spagna">Spagna</option>
            <option value="Altro">Altro</option>
          </select>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Totale ordine:</span>
            <span>€{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || cart.length === 0}
          className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Completando ordine...' : 'Completa ordine'}
        </button>
      </form>
    </div>
  )
}
