"use client"

import { useCart, CartItem } from './CartContext'
import { useToast } from './Toast'

export function useCartWithToast() {
  const cart = useCart()
  const { addToast } = useToast()

  const addItemWithToast = (item: Omit<CartItem, "qty">, qty = 1) => {
    cart.addItem(item, qty)
    addToast(`${item.nome} aggiunto al carrello`, 'success', 2500)
  }

  const removeItemWithToast = (id: string | number, itemName?: string) => {
    cart.removeItem(id)
    if (itemName) {
      addToast(`${itemName} rimosso dal carrello`, 'info', 2000)
    }
  }

  return {
    ...cart,
    addItem: addItemWithToast,
    removeItem: removeItemWithToast,
  }
}