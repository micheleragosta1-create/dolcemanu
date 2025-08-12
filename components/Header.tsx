'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ShoppingCart, Heart, User, Menu, X } from 'lucide-react'
import { useAuth } from '@/components/AuthContext'
import { useAdmin } from '@/hooks/useAdmin'
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
  const { isAdmin } = useAdmin()
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

  useEffect(() => {
    if (!mounted) return
    if (mobileMenuOpen) {
      document.body.classList.add('no-scroll')
    } else {
      document.body.classList.remove('no-scroll')
    }
    return () => document.body.classList.remove('no-scroll')
  }, [mobileMenuOpen, mounted])

  return (
    <>
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Chiudi menu' : 'Apri menu'}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="header-center">
          <a href="/" className="logo" aria-label="Vai alla home">
            <Logo />
          </a>
        </div>

        {/* Menu a scomparsa gestito via Portal fuori dall'header */}

        <div className="header-right header-actions">
          {!mounted ? null : user ? (
            <div className="user-menu">
              <button className="user-btn" aria-haspopup="menu" aria-expanded="false">
                <div className="user-avatar">{user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}</div>
                <span className="user-name">{user.name || user.email}</span>
              </button>
              <div className="user-dropdown">
                <a className="dropdown-item" href="/account">Anagrafica</a>
                <a className="dropdown-item" href="/account#ordini">I miei ordini</a>
                {isAdmin && (
                  <a className="dropdown-item" href="/admin">Amministrazione</a>
                )}
                <button className="dropdown-item logout" onClick={handleLogout}>Logout</button>
              </div>
            </div>
          ) : (
            <a href="/auth" className="btn btn-secondary btn-compact">
              Login / Registrati
            </a>
          )}
          
          {/* Wishlist rimossa su mobile/desktop come richiesto */}
          
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
        </div>
      </div>
    </header>
    {mounted && mobileMenuOpen && typeof window !== 'undefined'
      ? createPortal(
          <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
              <a href="/shop" onClick={() => setMobileMenuOpen(false)}>Shop</a>
              <a href="/auth" onClick={() => setMobileMenuOpen(false)}>Accedi</a>
            </div>
          </div>,
          document.body
        )
      : null}
    </>
  )
}
