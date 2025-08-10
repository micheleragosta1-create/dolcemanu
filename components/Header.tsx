'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart, Heart, User, Menu, X } from 'lucide-react'
import { useAuth } from '@/components/AuthContext'
import { useCart } from './CartContext'
import { useRouter } from 'next/navigation'
import Logo from './Logo'
import CartPopup from './CartPopup'

export default function Header() {
  const [wishlistItems, setWishlistItems] = useState(2)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartPopupVisible, setCartPopupVisible] = useState(false)
  const { totalQty } = useCart()
  const [mounted, setMounted] = useState(false)
  const { user, signOut } = useAuth()
  const router = useRouter()
  const handleLogout = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Errore durante il logout:', error)
      router.push('/')
    }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="header">
      <div className="header-content">
        <a href="/" className="logo" aria-label="Vai alla home">
          <Logo />
        </a>
        
        <nav className={`nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <a href="/shop">Shop</a>
          <a href="#storia">Chi Siamo</a>
          <a href="#contatti">Contatti</a>
        </nav>
        
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-menu">
              <a href="/shop" onClick={() => setMobileMenuOpen(false)}>Shop</a>
              <a href="#storia" onClick={() => setMobileMenuOpen(false)}>Chi Siamo</a>
              <a href="#contatti" onClick={() => setMobileMenuOpen(false)}>Contatti</a>
            </div>
          </div>
        )}

        <div className="header-actions">
          {!mounted ? null : user ? (
            <div className="user-menu">
              <button className="user-btn" aria-haspopup="menu" aria-expanded="false">
                <div className="user-avatar">{user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}</div>
                <span className="user-name">{user.name || user.email}</span>
              </button>
              <div className="user-dropdown">
                <a className="dropdown-item" href="/account">Anagrafica</a>
                <a className="dropdown-item" href="/account#ordini">I miei ordini</a>
                <button className="dropdown-item logout" onClick={handleLogout}>Logout</button>
              </div>
            </div>
          ) : (
            <a href="/auth" className="btn btn-secondary">
              <User size={16} />
              Login / Registrati
            </a>
          )}
          
          <button className="icon-btn" title="Wishlist">
            <Heart size={20} />
            {mounted && wishlistItems > 0 && <span className="cart-badge">{wishlistItems}</span>}
          </button>
          
          <div 
            className="cart-container"
            onMouseEnter={() => setCartPopupVisible(true)}
            onMouseLeave={() => setCartPopupVisible(false)}
          >
            <a className="icon-btn" title="Carrello" href="/cart">
              <ShoppingCart size={20} />
              {mounted && totalQty > 0 && <span className="cart-badge">{totalQty}</span>}
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
