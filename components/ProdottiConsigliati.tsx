"use client"

import { useCart } from './CartContext'

const prodotti = [
  {
    id: 1,
    nome: "Box Classico",
    descrizione: "12 praline assortite con ganache al cioccolato fondente",
    prezzo: 24.90,
    immagine: "/images/prodotto-1.svg",
    etichetta: "Bestseller"
  },
  {
    id: 2,
    nome: "Box Gourmet",
    descrizione: "16 praline premium con ripieno al limoncello e nocciole",
    prezzo: 34.90,
    immagine: "/images/prodotto-2.svg",
    etichetta: "Premium"
  },
  {
    id: 3,
    nome: "Box Regalo",
    descrizione: "20 praline eleganti in confezione regalo dorata",
    prezzo: 39.90,
    immagine: "/images/prodotto-3.svg",
    etichetta: "Gift"
  }
]

export default function ProdottiConsigliati() {
  const { addItem } = useCart()
  return (
    <section id="shop" className="prodotti-section">
      <div className="prodotti-container">
        <div className="prodotti-header">
          <h2 className="prodotti-title">I Nostri Prodotti Consigliati</h2>
          <p className="prodotti-subtitle">
            Scopri le nostre creazioni più amate dai clienti
          </p>
        </div>

        <div className="prodotti-grid">
          {prodotti.map((prodotto) => (
            <div key={prodotto.id} className="prodotto-card">
              <div className="prodotto-image-container">
                <img
                  src={prodotto.immagine}
                  alt={prodotto.nome}
                  className="prodotto-image"
                />
                <span className="prodotto-etichetta">{prodotto.etichetta}</span>
              </div>
              
              <div className="prodotto-content">
                <h3 className="prodotto-nome">{prodotto.nome}</h3>
                <p className="prodotto-descrizione">{prodotto.descrizione}</p>
                <div className="prodotto-footer">
                  <span className="prodotto-prezzo">€{prodotto.prezzo.toFixed(2)}</span>
                  <button 
                    className="btn btn-primary prodotto-btn"
                    onClick={() => addItem({
                      id: prodotto.id,
                      nome: prodotto.nome,
                      prezzo: prodotto.prezzo,
                      immagine: prodotto.immagine
                    })}
                  >
                    Aggiungi al Carrello
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
