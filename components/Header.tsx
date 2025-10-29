'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ShoppingCart, Heart, User, Menu, X, ChevronDown } from 'lucide-react'
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
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false)
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(false)
  const { totalQty } = useCart()
  const [mounted, setMounted] = useState(false)
  const { user, signOut } = useAuth()
  const { isAdmin } = useAdmin()
  const router = useRouter()
  
  // Collezioni disponibili
  const collections = [
    'Costiera Amalfitana',
    'Tradizione Napoletana',
    'Sapori di Sicilia',
    'Dolci Mediterranei',
    'Limited Edition',
    'Stagionale',
    'Praline dal Mondo'
  ]
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
      // Reset collections state when closing menu
      setMobileCollectionsOpen(false)
    }
    return () => document.body.classList.remove('no-scroll')
  }, [mobileMenuOpen, mounted])

  // Scroll state: transparent at top, solid after 160px, hidden on fast downward scroll
  const [isTransparent, setIsTransparent] = useState(true)
  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const SOLID_THRESHOLD = 160
    let lastY = window.scrollY || 0
    const onScroll = () => {
      const y = window.scrollY || 0
      setIsTransparent(y < SOLID_THRESHOLD)
      // Hide when scrolling down and past threshold; show when scrolling up
      const goingDown = y > lastY
      const beyond = y > SOLID_THRESHOLD
      setIsHidden(goingDown && beyond)
      lastY = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const headerClass = `header ${isHidden ? 'header--hidden' : 'header--solid'}`

  return (
    <>
    <header className={headerClass}>
      {/* Topbar stile Omega */}
      <div className="topbar">
        <div className="topbar-content">
          <div className="topbar-left">
            <a href="/#contatti" className="topbar-link">Contatti</a>
            <span className="topbar-sep" aria-hidden>•</span>
            <a href="/policy" className="topbar-link">Policy</a>
          </div>
          <div className="topbar-right">
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
              <a href="/auth" className="topbar-auth-link">Accedi / Registrati</a>
            )}
          </div>
        </div>
      </div>

      {/* Mainbar con logo centrale e azioni a destra */}
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

        {/* Azioni a destra */}
        <div className="header-right header-actions">
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

      {/* Nav secondaria stile Omega */}
      <nav className="nav-secondary" aria-label="Principale">
        <ul className="nav-menu">
          <li 
            className="nav-item-with-dropdown"
            onMouseEnter={() => setShopDropdownOpen(true)}
            onMouseLeave={() => setShopDropdownOpen(false)}
          >
            <a href="/shop" className="nav-link-with-icon">
              Shop
              <ChevronDown size={14} className="nav-chevron" />
            </a>
            {shopDropdownOpen && (
              <div className="nav-dropdown">
                <a href="/shop" className="nav-dropdown-item">Tutti i Prodotti</a>
                {collections.map((collection) => (
                  <a 
                    key={collection}
                    href={`/shop?collection=${encodeURIComponent(collection)}`}
                    className="nav-dropdown-item"
                  >
                    {collection}
                  </a>
                ))}
              </div>
            )}
          </li>
          <li><a href="/#storia">Storia</a></li>
          <li><a href="/#contatti">Contatti</a></li>
        </ul>
      </nav>
    </header>
    {mounted && mobileMenuOpen && typeof window !== 'undefined'
      ? createPortal(
          <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
            <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-menu-item-expandable">
                <button 
                  className="mobile-menu-toggle"
                  onClick={() => setMobileCollectionsOpen(!mobileCollectionsOpen)}
                >
                  <span>Shop</span>
                  <ChevronDown 
                    size={18} 
                    className={`mobile-chevron ${mobileCollectionsOpen ? 'open' : ''}`}
                  />
                </button>
                <div className={`mobile-menu-submenu ${mobileCollectionsOpen ? 'open' : ''}`}>
                  <a href="/shop" onClick={() => setMobileMenuOpen(false)}>Tutti i Prodotti</a>
                  {collections.map((collection) => (
                    <a 
                      key={collection}
                      href={`/shop?collection=${encodeURIComponent(collection)}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {collection}
                    </a>
                  ))}
                </div>
              </div>
              <a href="/#storia" onClick={() => setMobileMenuOpen(false)}>Storia</a>
              <a href="/#contatti" onClick={() => setMobileMenuOpen(false)}>Contatti</a>
              <a href="/auth" onClick={() => setMobileMenuOpen(false)}>Accedi</a>
            </div>
          </div>,
          document.body
        )
      : null}
    </>
  )
}
