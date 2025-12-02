"use client"

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BoxConfigurator from '@/components/BoxConfigurator'
import type { Product } from '@/lib/supabase'
import { ArrowLeft, Package, Loader } from 'lucide-react'
import Link from 'next/link'

export default function ConfiguraBoxPage() {
  const [pralines, setPralines] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/box-config')
        const data = await response.json()

        if (response.ok) {
          setPralines(data.pralines || [])
        } else {
          setError(data.error || 'Errore nel caricamento')
        }
      } catch (err) {
        setError('Errore di connessione')
        console.error('Errore fetch:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <main>
      <Header />
      
      <section className="configura-box-section">
        <div className="configura-box-container">
          {/* Breadcrumb / Back */}
          <Link href="/shop" className="back-link">
            <ArrowLeft size={20} />
            <span>Torna allo Shop</span>
          </Link>

          {/* Hero Section */}
          <div className="page-hero">
            <div className="hero-icon">
              <Package size={48} />
            </div>
            <h1>Configura la tua Box</h1>
            <p>
              Crea la tua composizione perfetta scegliendo tra le nostre praline artigianali.
              Scegli 8 o 16 praline e paga solo quello che selezioni!
            </p>
          </div>

          {/* Content */}
          {loading ? (
            <div className="loading-state">
              <Loader className="spinner" size={40} />
              <p>Caricamento praline disponibili...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <h3>Oops! Qualcosa è andato storto</h3>
              <p>{error}</p>
              <button 
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Riprova
              </button>
            </div>
          ) : pralines.length === 0 ? (
            <div className="empty-state">
              <Package size={64} />
              <h3>Nessuna pralina disponibile</h3>
              <p>
                Al momento non ci sono praline disponibili per la box personalizzata.
                Contattaci per maggiori informazioni!
              </p>
              <Link href="/shop" className="btn btn-primary">
                Vai allo Shop
              </Link>
            </div>
          ) : (
            <BoxConfigurator pralines={pralines} />
          )}

          {/* Info Section */}
          <div className="info-cards">
            <div className="info-card">
              <span className="info-emoji">🎁</span>
              <h4>Regalo Perfetto</h4>
              <p>Ogni box è confezionata con cura, pronta per essere regalata</p>
            </div>
            <div className="info-card">
              <span className="info-emoji">🍫</span>
              <h4>100% Artigianale</h4>
              <p>Praline create a mano con ingredienti selezionati</p>
            </div>
            <div className="info-card">
              <span className="info-emoji">🚚</span>
              <h4>Spedizione Sicura</h4>
              <p>Imballaggio protettivo per mantenere la freschezza</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .configura-box-section {
          padding: 12rem 2rem 4rem;
          background: var(--color-cream);
          min-height: 100vh;
        }

        .configura-box-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: white;
          border: 2px solid #e9ecef;
          border-radius: 12px;
          color: var(--color-navy);
          font-size: 0.95rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          margin-bottom: 2rem;
        }

        .back-link:hover {
          border-color: var(--color-brown);
          color: var(--color-brown);
          transform: translateX(-4px);
        }

        .page-hero {
          text-align: center;
          margin-bottom: 3rem;
        }

        .hero-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 96px;
          height: 96px;
          background: linear-gradient(135deg, var(--color-brown) 0%, #6d3d0f 100%);
          border-radius: 24px;
          color: white;
          margin-bottom: 1.5rem;
          box-shadow: 0 10px 30px rgba(139, 69, 19, 0.3);
        }

        .page-hero h1 {
          font-size: 2.5rem;
          color: var(--color-navy);
          margin: 0 0 1rem 0;
          font-family: 'Poppins', sans-serif;
        }

        .page-hero p {
          font-size: 1.1rem;
          color: #666;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* Loading State */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          background: white;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
        }

        .spinner {
          animation: spin 1s linear infinite;
          color: var(--color-brown);
          margin-bottom: 1rem;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .loading-state p {
          color: #666;
          font-size: 1rem;
        }

        /* Error State */
        .error-state {
          text-align: center;
          padding: 4rem;
          background: white;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
        }

        .error-state h3 {
          color: #dc3545;
          margin-bottom: 0.5rem;
        }

        .error-state p {
          color: #666;
          margin-bottom: 1.5rem;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem;
          background: white;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.08);
        }

        .empty-state svg {
          color: #ccc;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          color: var(--color-navy);
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #666;
          margin-bottom: 1.5rem;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }

        /* Info Cards */
        .info-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 3rem;
        }

        .info-card {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          transition: transform 0.3s ease;
        }

        .info-card:hover {
          transform: translateY(-5px);
        }

        .info-emoji {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 1rem;
        }

        .info-card h4 {
          color: var(--color-navy);
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
        }

        .info-card p {
          color: #666;
          font-size: 0.9rem;
          margin: 0;
          line-height: 1.5;
        }

        /* Responsive */
        @media (max-width: 992px) {
          .configura-box-section {
            padding: 10rem 1.5rem 3rem;
          }

          .page-hero h1 {
            font-size: 2rem;
          }

          .info-cards {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .configura-box-section {
            padding: 8rem 1rem 2rem;
          }

          .page-hero h1 {
            font-size: 1.75rem;
          }

          .hero-icon {
            width: 72px;
            height: 72px;
          }
        }
      `}</style>
    </main>
  )
}

