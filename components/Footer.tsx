import { Instagram, Facebook, MessageCircle } from 'lucide-react'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Link Rapidi</h3>
          <ul>
            <li><a href="#shop">Shop</a></li>
            <li><a href="#storia">Chi Siamo</a></li>
            <li><a href="#contatti">Contatti</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Informazioni</h3>
          <ul>
            <li><a href="#termini">Termini & Condizioni</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#spedizioni">Spedizioni</a></li>
            <li><a href="#resi">Resi e Rimborsi</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contatti</h3>
          <ul>
            <li>Email: info@cioccolatinimichele.it</li>
            <li>Tel: +39 089 123 456</li>
            <li>Costiera Amalfitana, Italia</li>
          </ul>
          
          <div className="social-icons">
            <a href="#" className="social-icon" title="Instagram">
              <Instagram size={20} />
            </a>
            <a href="#" className="social-icon" title="Facebook">
              <Facebook size={20} />
            </a>
            <a href="#" className="social-icon" title="WhatsApp">
              <MessageCircle size={20} />
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h3>Pagamenti Sicuri</h3>
          <div className="payment-icons">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" 
              alt="Visa" 
              className="payment-icon"
            />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
              alt="Mastercard" 
              className="payment-icon"
            />
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" 
              alt="PayPal" 
              className="payment-icon"
            />
          </div>
          
          <p style={{marginTop: '1rem', fontSize: '0.9rem', color: '#ccc'}}>
            Cioccolato artigianale dal cuore della Costiera Amalfitana
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <a href="/" aria-label="Vai alla home">
          <Logo className="footer-logo" />
        </a>
        <p>&copy; 2024 Emanuela Napolitano. Tutti i diritti riservati.</p>
      </div>
    </footer>
  )
}
