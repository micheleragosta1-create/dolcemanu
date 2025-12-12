'use client'

import { useState } from 'react'
import { Phone, Mail } from 'lucide-react'

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: '' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: 'Messaggio inviato con successo! Ti contatteremo presto.'
        })
        setFormData({ name: '', email: '', phone: '', message: '' })
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.error || 'Errore nell\'invio del messaggio'
        })
      }
    } catch {
      setSubmitStatus({
        type: 'error',
        message: 'Errore di connessione. Riprova più tardi o contattaci via email.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contatti" className="contact-section">
      <div className="contact-container">
        <div className="contact-header">
          <span className="contact-label">Costiera Amalfitana</span>
          <h2 className="contact-title poppins">Contattaci</h2>
          <p className="contact-subtitle">
            Siamo qui per realizzare i tuoi dolci desideri
          </p>
        </div>

        <div className="contact-content">
          {/* Immagine Costiera con contatti sovrapposti */}
          <div className="contact-image-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1534008897995-27a23e859048?w=800&q=80" 
              alt="Costiera Amalfitana - Vista panoramica" 
              className="contact-image"
            />
            <div className="contact-image-overlay">
              <div className="contact-info-overlay">
                <div className="contact-item-overlay">
                  <Phone size={18} />
                  <span>+39 089 123 456</span>
                </div>
                <div className="contact-item-overlay">
                  <Mail size={18} />
                  <span>info@ondedicacao.com</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modulo di contatto */}
          <div className="contact-form-container">
            <h3>Inviaci un messaggio</h3>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nome *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="Il tuo nome"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="la-tua-email@esempio.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Telefono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="+39 123 456 7890"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Messaggio *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="form-textarea"
                  rows={5}
                  placeholder="Raccontaci cosa possiamo realizzare per te..."
                />
              </div>

              {submitStatus.type && (
                <div className={`form-status ${submitStatus.type === 'success' ? 'form-status-success' : 'form-status-error'}`}>
                  {submitStatus.message}
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary form-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Invio in corso...' : 'Invia Messaggio'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
