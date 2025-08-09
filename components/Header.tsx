'use client'

import { useState } from 'react'
import { ShoppingCart, Heart, User, Menu, X } from 'lucide-react'
import { useCart } from './CartContext'

export default function Header() {
  const [wishlistItems, setWishlistItems] = useState(2)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { totalQty } = useCart()

  return (
    <header className="header">
      <div className="header-content">
        <a href="#" className="logo">
          <img 
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNTAgMTBDNjUgMTAgNzUgMjAgNzUgMzVDNzUgNDAgNzMgNDUgNzAgNDlINzVDODAgNDkgODUgNTQgODUgNTlWNzVDODUgODUgNzUgOTUgNjUgOTVIMzVDMjUgOTUgMTUgODUgMTUgNzVWNTlDMTUgNTQgMjAgNDkgMjUgNDlIMzBDMjcgNDUgMjUgNDAgMjUgMzVDMjUgMjAgMzUgMTAgNTAgMTBaIiBmaWxsPSIjRkZBN0E3Ii8+CjxjaXJjbGUgY3g9IjU1IiBjeT0iMTUiIHI9IjgiIGZpbGw9IiNGRjZCNkIiLz4KPHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwLCAyMCkiPgo8cGF0aCBkPSJNNDAgMEMyNSAwIDE1IDEwIDE1IDI1QzE1IDMwIDIwIDMwIDI1IDMwSDU1QzYwIDMwIDY1IDMwIDY1IDI1QzY1IDEwIDU1IDAgNDAgMFoiIGZpbGw9IiNGRkE3QTciLz4KPHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ3aGl0ZSIvPgo8IS0tIEN1cGNha2UgY29udGFpbmVyIC0tPgo8cGF0aCBkPSJNMjAgNDBDMjAgMzUgMjUgMzAgMzAgMzBINzBDNzUgMzAgODAgMzUgODAgNDBWNzVDODAgODMgNzMgOTAgNjUgOTBIMzVDMjcgOTAgMjAgODMgMjAgNzVWNDBaIiBmaWxsPSIjRjU5NEQwIi8+CjwhLS0gRnJvc3RpbmcvY3JlYW0gLS0+CjxwYXRoIGQ9Ik0yNSAzNUM0MCAyNSA2MCAyNSA3NSAzNUM3MCA0MCA2MCA0MCA1MCA0MEM0MCA0MCAzMCA0MCAyNSAzNVoiIGZpbGw9IiNGRkM0RDYiLz4KPHN2ZyBpZD0iZWVjYzIwYzUtMGNhZC00NDg0LTkzZWUtOTNlMGQzMjBjOWY0IiBkYXRhLW5hbWU9IkViZW5lIDEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxkZWZzPjxzdHlsZT4uMTYzYTE1YTgtOWQzZS00ZmVkLWFlMzYtZmJkYzQ5MDhkYjQxe2ZpbGw6IzZjMzAwZH0uZTQ0YjM4Y2UtOTY3YS00YzM1LWI0N2UtMjY4YzZhZjZjOWFke2ZpbGw6I2ZmNmI2Yn08L3N0eWxlPjwvZGVmcz48cGF0aCBjbGFzcz0iZTQ0YjM4Y2UtOTY3YS00YzM1LWI0N2UtMjY4YzZhZjZjOWFkIiBkPSJNNDcuOTMsNzMuODNjNC4yOSwwLDcuNzgtMy40OSw3Ljc4LTcuNzhWNTMuMThjLTUuMjUtMS4yOS0xMC4zMS0xLjI5LTE1LjU2LDBWNjYuMDVjMCw0LjI5LDMuNDksNy43OCw3Ljc4LDcuNzhaIi8+PHBhdGggY2xhc3M9IjE2M2ExNWE4LTlkM2UtNGZlZC1hZTM2LWZiZGM0OTA4ZGI0MSIgZD0iTTQ3LjkzLDQ4LjQ2YzIuNDgsMCw0LjQ5LTIuMDEsNC40OS00LjQ5VjM4YzAtMi40OC0yLjAxLTQuNDktNC40OS00LjQ5cy00LjQ5LDIuMDEtNC40OSw0LjQ5djUuOTdjMCwyLjQ4LDIuMDEsNC40OSw0LjQ5LDQuNDlaIi8+PC9zdmc+"
            alt="Emanuela Napolitano Pastry Chef"
            className="logo-image"
          />
        </a>
        
        <nav className={`nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <ul className="nav-menu">
            <li><a href="/shop">Shop</a></li>
            <li><a href="#storia">Chi Siamo</a></li>
            <li><a href="#contatti">Contatti</a></li>
          </ul>
        </nav>

        <div className="header-actions">
          <a href="/auth" className="btn btn-secondary">
            <User size={16} />
            Login / Registrati
          </a>
          
          <button className="icon-btn" title="Wishlist">
            <Heart size={20} />
            {wishlistItems > 0 && <span className="cart-badge">{wishlistItems}</span>}
          </button>
          
          <a className="icon-btn" title="Carrello" href="/cart">
            <ShoppingCart size={20} />
            {totalQty > 0 && <span className="cart-badge">{totalQty}</span>}
          </a>

          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  )
}
