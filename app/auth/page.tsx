"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Mail, Lock, User, Phone, CheckCircle } from "lucide-react"
import { upsertProfile } from '@/lib/supabase'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")

  return (
    <main>
      <Header />
      <section className="auth-section">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1 className="auth-title poppins">Benvenuta/o</h1>
              <p className="auth-subtitle">Accedi o crea un account per ordinare le tue creazioni preferite</p>
              <div className="auth-tabs">
                <button
                  className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
                  onClick={() => setActiveTab("login")}
                >
                  Accedi
                </button>
                <button
                  className={`auth-tab ${activeTab === "register" ? "active" : ""}`}
                  onClick={() => setActiveTab("register")}
                >
                  Registrati
                </button>
              </div>
            </div>

            {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
          </div>

          <aside className="auth-aside">
            <div className="aside-content">
              <h2 className="poppins">Dolci emozioni, ogni giorno</h2>
              <p>
                Entra nella nostra piccola pasticceria digitale. Ordina box di praline, regali personalizzati e creazioni
                artigianali preparate con ingredienti selezionati.
              </p>

              <ul className="aside-points">
                <li>
                  <CheckCircle size={18} /> Ordini rapidi e conferma via email
                </li>
                <li>
                  <CheckCircle size={18} /> Wishlist e promozioni dedicate
                </li>
                <li>
                  <CheckCircle size={18} /> Pagamenti sicuri
                </li>
              </ul>
            </div>
            <div className="aside-image" style={{ backgroundImage: "url(/images/hero-slide-2.svg)" }} />
          </aside>
        </div>
      </section>
      <Footer />

      <style jsx global>{`
        .auth-section {
          position: relative;
          z-index: 10;
          padding: 13rem 2rem 4rem;
          background: #ffffff;
          min-height: 100vh;
        }
        .auth-container {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 2.5rem;
        }
        .auth-card {
          background: #fff;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          padding: 2rem;
          will-change: opacity;
        }
        .auth-header { text-align: center; margin-bottom: 1.5rem; }
        .auth-title { font-size: 2rem; font-weight: 600; letter-spacing: -0.5px; }
        .auth-subtitle { color: #666; margin-top: 0.5rem; }
        .auth-tabs { display: inline-flex; gap: 0.5rem; background: #f5f5f5; border-radius: 10px; padding: 0.25rem; margin: 1.25rem auto 0; }
        .auth-tab {
          border: none; background: transparent; padding: 0.6rem 1.1rem; border-radius: 8px; cursor: pointer;
          font-weight: 600; color: #666; transition: background .2s ease, color .2s ease; letter-spacing: .3px;
        }
        .auth-tab.active { background: var(--color-brown); color: #fff; }

        .form { 
          display: grid; 
          gap: 1rem; 
          margin-top: 0.5rem;
        }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .field { display: flex; flex-direction: column; gap: .35rem; }
        .label { font-size: .9rem; font-weight: 600; color: #000; }
        .input {
          display: flex; align-items: center; gap: .5rem; padding: .75rem 1rem; border: 2px solid #e9ecef; border-radius: 10px; background: #fff;
          font-family: Inter, sans-serif; transition: border-color .2s ease;
        }
        .input:focus-within { border-color: var(--color-brown); }
        .input input, .input password, .input email, .input tel { 
          flex: 1; 
          border: none; 
          outline: none; 
          font-size: 1rem; 
          background: transparent;
          font-family: inherit;
        }
        .helper { font-size: .85rem; color: #888; }

        .actions { display: flex; justify-content: space-between; align-items: center; margin-top: .5rem; }
        .link { color: var(--color-brown); text-decoration: none; font-weight: 600; }
        .submit { margin-top: .5rem; width: 100%; }

        .auth-aside { background: #f5f3f0; border: 1px solid #e8e3dd; border-radius: 16px; overflow: hidden; display: grid; grid-template-rows: auto 260px; }
        .aside-content { padding: 2rem; }
        .aside-content h2 { font-size: 1.6rem; font-weight: 600; margin-bottom: .75rem; }
        .aside-content p { color: #666; line-height: 1.7; margin-bottom: 1rem; }
        .aside-points { list-style: none; padding: 0; margin: 0; display: grid; gap: .5rem; color: #444; }
        .aside-points li { display: flex; gap: .5rem; align-items: center; }
        .aside-image { background-size: cover; background-position: center; }

        @media (max-width: 992px) {
          .auth-container { grid-template-columns: 1fr; }
          .auth-aside { order: -1; grid-template-rows: 220px auto; }
          .auth-card { min-height: 400px; }
        }
        @media (max-width: 480px) {
          .row { grid-template-columns: 1fr; }
          .auth-section { padding: 10rem 1rem 3rem; }
          .auth-card { padding: 1.5rem; min-height: 350px; }
        }
      `}</style>
    </main>
  )
}

