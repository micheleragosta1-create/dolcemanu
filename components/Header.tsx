'use client'

import { useState } from 'react'
import { ShoppingCart, Heart, User, Menu, X } from 'lucide-react'
import { useCart } from './CartContext'
import Logo from './Logo'
import CartPopup from './CartPopup'

export default function Header() {
  const [wishlistItems, setWishlistItems] = useState(2)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartPopupVisible, setCartPopupVisible] = useState(false)
  const { totalQty } = useCart()

  return (
    <header className="header">
      <div className="header-content">
        <a href="/" className="logo" aria-label="Vai alla home">
          <Logo />
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
          
          <div 
            className="cart-container"
            onMouseEnter={() => setCartPopupVisible(true)}
            onMouseLeave={() => setCartPopupVisible(false)}
          >
            <a className="icon-btn" title="Carrello" href="/cart">
              <ShoppingCart size={20} />
              {totalQty > 0 && <span className="cart-badge">{totalQty}</span>}
            </a>
            <CartPopup 
              isVisible={cartPopupVisible} 
              onClose={() => setCartPopupVisible(false)} 
            />
          </div>

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
