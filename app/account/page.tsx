"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from '@/components/AuthContext'
import { useOrders } from '@/hooks/useSupabase'
import { upsertProfile, getOwnProfile } from '@/lib/supabase'

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
  const { user, loading: authLoading } = useAuth()
  const userEmail = user?.email ?? ''
  const { orders, loading: ordersLoading, refetch } = useOrders(userEmail)
  const loading = authLoading || ordersLoading
  const email = userEmail

  // Stato anagrafica locale (mock semplice, espandibile verso Supabase se previsto dallo schema)
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    zip: ''
  })

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id || !user?.email) return
      const { data } = await getOwnProfile(user.id)
      if (data) {
        setProfile({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          zip: data.zip || ''
        })
      }
    }
    loadProfile()
  }, [user?.id, user?.email])

  return (
    <main>
      <Header />
      <section className="account-section">
        <div className="account-container">
          <div className="account-header">
            <div className="user-info">
              <div className="avatar">{email?.[0]?.toUpperCase() || 'U'}</div>
              <div>
                <h2 className="poppins">{email}</h2>
                <p>Area personale</p>
              </div>
            </div>
            <div></div>
          </div>

          <div className="account-content">
            {/* Anagrafica */}
            <div className="card">
              <div className="card-head"><h3>Le mie informazioni</h3></div>
              <div className="card-body">
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e)=>e.preventDefault()}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input className="form-input" value={profile.firstName} onChange={(e)=>setProfile({...profile, firstName: e.target.value})} placeholder="Nome" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cognome</label>
                    <input className="form-input" value={profile.lastName} onChange={(e)=>setProfile({...profile, lastName: e.target.value})} placeholder="Cognome" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                    <input className="form-input" value={profile.phone} onChange={(e)=>setProfile({...profile, phone: e.target.value})} placeholder="Telefono" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
                    <input className="form-input" value={profile.address} onChange={(e)=>setProfile({...profile, address: e.target.value})} placeholder="Via/Piazza" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Città</label>
                    <input className="form-input" value={profile.city} onChange={(e)=>setProfile({...profile, city: e.target.value})} placeholder="Città" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CAP</label>
                    <input className="form-input" value={profile.zip} onChange={(e)=>setProfile({...profile, zip: e.target.value})} placeholder="CAP" />
                  </div>
                  <div className="md:col-span-2" style={{display:'flex',gap:12}}>
                    <button className="btn btn-primary" type="button" onClick={async ()=>{
                      if (!user?.id || !user?.email) return
                      await upsertProfile({
                        user_id: user.id,
                        email: user.email,
                        first_name: profile.firstName || null as any,
                        last_name: profile.lastName || null as any,
                        phone: profile.phone || null as any,
                        address: profile.address || null as any,
                        city: profile.city || null as any,
                        zip: profile.zip || null as any
                      })
                      alert('Dati anagrafici salvati')
                    }}>Salva</button>
                    <button className="btn btn-secondary" type="button" onClick={()=>setProfile({firstName:'',lastName:'',phone:'',address:'',city:'',zip:''})}>Reset</button>
                  </div>
                </form>
              </div>
            </div>
            {/* Ordini */}
            <div className="card">
              <div className="card-head"><h3>I miei ordini</h3></div>
              <div className="card-body">
                {loading ? (
                  <div className="loading">Caricamento ordini...</div>
                ) : orders && orders.length > 0 ? (
                  <div className="orders-list">
                    {orders.map((o) => (
                      <div key={o.id} className="order-card">
                        <div className="order-header">
                          <div>
                            <h3>Ordine #{o.id}</h3>
                            <p className="order-date">{new Date(o.created_at).toLocaleString('it-IT')}</p>
                          </div>
                          <div className="order-status">
                            <span className="status-badge" style={{background: o.status==='delivered'? '#16a34a': o.status==='shipped'? '#2563eb': o.status==='processing'? '#f59e0b': o.status==='pending'? '#a3a3a3': '#dc2626'}}>
                              {o.status}
                            </span>
                            <span className="order-total">€ {Number(o.total_amount ?? 0).toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="order-items">
                          <div className="order-item"><span>Prodotto</span><span>Q.tà</span><span>Prezzo</span></div>
                          {(o.order_items || []).map((it:any, idx:number)=> (
                            <div className="order-item" key={idx}><span>{it.products?.name || 'Prodotto'}</span><span>{it.quantity}</span><span>€ {Number(it.price).toFixed(2)}</span></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-orders">
                    <p>Nessun ordine trovato per questo utente.</p>
                    <a href="/shop" className="btn btn-primary">Vai allo shop</a>
                  </div>
                )}
              </div>
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