import { Instagram, Facebook, MessageCircle } from 'lucide-react'

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
        <img 
          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNTAgMTBDNjUgMTAgNzUgMjAgNzUgMzVDNzUgNDAgNzMgNDUgNzAgNDlINzVDODAgNDkgODUgNTQgODUgNTlWNzVDODUgODUgNzUgOTUgNjUgOTVIMzVDMjUgOTUgMTUgODUgMTUgNzVWNTlDMTUgNTQgMjAgNDkgMjUgNDlIMzBDMjcgNDUgMjUgNDAgMjUgMzVDMjUgMjAgMzUgMTAgNTAgMTBaIiBmaWxsPSIjRkZBN0E3Ii8+CjxjaXJjbGUgY3g9IjU1IiBjeT0iMTUiIHI9IjgiIGZpbGw9IiNGRjZCNkIiLz4KPHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwLCAyMCkiPgo8cGF0aCBkPSJNNDAgMEMyNSAwIDE1IDEwIDE1IDI1QzE1IDMwIDIwIDMwIDI1IDMwSDU1QzYwIDMwIDY1IDMwIDY1IDI1QzY1IDEwIDU1IDAgNDAgMFoiIGZpbGw9IiNGRkE3QTciLz4KPHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ3aGl0ZSIvPgo8IS0tIEN1cGNha2UgY29udGFpbmVyIC0tPgo8cGF0aCBkPSJNMjAgNDBDMjAgMzUgMjUgMzAgMzAgMzBINzBDNzUgMzAgODAgMzUgODAgNDBWNzVDODAgODMgNzMgOTAgNjUgOTBIMzVDMjcgOTAgMjAgODMgMjAgNzVWNDBaIiBmaWxsPSIjRjU5NEQwIi8+CjwhLS0gRnJvc3RpbmcvY3JlYW0gLS0+CjxwYXRoIGQ9Ik0yNSAzNUM0MCAyNSA2MCAyNSA3NSAzNUM3MCA0MCA2MCA0MCA1MCA0MEM0MCA0MCAzMCA0MCAyNSAzNVoiIGZpbGw9IiNGRkM0RDYiLz4KPHN2ZyBpZD0iZWVjYzIwYzUtMGNhZC00NDg0LTkzZWUtOTNlMGQzMjBjOWY0IiBkYXRhLW5hbWU9IkViZW5lIDEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxkZWZzPjxzdHlsZT4uMTYzYTE1YTgtOWQzZS00ZmVkLWFlMzYtZmJkYzQ5MDhkYjQxe2ZpbGw6IzZjMzAwZH0uZTQ0YjM4Y2UtOTY3YS00YzM1LWI0N2UtMjY4YzZhZjZjOWFke2ZpbGw6I2ZmNmI2Yn08L3N0eWxlPjwvZGVmcz48cGF0aCBjbGFzcz0iZTQ0YjM4Y2UtOTY3YS00YzM1LWI0N2UtMjY4YzZhZjZjOWFkIiBkPSJNNDcuOTMsNzMuODNjNC4yOSwwLDcuNzgtMy40OSw3Ljc4LTcuNzhWNTMuMThjLTUuMjUtMS4yOS0xMC4zMS0xLjI5LTE1LjU2LDBWNjYuMDVjMCw0LjI5LDMuNDksNy43OCw3Ljc4LDcuNzhaIi8+PHBhdGggY2xhc3M9IjE2M2ExNWE4LTlkM2UtNGZlZC1hZTM2LWZiZGM0OTA4ZGI0MSIgZD0iTTQ3LjkzLDQ4LjQ2YzIuNDgsMCw0LjQ5LTIuMDEsNC40OS00LjQ5VjM4YzAtMi40OC0yLjAxLTQuNDktNC40OS00LjQ5cy00LjQ5LDIuMDEtNC40OSw0LjQ5djUuOTdjMCwyLjQ4LDIuMDEsNC40OSw0LjQ5LDQuNDlaIi8+PC9zdmc+CjwhLS0gQ2hlcnJ5IC0tPgo8Y2lyY2xlIGN4PSI1NSIgY3k9IjIyIiByPSI0IiBmaWxsPSIjREMyNjI2Ii8+CjwhLS0gQ2hlcnJ5IHN0ZW0gLS0+CjxwYXRoIGQ9Ik01NSAxNEM1NSAxNiA1NyAxOCA1NSAyMiIgc3Ryb2tlPSIjMzQ5NzBCIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz4KPC9zdmc+Cjx0ZXh0IHg9IjUiIHk9Ijg1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iOCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNGRjZCNkIiPkVtYW51ZWxhPC90ZXh0Pgo8dGV4dCB4PSI1IiB5PSI5NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjYiIGZpbGw9IiNGRjZCNkIiPk5hcG9saXRhbm88L3RleHQ+Cjx0ZXh0IHg9IjUiIHk9IjEwMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQiIGZpbGw9IiM2NjY2NjYiPnBhc3RyeSBjaGVmPC90ZXh0Pgo8L3N2Zz4="
          alt="Emanuela Napolitano Pastry Chef"
          className="footer-logo"
        />
        <p>&copy; 2024 Emanuela Napolitano. Tutti i diritti riservati.</p>
      </div>
    </footer>
  )
}
