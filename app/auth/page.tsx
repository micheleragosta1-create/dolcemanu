"use client"

import { useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Mail, Lock, User, Phone, CheckCircle } from "lucide-react"

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
          padding: 8rem 2rem 4rem;
          background: #ffffff;
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
          box-shadow: 0 20px 50px rgba(0,0,0,0.06);
          padding: 2rem;
        }
        .auth-header { text-align: center; margin-bottom: 1.5rem; }
        .auth-title { font-size: 2rem; font-weight: 600; letter-spacing: -0.5px; }
        .auth-subtitle { color: #666; margin-top: 0.5rem; }
        .auth-tabs { display: inline-flex; gap: 0.5rem; background: #f5f5f5; border-radius: 10px; padding: 0.25rem; margin: 1.25rem auto 0; }
        .auth-tab {
          border: none; background: transparent; padding: 0.6rem 1.1rem; border-radius: 8px; cursor: pointer;
          font-weight: 600; color: #666; transition: all .2s ease; letter-spacing: .3px;
        }
        .auth-tab.active { background: #ff6b6b; color: #fff; }

        .form { display: grid; gap: 1rem; margin-top: 0.5rem; }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .field { display: flex; flex-direction: column; gap: .35rem; }
        .label { font-size: .9rem; font-weight: 600; color: #000; }
        .input {
          display: flex; align-items: center; gap: .5rem; padding: .75rem 1rem; border: 2px solid #e9ecef; border-radius: 10px; background: #fff;
          font-family: Inter, sans-serif; transition: border-color .2s ease;
        }
        .input:focus-within { border-color: #ff6b6b; }
        .input input, .input password, .input email, .input tel { flex: 1; border: none; outline: none; font-size: 1rem; background: transparent; }
        .helper { font-size: .85rem; color: #888; }

        .actions { display: flex; justify-content: space-between; align-items: center; margin-top: .5rem; }
        .link { color: #ff6b6b; text-decoration: none; font-weight: 600; }
        .submit { margin-top: .5rem; }

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
        }
        @media (max-width: 480px) {
          .row { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  )
}

function LoginForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Accesso simulato. Integrare API/Backend per procedere.")
  }
  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label className="label" htmlFor="login-email">Email</label>
        <div className="input">
          <Mail size={18} color="#ff6b6b" />
          <input id="login-email" type="email" placeholder="nome@email.com" required />
        </div>
      </div>
      <div className="field">
        <label className="label" htmlFor="login-password">Password</label>
        <div className="input">
          <Lock size={18} color="#ff6b6b" />
          <input id="login-password" type="password" placeholder="La tua password" required />
        </div>
      </div>
      <div className="actions">
        <a href="#" className="link">Password dimenticata?</a>
      </div>
      <button type="submit" className="btn btn-primary submit">Accedi</button>
    </form>
  )
}

function RegisterForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Registrazione simulata. Integrare API/Backend per procedere.")
  }
  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="row">
        <div className="field">
          <label className="label" htmlFor="name">Nome e cognome</label>
          <div className="input">
            <User size={18} color="#ff6b6b" />
            <input id="name" type="text" placeholder="Es. Emanuela Napolitano" required />
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor="phone">Telefono (opzionale)</label>
          <div className="input">
            <Phone size={18} color="#ff6b6b" />
            <input id="phone" type="tel" placeholder="Es. +39 333 123 4567" />
          </div>
        </div>
      </div>
      <div className="field">
        <label className="label" htmlFor="reg-email">Email</label>
        <div className="input">
          <Mail size={18} color="#ff6b6b" />
          <input id="reg-email" type="email" placeholder="nome@email.com" required />
        </div>
      </div>
      <div className="row">
        <div className="field">
          <label className="label" htmlFor="reg-pass">Password</label>
          <div className="input">
            <Lock size={18} color="#ff6b6b" />
            <input id="reg-pass" type="password" placeholder="Minimo 8 caratteri" required />
          </div>
          <span className="helper">Usa almeno 8 caratteri, una lettera e un numero</span>
        </div>
        <div className="field">
          <label className="label" htmlFor="reg-pass2">Conferma Password</label>
          <div className="input">
            <Lock size={18} color="#ff6b6b" />
            <input id="reg-pass2" type="password" placeholder="Ripeti password" required />
          </div>
        </div>
      </div>
      <button type="submit" className="btn btn-primary submit">Crea account</button>
    </form>
  )
}
