# 🎄 Quick Start - Carousel Homepage

## ✅ Cosa è Stato Fatto

### 1. **Carousel Video + Immagine Creato** ✨
Ho sostituito il singolo video hero con un **carousel interattivo** che alterna:

- **Slide 1**: Video homepage (quello che c'era prima)
- **Slide 2**: Immagine calendario dell'avvento con badge "🎄 Edizione Limitata"

### 2. **Componenti Aggiornati**
- ✅ `components/HeroCarouselVideo.tsx` - Nuovo carousel completo
- ✅ `app/page.tsx` - Homepage usa il carousel
- ✅ `app/globals.css` - Stili carousel con animazioni
- ❌ Rimosso banner separato (ora tutto nel carousel)

### 3. **Funzionalità**
- ⏩ Cambia automaticamente ogni 8 secondi
- ◀️ ▶️ Frecce per navigare manualmente
- ⏸️ ▶️ Pulsante Play/Pause
- ● Indicatori (pallini) per saltare alle slide
- 🖱️ Pausa automatica al passaggio del mouse
- 📱 Completamente responsive

---

## 🚀 Unica Cosa da Fare

### Salva l'immagine del calendario come:

```
public/images/advent-calendar.jpg
```

**Percorso Windows completo:**
```
C:\Users\m.ragosta\Desktop\Progetti Personali\Onde di Cacao\dolcemanu\public\images\advent-calendar.jpg
```

### Checklist:
- [ ] Nome file: `advent-calendar.jpg` (tutto minuscolo, con trattino)
- [ ] Formato: JPG
- [ ] Cartella: `public/images/`

---

## 🎨 Risultato

Quando apri http://localhost:3000 vedrai:

### Slide 1 (Video - 8 sec)
```
┌────────────────────────────────────┐
│ [<]              ●○           [>]  │
│                                    │
│      VIDEO IN RIPRODUZIONE         │
│                                    │
│   Emozioni di Cioccolato          │
│   Artigianalità dalla Costiera    │
│   Amalfitana...                   │
│                                    │
│   [Scopri i Prodotti]             │
│                              ⏸    │
└────────────────────────────────────┘
```

↓ (transizione fade 1 secondo)

### Slide 2 (Calendario - 8 sec)
```
┌────────────────────────────────────┐
│ [<]              ○●           [>]  │
│                                    │
│  🎄 Edizione Limitata              │
│                                    │
│    IMMAGINE CASETTA CIOCCOLATO     │
│                                    │
│   Calendario dell'Avvento         │
│   Aspetta il Natale giorno per    │
│   giorno con dolcezza             │
│                                    │
│   [Scopri il Calendario]          │
│                              ⏸    │
└────────────────────────────────────┘
```

---

## 🎯 Controlli

| Elemento | Posizione | Funzione |
|----------|-----------|----------|
| Freccia ← | Sinistra centro | Slide precedente |
| Freccia → | Destra centro | Slide successiva |
| Pallini ● | Centro basso | Salta a slide specifica |
| ⏸/▶ | Basso destra | Pausa/Riprendi |

---

## 🔧 Fallback Sistema

Se l'immagine `advent-calendar.jpg` non viene trovata, il carousel userà automaticamente `/images/ondedicacao2.png` come fallback.

**Quindi funzionerà comunque**, ma non vedrai la casetta di cioccolato!

---

## 📱 Responsive

- **Desktop**: Frecce laterali + controlli completi
- **Tablet**: Frecce più piccole, controlli adattati
- **Mobile**: Touch swipe + frecce compatte

---

## 🧪 Test Immediato

1. Salva l'immagine in `public/images/advent-calendar.jpg`
2. Il server si ricarica automaticamente
3. Vai su http://localhost:3000
4. Vedrai il carousel in azione! 🎉

---

## 💡 Se l'immagine appare "corrotta"

Significa che:
1. ❌ Nome file sbagliato (controlla maiuscole/minuscole)
2. ❌ Percorso sbagliato (deve essere in `public/images/`)
3. ❌ Formato sbagliato (deve essere `.jpg` non `.png`)
4. ❌ File effettivamente corrotto (scaricala di nuovo)

### Verifica veloce:
Apri Developer Tools (F12) → Tab Console

- ✅ Se tutto ok: nessun errore
- ❌ Se c'è problema: `404 advent-calendar.jpg`

---

**Tutto pronto!** Salva l'immagine e il carousel sarà perfetto! 🎄✨

