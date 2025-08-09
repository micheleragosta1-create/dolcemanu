"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useAuth } from "@/components/AuthContext"

interface Order {
  id: string
  date: string
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: {
    name: string
    quantity: number
    price: number
  }[]
}

export default function AccountPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    
    // Fetch user orders
    fetchUserOrders()
  }, [user, router])

  const fetchUserOrders = async () => {
    try {
      const response = await fetch(`/api/orders/user/${user?.email}`)
      if (response.ok) {
        const userOrders = await response.json()
        setOrders(userOrders)
      }
    } catch (error) {
      console.error('Errore nel caricamento degli ordini:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#fbbf24'
      case 'processing': return '#3b82f6'
      case 'shipped': return '#8b5cf6'
      case 'delivered': return '#10b981'
      case 'cancelled': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'In attesa'
      case 'processing': return 'In elaborazione'
      case 'shipped': return 'Spedito'
      case 'delivered': return 'Consegnato'
      case 'cancelled': return 'Annullato'
      default: return status
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (!user) {
    return null // Will redirect to auth page
  }

  return (
    <main>
      <Header />
      <section className="account-section">
        <div className="account-container">
          <div className="account-header">
            <h1 className="poppins">Il Mio Account</h1>
            <div className="user-info">
              <div className="avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="poppins">{user.name}</h2>
                <p>{user.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary">
              Esci
            </button>
          </div>

          <div className="account-content">
            <div className="orders-section">
              <h2 className="poppins">I Miei Ordini</h2>
              
              {loading ? (
                <div className="loading">Caricamento ordini...</div>
              ) : orders.length === 0 ? (
                <div className="no-orders">
                  <p>Non hai ancora effettuato ordini.</p>
                  <button 
                    onClick={() => router.push('/shop')} 
                    className="btn btn-primary"
                  >
                    Inizia a fare acquisti
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div>
                          <h3 className="poppins">Ordine #{order.id}</h3>
                          <p className="order-date">{new Date(order.date).toLocaleDateString('it-IT')}</p>
                        </div>
                        <div className="order-status">
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(order.status) }}
                          >
                            {getStatusText(order.status)}
                          </span>
                          <div className="order-total">€ {order.total.toFixed(2)}</div>
                        </div>
                      </div>
                      
                      <div className="order-items">
                        {order.items.map((item, index) => (
                          <div key={index} className="order-item">
                            <span>{item.name} × {item.quantity}</span>
                            <span>€ {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />

      <style jsx global>{`
        .account-section {
          position: relative;
          z-index: 10;
          padding: 7rem 2rem 3rem;
          min-height: 70vh;
        }
        
        .account-container {
          max-width: 1100px;
          margin: 0 auto;
        }
        
        .account-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .avatar {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #8B4513, #D2691E);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
        }
        
        .user-info h2 {
          margin: 0;
          font-size: 1.4rem;
        }
        
        .user-info p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }
        
        .account-content {
          background: #fff;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }
        
        .orders-section h2 {
          margin-bottom: 1.5rem;
          color: #333;
        }
        
        .loading {
          text-align: center;
          padding: 2rem;
          color: #666;
        }
        
        .no-orders {
          text-align: center;
          padding: 3rem 2rem;
        }
        
        .no-orders p {
          color: #666;
          margin-bottom: 1.5rem;
        }
        
        .orders-list {
          display: grid;
          gap: 1rem;
        }
        
        .order-card {
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }
        
        .order-card:hover {
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .order-header h3 {
          margin: 0;
          font-size: 1.1rem;
        }
        
        .order-date {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }
        
        .order-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }
        
        .status-badge {
          color: white;
          padding: 0.3rem 0.8rem;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        .order-total {
          font-size: 1.2rem;
          font-weight: 600;
          color: #8B4513;
        }
        
        .order-items {
          border-top: 1px solid #eee;
          padding-top: 1rem;
          display: grid;
          gap: 0.5rem;
        }
        
        .order-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
        }
        
        .order-item:first-child span:first-child {
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .account-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
          
          .order-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .order-status {
            align-items: flex-start;
          }
        }
      `}</style>
    </main>
  )
}