function LoginForm() {
  const { signIn } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error: signInError } = await signIn(email, password)
      if (signInError) {
        setError(signInError.message)
      } else {
        // Login riuscito
        setSuccess('Accesso effettuato con successo! Reindirizzamento...')
        setTimeout(() => router.push('/'), 1500)
      }
    } catch (err) {
      setError('Errore durante l\'accesso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label className="label" htmlFor="login-email">Email</label>
          <div className="input">
            <Mail size={18} color="#5e3621" />
            <input id="login-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nome@email.com" required autoComplete="email" />
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor="login-password">Password</label>
          <div className="input">
            <Lock size={18} color="#5e3621" />
          <input id="login-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="La tua password" required autoComplete="current-password" />
        </div>
      </div>
      <div className="actions">
        <a href="#" className="link">Password dimenticata?</a>
      </div>
      <button type="submit" className="btn btn-primary submit" disabled={loading}>
        {loading ? 'Accesso...' : 'Accedi'}
      </button>
      {error && (
        <div style={{
          color: '#dc2626', 
          marginTop: '.5rem',
          padding: '.75rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{
          color: '#059669', 
          marginTop: '.5rem',
          padding: '.75rem',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          fontSize: '0.875rem'
        }}>
          {success}
        </div>
      )}
    </form>
  )
}

function RegisterForm() {
  const { signUp } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [zip, setZip] = useState('')
  const [country, setCountry] = useState('Italia')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== password2) { setError('Le password non coincidono'); return }
    
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { error: signUpError } = await signUp(email, password)
      if (signUpError) {
        setError(signUpError.message)
      } else {
        // Registrazione riuscita → prova a salvare i dati profilo/spedizione
        try {
          const supabase = getSupabase()
          const { data: { session } = { session: null } } = await supabase!.auth.getSession()
          const userId = session?.user?.id
          if (userId) {
            const [firstName, ...rest] = name.split(' ')
            await upsertProfile({
              user_id: userId,
              email,
              first_name: firstName || name,
              last_name: rest.join(' ') || undefined,
              phone: phone || undefined,
              address: address || undefined,
              city: city || undefined,
              zip: zip || undefined
            })
          }
        } catch {}
        setSuccess('Account creato con successo! Reindirizzamento...')
        setTimeout(() => router.push('/'), 1500)
      }
    } catch (err) {
      setError('Errore durante la registrazione')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="row">
        <div className="field">
          <label className="label" htmlFor="name">Nome e cognome</label>
          <div className="input">
            <User size={18} color="#5e3621" />
            <input id="name" type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Es. Emanuela Napolitano" required autoComplete="name" />
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor="phone">Telefono (opzionale)</label>
          <div className="input">
            <Phone size={18} color="#5e3621" />
            <input id="phone" type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Es. +39 333 123 4567" autoComplete="tel" />
          </div>
        </div>
      </div>
      <div className="field">
        <label className="label" htmlFor="reg-email">Email</label>
        <div className="input">
          <Mail size={18} color="#5e3621" />
          <input id="reg-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nome@email.com" required autoComplete="email" />
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label className="label" htmlFor="reg-pass">Password</label>
          <div className="input">
            <Lock size={18} color="#5e3621" />
            <input id="reg-pass" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimo 8 caratteri" required autoComplete="new-password" />
          </div>
          <span className="helper">Usa almeno 8 caratteri, una lettera e un numero</span>
        </div>
        <div className="field">
          <label className="label" htmlFor="reg-pass2">Conferma Password</label>
          <div className="input">
            <Lock size={18} color="#5e3621" />
            <input id="reg-pass2" type="password" value={password2} onChange={e=>setPassword2(e.target.value)} placeholder="Ripeti password" required autoComplete="new-password" />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label className="label" htmlFor="reg-address">Indirizzo di spedizione</label>
          <div className="input">
            <User size={18} color="#5e3621" />
            <input id="reg-address" type="text" value={address} onChange={e=>setAddress(e.target.value)} placeholder="Via/Piazza e numero civico" required autoComplete="street-address" />
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor="reg-city">Città</label>
          <div className="input">
            <User size={18} color="#5e3621" />
            <input id="reg-city" type="text" value={city} onChange={e=>setCity(e.target.value)} placeholder="Es. Salerno" required autoComplete="address-level2" />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label className="label" htmlFor="reg-zip">CAP</label>
          <div className="input">
            <User size={18} color="#5e3621" />
            <input id="reg-zip" type="text" value={zip} onChange={e=>setZip(e.target.value)} placeholder="Es. 84100" required autoComplete="postal-code" />
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor="reg-country">Paese</label>
          <div className="input">
            <User size={18} color="#5e3621" />
            <input id="reg-country" type="text" value={country} onChange={e=>setCountry(e.target.value)} placeholder="Italia" required autoComplete="country-name" />
          </div>
        </div>
      </div>
      <button type="submit" className="btn btn-primary submit" disabled={loading}>
        {loading ? 'Registrazione...' : 'Crea account'}
      </button>
      {error && (
        <div style={{
          color: '#dc2626', 
          marginTop: '.5rem',
          padding: '.75rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{
          color: '#059669', 
          marginTop: '.5rem',
          padding: '.75rem',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          fontSize: '0.875rem'
        }}>
          {success}
        </div>
      )}
    </form>
  )
}
