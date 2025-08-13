"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useEffect, useMemo, useState } from "react"
import { Check, X, RefreshCcw } from "lucide-react"

type Review = {
  id: string
  product_id: string
  user_email: string
  rating: number
  title?: string | null
  body?: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  product?: { id: string, name: string }
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [working, setWorking] = useState<string | null>(null)

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/reviews?status=${filter}`)
      const data = await res.json()
      setReviews(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReviews() }, [filter])

  const onAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      setWorking(id)
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      if (!res.ok) {
        const j = await res.json().catch(()=>({}))
        alert(j?.error || 'Errore')
        return
      }
      await fetchReviews()
    } catch (e) {
      console.error(e)
    } finally {
      setWorking(null)
    }
  }

  const list = useMemo(() => reviews, [reviews])

  return (
    <main>
      <Header />
      <section className="admin-section">
        <div className="admin-container">
          <div className="admin-header" style={{marginBottom: '1rem'}}>
            <h1 className="poppins">Moderazione Recensioni</h1>
            <div style={{display:'flex', gap:8}}>
              <select value={filter} onChange={(e)=>setFilter(e.target.value as any)} className="admin-select">
                <option value="pending">In moderazione</option>
                <option value="approved">Approvate</option>
                <option value="rejected">Rifiutate</option>
                <option value="all">Tutte</option>
              </select>
              <button className="btn btn-secondary" onClick={fetchReviews}><RefreshCcw size={16} /></button>
            </div>
          </div>
          {loading ? (
            <div className="loading-container"><div className="spinner" />Caricamento…</div>
          ) : (
            <div className="card">
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Prodotto</th>
                      <th>Utente</th>
                      <th>Rating</th>
                      <th>Titolo</th>
                      <th>Testo</th>
                      <th>Status</th>
                      <th>Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map(r => (
                      <tr key={r.id}>
                        <td>{new Date(r.created_at).toLocaleString('it-IT')}</td>
                        <td>{r.product?.name || r.product_id}</td>
                        <td>{r.user_email}</td>
                        <td>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</td>
                        <td>{r.title || '-'}</td>
                        <td>{r.body || '-'}</td>
                        <td>{r.status}</td>
                        <td>
                          <div style={{display:'flex',gap:8}}>
                            <button className="btn btn-primary small" disabled={working===r.id} onClick={()=>onAction(r.id,'approve')}><Check size={14}/> Approva</button>
                            <button className="btn btn-secondary small" disabled={working===r.id} onClick={()=>onAction(r.id,'reject')}><X size={14}/> Rifiuta</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
      <style jsx global>{`
        .admin-select { padding: .6rem .8rem; border: 2px solid #e9ecef; border-radius: 8px; }
      `}</style>
    </main>
  )
}


