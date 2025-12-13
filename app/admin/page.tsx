"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { useAdmin } from '@/hooks/useAdmin'
import { useAuth } from '@/components/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdminDashboard from '@/components/admin/AdminDashboard'
import AdminOrders from '@/components/admin/AdminOrders'
import AdminProducts from '@/components/admin/AdminProducts'
import AdminUsers from '@/components/admin/AdminUsers'
import AdminSettings from '@/components/admin/AdminSettings'
import { Shield, Package, Users, ShoppingCart, Settings } from 'lucide-react'

export default function AdminPage() {
  const { user } = useAuth()
  const { isAdmin, loading: roleLoading } = useAdmin()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products' | 'users' | 'settings'>('dashboard')

  // Opzione: non reindirizzare automaticamente per facilitare debug/whitelisting
  useEffect(() => {
    // Manteniamo la pagina accessibile; la UI sotto gestisce accesso negato
  }, [isAdmin, roleLoading])

  // Rendering ottimizzato: mostra la pagina subito, verifica permessi in background
  if (roleLoading) {
    return (
      <main>
        <Header />
        <div className="admin-section">
          <div className="admin-container">
            <div className="admin-loading">
              <div className="loading-spinner"></div>
              <p>Verifica permessi...</p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  // Accesso negato: mostra messaggio invece di redirect
  if (!roleLoading && !isAdmin) {
    return (
      <main>
        <Header />
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-2">Accesso negato</h1>
            <p className="text-gray-600 mb-4">Questa sezione è riservata agli amministratori.</p>
            <a href="/" className="btn btn-secondary">Torna alla Home</a>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main>
      <Header />
      
      <div className="admin-section">
        <div className="admin-container">
          {/* Header del pannello admin */}
          <div className="admin-header">
            <div className="admin-title-section">
              <Shield className="admin-icon" />
              <div>
                <h1 className="admin-title">Pannello Amministrativo</h1>
                <p className="admin-subtitle">
                  Gestisci prodotti, ordini e utenti di Dolce Manu
                </p>
              </div>
            </div>
            <div className="admin-user-info">
              <span className="admin-role">Admin</span>
              <span className="admin-email">{user?.email}</span>
            </div>
          </div>

          {/* Tabs di navigazione */}
          <div className="admin-tabs">
            <button
              className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <Shield size={18} />
              Dashboard
            </button>
            <button
              className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingCart size={18} />
              Ordini
            </button>
            <button
              className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <Package size={18} />
              Prodotti
            </button>
            <button
              className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <Users size={18} />
              Utenti
            </button>
            <button
              className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings size={18} />
              Impostazioni
            </button>
          </div>

          {/* Contenuto delle tab */}
          <div className="admin-content">
            {activeTab === 'dashboard' && <AdminDashboard />}
            {activeTab === 'orders' && <AdminOrders />}
            {activeTab === 'products' && <AdminProducts />}
            {activeTab === 'users' && <AdminUsers />}
            {activeTab === 'settings' && <AdminSettings />}
          </div>
        </div>
      </div>

      <Footer />

      <style jsx global>{`
        .admin-section {
          padding: 15rem 2rem 4rem;
          background: #f8fafc;
          min-height: 100vh;
        }
        
        .admin-container {
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .admin-header {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .admin-title-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .admin-icon {
          color: #ec4899;
          width: 2.5rem;
          height: 2.5rem;
        }
        
        .admin-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }
        
        .admin-subtitle {
          color: #6b7280;
          margin: 0.25rem 0 0 0;
        }
        
        .admin-user-info {
          text-align: right;
        }
        
        .admin-role {
          display: block;
          background: #ec4899;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .admin-email {
          display: block;
          color: #6b7280;
          font-size: 0.875rem;
          margin-top: 0.5rem;
        }
        
        .admin-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          background: white;
          padding: 0.5rem;
          border-radius: 12px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        .admin-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          background: transparent;
          color: #6b7280;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }
        
        .admin-tab:hover {
          background: #f3f4f6;
          color: #374151;
        }
        
        .admin-tab.active {
          background: var(--color-brown);
          color: white;
        }
        
        .admin-content {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        /* Loading State */
        .admin-loading {
          text-align: center;
          padding: 4rem 2rem;
        }
        
        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #f3f4f6;
          border-top-color: var(--color-brown);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 1rem;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .admin-loading p {
          color: #6b7280;
          font-size: 0.95rem;
        }
        
        @media (max-width: 992px) {
          .admin-section {
            padding: 11rem 1.5rem 3rem;
          }
          
          .admin-header {
            padding: 1.5rem;
          }
          
          .admin-icon {
            width: 2rem;
            height: 2rem;
          }
          
          .admin-title {
            font-size: 1.5rem;
          }
        }
        
        @media (max-width: 768px) {
          .admin-section {
            padding: 10rem 1rem 2rem;
          }
          
          .admin-header {
            flex-direction: column;
            gap: 1.25rem;
            text-align: center;
            padding: 1.25rem;
          }
          
          .admin-title-section {
            flex-direction: column;
            text-align: center;
          }
          
          .admin-title {
            font-size: 1.4rem;
          }
          
          .admin-subtitle {
            font-size: 0.9rem;
          }
          
          .admin-user-info {
            text-align: center;
          }
          
          .admin-tabs {
            flex-direction: column;
            gap: 0.5rem;
            padding: 0.75rem;
          }
          
          .admin-tab {
            width: 100%;
            justify-content: center;
            padding: 1rem;
            font-size: 0.95rem;
          }
        }
        
        @media (max-width: 480px) {
          .admin-section {
            padding: 9rem 0.75rem 1.5rem;
          }
          
          .admin-header {
            padding: 1rem;
            margin-bottom: 1.25rem;
          }
          
          .admin-icon {
            width: 1.75rem;
            height: 1.75rem;
          }
          
          .admin-title {
            font-size: 1.25rem;
          }
          
          .admin-subtitle {
            font-size: 0.85rem;
          }
          
          .admin-tabs {
            padding: 0.5rem;
            margin-bottom: 1.25rem;
          }
          
          .admin-tab {
            padding: 0.875rem;
            font-size: 0.9rem;
          }
          
          .admin-tab svg {
            width: 16px;
            height: 16px;
          }
        }
      `}</style>
    </main>
  )
}