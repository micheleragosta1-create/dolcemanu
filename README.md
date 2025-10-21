#Onde di Cacao - Landing Page

Una landing page elegante e moderna per un business di cioccolatini artigianali dalla Costiera Amalfitana, realizzata con Next.js.

## 🍫 Caratteristiche

- **Design elegante**: Palette di colori caldi che richiama il cioccolato
- **Responsive**: Ottimizzato per desktop, tablet e mobile
- **Header fisso**: Navigazione sempre accessibile con carrello e wishlist
- **Carousel hero**: 3 slide con i prodotti principali
- **Sezione storia**: Racconta l'esperienza di Michele
- **Footer completo**: Link, social e modalità di pagamento
- **Animazioni fluide**: Transizioni e hover effects
- **SEO ottimizzato**: Meta tags e struttura semantica

## 🚀 Installazione e Avvio

### Prerequisiti

- Node.js 18+ installato
- npm o yarn

### Passi per l'installazione

1. **Installa le dipendenze**:
   ```bash
   npm install
   ```

2. **Avvia il server di sviluppo**:
   ```bash
   npm run dev
   ```

3. **Apri il browser** e vai su [http://localhost:3000](http://localhost:3000)

## 📁 Struttura del Progetto

```
project 11/
├── app/
│   ├── globals.css          # Stili globali
│   ├── layout.tsx           # Layout principale
│   └── page.tsx             # Homepage
├── components/
│   ├── Header.tsx           # Header con navigazione
│   ├── HeroCarousel.tsx     # Carousel principale
│   ├── Storia.tsx           # Sezione "Chi siamo"
│   └── Footer.tsx           # Footer
├── package.json
├── next.config.js
└── tsconfig.json
```

## 🎨 Personalizzazione

### Colori del Brand

I colori principali sono definiti nel file `globals.css`:

- **Marrone cioccolato**: `#8b4513`
- **Marrone chiaro**: `#a0522d`
- **Oro**: `#d4af37`
- **Crema**: `#faf9f6`
- **Scuro**: `#2c1810`

### Immagini

Le immagini utilizzano placeholder da Unsplash. Per la produzione, sostituisci con:

- Logo del brand
- Foto dei prodotti reali
- Foto di Michele al lavoro
- Icone dei metodi di pagamento personalizzate

### Testi

Modifica i contenuti nei seguenti file:

- `components/HeroCarousel.tsx` - Slide del carousel
- `components/Storia.tsx` - Storia di Michele
- `components/Footer.tsx` - Informazioni di contatto

## 🛠 Comandi Disponibili

- `npm run dev` - Avvia il server di sviluppo
- `npm run build` - Crea la build di produzione
- `npm run start` - Avvia il server di produzione
- `npm run lint` - Controlla gli errori di linting

## 📱 Responsive Design

Il sito è ottimizzato per:

- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: fino a 767px

## 🌟 Funzionalità Avanzate

- **Carousel automatico**: Cambia slide ogni 6 secondi
- **Pausa al hover**: Il carousel si ferma quando l'utente ci passa sopra
- **Navigazione accessibile**: Focus outline per utenti con tastiera
- **Smooth scrolling**: Scroll fluido tra le sezioni
- **Animazioni performanti**: Ridotte per utenti con `prefers-reduced-motion`

## 🚀 Deploy

### Vercel (Consigliato)

1. Connetti il repository a Vercel
2. Deploy automatico ad ogni push

### Netlify

1. Build command: `npm run build`
2. Publish directory: `.next`

### Server tradizionale

1. `npm run build`
2. Carica la cartella `.next` sul server
3. Configura Node.js per servire l'applicazione

## 📞 Supporto

Per domande o personalizzazioni, contatta:

- Email: info@ondedicacao.com
- Sviluppatore: [Il tuo contatto]

## 📄 Licenza

Questo progetto è proprietario di Cioccolatini Michele.

---

*Realizzato con ❤️ e Next.js*
