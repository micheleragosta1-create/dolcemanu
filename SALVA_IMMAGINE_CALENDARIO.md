# 📸 Come Salvare l'Immagine del Calendario dell'Avvento

## 🎯 Istruzioni Passo-Passo

### **1. Scarica l'immagine che mi hai inviato**
   - L'immagine con la casetta di cioccolato e i numeri 21, 23, 24

### **2. Rinomina il file**
   - Nome file: `advent-calendar.jpg`
   - Formato: JPG (importante!)

### **3. Salva nella cartella corretta**

**Percorso completo:**
```
C:\Users\m.ragosta\Desktop\Progetti Personali\Onde di Cacao\dolcemanu\public\images\advent-calendar.jpg
```

**Navigazione cartelle:**
```
dolcemanu/
  └── public/
      └── images/
          └── advent-calendar.jpg  ← Metti qui!
```

---

## ✅ Checklist

- [ ] File rinominato come `advent-calendar.jpg`
- [ ] Formato JPG (non PNG, WebP o altri formati)
- [ ] Salvato in `public/images/`
- [ ] Nome file scritto correttamente (minuscolo, con trattino)

---

## 🎨 Caratteristiche Immagine

### Ottimale:
- **Formato**: JPG
- **Dimensioni**: 1200x800px o superiore
- **Aspect ratio**: 3:2 o 16:9
- **Qualità**: Alta (80-90%)

### La tua immagine è perfetta perché:
- ✅ Colori natalizi (rosso, bianco, oro)
- ✅ Mostra chiaramente la casetta
- ✅ Numeri 21, 23, 24 visibili
- ✅ Sfondo festivo con luci

---

## 🔧 Troubleshooting

### "Immagine non si vede / appare corrotta"

**Causa 1: Nome file errato**
- ✅ Deve essere: `advent-calendar.jpg`
- ❌ NON: `advent calendar.jpg` (spazio)
- ❌ NON: `Advent-Calendar.jpg` (maiuscole)
- ❌ NON: `advent-calendar.png` (estensione sbagliata)

**Causa 2: Percorso sbagliato**
- ✅ Deve essere in: `public/images/`
- ❌ NON in: `public/` (radice)
- ❌ NON in: `images/` (senza public)
- ❌ NON in: `public/assets/`

**Causa 3: Formato immagine**
- Se l'immagine è PNG, convertila in JPG
- Windows: Apri con Paint → "Salva come" → JPG
- Online: usa un converter online (PNG to JPG)

**Causa 4: File corrotto**
- Prova a riscaricare l'immagine originale
- Apri l'immagine con un editor per verificare che non sia corrotta

---

## 🎁 Cosa Succede Dopo

Quando salvi l'immagine correttamente:

1. **Il server si ricarica automaticamente** (hot reload)
2. **Vai su** `http://localhost:3000`
3. **Vedrai il carousel** con 2 slide:
   - **Slide 1**: Video introduttivo (come prima)
   - **Slide 2**: Immagine calendario dell'avvento con badge "🎄 Edizione Limitata"

---

## 🎠 Funzionalità Carousel

### Controlli:
- **Frecce sinistra/destra**: Cambia slide manualmente
- **Indicatori (pallini)**: Salta direttamente a una slide
- **Play/Pause (basso a destra)**: Ferma/riprendi rotazione automatica
- **Cambia automaticamente** ogni 8 secondi

### Comportamento:
- **Slide 1 (Video)**: Si riproduce in loop
- **Slide 2 (Calendario)**: Immagine statica con badge animato
- **Hover**: Pausa automatica quando passi il mouse
- **Transizione**: Fade lento e fluido (1 secondo)

---

## 📋 Fallback

Se l'immagine `advent-calendar.jpg` non si trova, il carousel userà automaticamente:
```
/images/ondedicacao2.png
```

Quindi vedrai comunque qualcosa, ma non l'immagine del calendario.

---

## 🧪 Test Veloce

### Per verificare che tutto funzioni:

1. **Apri Developer Tools** (F12)
2. **Tab Console**: Non devono esserci errori tipo "404 advent-calendar.jpg"
3. **Tab Network**: 
   - Filtra per "img"
   - Cerca "advent-calendar.jpg"
   - Deve essere "Status 200" (verde)

Se vedi "Status 404" (rosso) → l'immagine non è nel posto giusto!

---

## 💡 Suggerimento Veloce

### Metodo Drag & Drop (più veloce):

1. Apri la cartella `public/images/` in Esplora Risorse
2. Trascina l'immagine del calendario nella cartella
3. Rinominala in `advent-calendar.jpg`
4. Fatto! ✨

---

## 🎄 Risultato Finale

Il carousel mostrerà:

```
┌─────────────────────────────────────┐
│  [< Freccia]   ●○   [Freccia >]     │
│                                      │
│     🎄 Edizione Limitata             │
│                                      │
│   Calendario dell'Avvento           │
│   Aspetta il Natale giorno per      │
│   giorno con dolcezza               │
│                                      │
│   [Scopri il Calendario]            │
│                                      │
│                            ⏸ Play   │
└─────────────────────────────────────┘
```

Con l'immagine della tua bellissima casetta di cioccolato come sfondo!

---

**Qualsiasi problema, fammi sapere!** 🎅✨

