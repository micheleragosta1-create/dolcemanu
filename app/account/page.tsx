"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"

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

  return (
    <main>
      <Header />
      <section className="account-section">
        <div className="account-container">
          <div className="account-header">
            <h1 className="poppins">Il Mio Account</h1>
            <p>Sistema di autenticazione temporaneamente disabilitato.</p>
            <p>Accedi tramite il pulsante nel menu per utilizzare questa funzionalità.</p>
            <a href="/auth" className="btn btn-primary">Accedi</a>
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