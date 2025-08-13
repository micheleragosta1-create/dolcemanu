"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useEffect, useState } from "react"
import { useAuth } from '@/components/AuthContext'
import { useOrders } from '@/hooks/useSupabase'
import { getOwnProfile, upsertProfile, getSupabaseClient } from '@/lib/supabase'


export default function AccountPage() {
  const { user, loading: authLoading } = useAuth()
  const userEmail = user?.email ?? ''
  const { orders, loading: ordersLoading } = useOrders(userEmail)
  const loading = authLoading || ordersLoading
  const email = userEmail

  // Dati profilo
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    zip: ''
  })

  // Modali
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [newPassword2, setNewPassword2] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!user?.id) return
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
      } catch {}
    }
    loadProfile()
  }, [user?.id])

  const handleSaveProfile = async () => {
    if (!user?.id || !user?.email) return
    setSavingProfile(true)
    try {
      await upsertProfile({
        user_id: user.id,
        email: user.email,
        first_name: profile.firstName || (null as any),
        last_name: profile.lastName || (null as any),
        phone: profile.phone || (null as any),
        address: profile.address || (null as any),
        city: profile.city || (null as any),
        zip: profile.zip || (null as any)
      })
      setShowEditModal(false)
      alert('Dati aggiornati')
    } catch (e: any) {
      alert(e?.message || 'Errore salvataggio')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword || newPassword !== newPassword2) {
      alert('Le password non coincidono')
      return
    }
    setSavingPassword(true)
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setShowPasswordModal(false)
      setNewPassword('')
      setNewPassword2('')
      alert('Password aggiornata')
    } catch (e: any) {
      alert(e?.message || 'Errore aggiornamento password')
    } finally {
      setSavingPassword(false)
    }
  }

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
            {/* Dati registrazione */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-head"><h3>I miei dati</h3></div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="text-gray-900">{email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Telefono</div>
                    <div className="text-gray-900">{profile.phone || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Nome</div>
                    <div className="text-gray-900">{profile.firstName || '-'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Cognome</div>
                    <div className="text-gray-900">{profile.lastName || '-'}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-500">Indirizzo</div>
                    <div className="text-gray-900">{profile.address || '-'}{profile.city ? `, ${profile.city}` : ''}{profile.zip ? ` (${profile.zip})` : ''}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button className="btn btn-primary" onClick={() => setShowEditModal(true)}>Modifica dati</button>
                  <button className="btn btn-secondary" onClick={() => setShowPasswordModal(true)}>Cambia password</button>
                </div>
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

      {/* Modal Modifica dati */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-xl w-full">
            <div className="p-6 border-b"><h3 className="text-lg font-semibold">Modifica dati</h3></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input className="form-input" value={profile.firstName} onChange={(e)=>setProfile(p=>({...p, firstName: e.target.value}))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cognome</label>
                  <input className="form-input" value={profile.lastName} onChange={(e)=>setProfile(p=>({...p, lastName: e.target.value}))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                  <input className="form-input" value={profile.phone} onChange={(e)=>setProfile(p=>({...p, phone: e.target.value}))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
                  <input className="form-input" value={profile.address} onChange={(e)=>setProfile(p=>({...p, address: e.target.value}))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Città</label>
                  <input className="form-input" value={profile.city} onChange={(e)=>setProfile(p=>({...p, city: e.target.value}))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CAP</label>
                  <input className="form-input" value={profile.zip} onChange={(e)=>setProfile(p=>({...p, zip: e.target.value}))} />
                </div>
              </div>
            </div>
            <div className="p-6 flex justify-end gap-3 border-t">
              <button className="btn btn-secondary" onClick={()=>setShowEditModal(false)} disabled={savingProfile}>Annulla</button>
              <button className="btn btn-primary" onClick={handleSaveProfile} disabled={savingProfile}>{savingProfile? 'Salvataggio...' : 'Salva'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cambia password */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b"><h3 className="text-lg font-semibold">Cambia password</h3></div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nuova password</label>
                <input type="password" className="form-input" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conferma password</label>
                <input type="password" className="form-input" value={newPassword2} onChange={(e)=>setNewPassword2(e.target.value)} />
              </div>
            </div>
            <div className="p-6 flex justify-end gap-3 border-t">
              <button className="btn btn-secondary" onClick={()=>setShowPasswordModal(false)} disabled={savingPassword}>Annulla</button>
              <button className="btn btn-primary" onClick={handleChangePassword} disabled={savingPassword || !newPassword || !newPassword2}>{savingPassword? 'Aggiornamento...' : 'Aggiorna'}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}