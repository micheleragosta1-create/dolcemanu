"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useToast } from "./Toast"

export type CartItem = {
  id: string | number
  nome: string
  prezzo: number
  immagine: string
  tipo?: string
  pezzi?: number
  qty: number
}

type CartContextValue = {
  items: CartItem[]
  totalQty: number
  totalAmount: number
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void
  removeItem: (id: string | number) => void
  updateQty: (id: string | number, qty: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Inizializza sempre con array vuoto per evitare hydration mismatch
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Carica dal localStorage solo dopo il primo render (client-side)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('cart:v1')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            setItems(parsed)
          }
        }
      } catch {
        // Ignora errori di parsing
      }
      setIsHydrated(true)
    }
  }, [])

  useEffect(() => {
    // sincronizza se cambia storage (multi-tab)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'cart:v1' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (Array.isArray(parsed)) setItems(parsed)
        } catch {}
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    // Salva nel localStorage solo dopo l'hydration iniziale
    if (typeof window !== 'undefined' && isHydrated) {
      try {
        localStorage.setItem("cart:v1", JSON.stringify(items))
      } catch {}
    }
  }, [items, isHydrated])

  const addItem: CartContextValue["addItem"] = (item, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id)
      if (existing) {
        return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + qty } : p))
      }
      return [...prev, { ...item, qty }]
    })
  }

  const removeItem: CartContextValue["removeItem"] = (id) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }

  const updateQty: CartContextValue["updateQty"] = (id, qty) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: Math.max(1, qty) } : p)))
  }

  const clear = () => setItems([])

  const { totalQty, totalAmount } = useMemo(() => ({
    totalQty: items.reduce((s, i) => s + i.qty, 0),
    totalAmount: items.reduce((s, i) => s + i.prezzo * i.qty, 0),
  }), [items])

  const value: CartContextValue = { items, totalQty, totalAmount, addItem, removeItem, updateQty, clear }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
