'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Qui puoi aggiungere la logica per inviare il form
    console.log('Form submitted:', formData)
    alert('Messaggio inviato! Ti contatteremo presto.')
    setFormData({ name: '', email: '', phone: '', message: '' })
  }

  return (
    <section id="contatti" className="contact-section">
      <div className="contact-container">
        <div className="contact-header">
          <h2 className="contact-title">Contattaci</h2>
          <p className="contact-subtitle">
            Siamo qui per realizzare i tuoi dolci desideri
          </p>
        </div>

        <div className="contact-content">
          {/* Informazioni di contatto */}
          <div className="contact-info">
            <h3>Informazioni</h3>
            
            <div className="contact-item">
              <MapPin className="contact-icon" size={20} />
              <div>
                <strong>Indirizzo</strong>
                <p>Via Roma 123, 84017 Positano (SA)<br />Costiera Amalfitana</p>
              </div>
            </div>

            <div className="contact-item">
              <Phone className="contact-icon" size={20} />
              <div>
                <strong>Telefono</strong>
                <p>+39 089 123 456</p>
              </div>
            </div>

            <div className="contact-item">
              <Mail className="contact-icon" size={20} />
              <div>
                <strong>Email</strong>
                <p>info@emanuelanapolitano.it</p>
              </div>
            </div>

            <div className="contact-item">
              <Clock className="contact-icon" size={20} />
              <div>
                <strong>Orari</strong>
                <p>
                  Lun-Sab: 9:00 - 19:00<br />
                  Domenica: 10:00 - 18:00
                </p>
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

              <button type="submit" className="btn btn-primary form-submit">
                Invia Messaggio
              </button>
            </form>
          </div>
        </div>

        {/* Mappa */}
        <div className="map-container">
          <h3>Dove Trovarci</h3>
          <div className="map-wrapper">
            {/* Placeholder per la mappa - sostituire con Google Maps embed reale */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3021.4524074653446!2d14.4897365!3d40.6280244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x133b9e6e21e6b7c9%3A0x7a9cc2f2b81a3c8d!2sPositano%2C%20Province%20of%20Salerno%2C%20Italy!5e0!3m2!1sen!2sit!4v1647890123456!5m2!1sen!2sit"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mappa del negozio - Positano"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
