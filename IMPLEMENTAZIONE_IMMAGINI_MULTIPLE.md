# 🖼️ Implementazione Immagini Multiple per Prodotti

## 📋 Panoramica

Il sistema ora supporta **immagini multiple** per ogni prodotto, permettendo di creare una galleria fotografica completa nel carousel della pagina prodotto. La prima immagine caricata sarà sempre quella principale mostrata nello shop.

---

## 🔧 Modifiche Implementate

### 1. **Database** (`supabase-add-multiple-images.sql`)

**Nuova colonna:**
```sql
images JSONB DEFAULT '[]'::jsonb
```

- Array di URL immagini in formato JSON
- La prima immagine è quella principale
- Esempio: `["url1.jpg", "url2.jpg", "url3.jpg"]`
- Indice GIN per query veloci
- Funzione helper `get_main_product_image()` per ottenere l'immagine principale

**Migrazione automatica:**
- I prodotti esistenti con `image_url` vengono automaticamente migrati al nuovo formato
- `image_url` rimane per retrocompatibilità

### 2. **TypeScript Interface** (`lib/supabase.ts`)

Aggiunto al tipo `Product`:
```typescript
images?: string[] | null // es. ["url1.jpg", "url2.jpg", "url3.jpg"]
```

### 3. **Pannello Admin** (`components/admin/AdminProducts.tsx`)

**Nuove funzionalità:**

#### 📸 Sezione "Galleria Immagini Prodotto"
- Upload multiplo di immagini (seleziona più file contemporaneamente)
- Anteprima di tutte le immagini caricate
- Badge "Principale" sulla prima immagine
- Riordinamento immagini con pulsanti ↑ ↓
- Rimozione singole immagini con pulsante ✕
- Pulsante "Aggiungi immagini" per caricarne altre

#### Gestione Upload:
- Carica tutte le immagini su Supabase Storage
- Ottimizza automaticamente ogni immagine
- Salva l'array degli URL nel database
- La prima immagine diventa `image_url` (principale)

### 4. **Visualizzazione Prodotto** (`app/product/[id]/page.tsx`)

Il componente `ProductGallery` ora:
- Usa automaticamente tutte le immagini disponibili dal campo `images`
- Fallback a `image_url` se non ci sono immagini multiple
- Mostra carousel completo con tutte le foto

---

## 🚀 Come Utilizzare

### Per Admin

1. **Accedi al pannello admin** (`/admin`)
2. **Vai alla sezione Prodotti**
3. **Crea o modifica un prodotto**
4. **Scorri fino a "📸 Galleria Immagini Prodotto"**
5. **Clicca "Aggiungi immagini"**
6. **Seleziona multiple immagini** (Ctrl/Cmd + Click per selezioni multiple)
7. **Riordina le immagini** se necessario:
   - La **prima immagine** sarà quella principale dello shop
   - Usa i pulsanti ↑ ↓ per cambiare l'ordine
8. **Rimuovi immagini indesiderate** con il pulsante ✕
9. **Salva il prodotto**

### Ordine Immagini

⚠️ **IMPORTANTE**: L'ordine delle immagini è importante!

1. **Prima immagine** = Immagine principale mostrata:
   - Nella lista prodotti dello shop
   - Nelle anteprime
   - Nei risultati di ricerca
   
2. **Altre immagini** = Carousel nella pagina prodotto:
   - Viste laterali
   - Dettagli
   - Packaging
   - Ingredienti

### Esempio Pratico

```
Prodotto: "Praline Amalfi"

Immagini caricate (in ordine):
1. praline-amalfi-fronte.jpg    → Principale (shop)
2. praline-amalfi-lato.jpg      → Carousel
3. praline-amalfi-dettaglio.jpg → Carousel
4. praline-amalfi-packaging.jpg → Carousel
```

---

## 📊 Struttura Dati

### Nel Database (Supabase)

```json
{
  "id": "abc-123",
  "name": "Praline Amalfi",
  "image_url": "https://..../praline-amalfi-fronte.jpg",
  "images": [
    "https://..../praline-amalfi-fronte.jpg",
    "https://..../praline-amalfi-lato.jpg",
    "https://..../praline-amalfi-dettaglio.jpg"
  ],
  ...
}
```

### Nello Storage (Supabase)

```
product-images/
  ├── praline-amalfi-1_xyz123.jpg
  ├── praline-amalfi-2_xyz124.jpg
  └── praline-amalfi-3_xyz125.jpg
```

---

## 🎨 Interfaccia Utente

### Pannello Admin

```
┌─────────────────────────────────────────────┐
│ 📸 Galleria Immagini Prodotto               │
│                                             │
│ Carica immagini aggiuntive per il carousel │
│ La prima immagine sarà quella principale    │
│                                             │
│ ┌────────┐ ┌────────┐ ┌────────┐          │
│ │ IMG 1  │ │ IMG 2  │ │ IMG 3  │          │
│ │[PRINC] │ │        │ │        │          │
│ │ ↑ ↓ ✕ │ │ ↑ ↓ ✕ │ │ ↑ ↓ ✕ │          │
│ └────────┘ └────────┘ └────────┘          │
│                                             │
│ [ + Aggiungi immagini ]                    │
└─────────────────────────────────────────────┘
```

### Pagina Prodotto (Utente)

```
┌────────────────────┐  ┌────────────────────┐
│                    │  │ Nome Prodotto      │
│   [IMG CAROUSEL]   │  │                    │
│   ← IMG 1/3 →      │  │ Prezzo: €24.90     │
│                    │  │                    │
│   • • •            │  │ [Aggiungi carrello]│
└────────────────────┘  └────────────────────┘
```

---

## ✅ Checklist Setup

Per utilizzare questa funzionalità:

1. ✅ **Esegui lo script SQL** in Supabase:
   ```bash
   # Nella dashboard Supabase, SQL Editor
   # Copia e incolla il contenuto di:
   supabase-add-multiple-images.sql
   ```

2. ✅ **Verifica il campo nel database**:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'products' AND column_name = 'images';
   ```

3. ✅ **Testa nel pannello admin**:
   - Crea un nuovo prodotto
   - Carica 3-4 immagini
   - Verifica l'ordine
   - Salva

4. ✅ **Verifica la pagina prodotto**:
   - Vai a `/product/[id]`
   - Controlla che il carousel mostri tutte le immagini
   - Swipe/Click sulle frecce per navigare

---

## 🎯 Best Practices

### Numero di Immagini

- **Minimo**: 1 immagine (quella principale)
- **Consigliato**: 3-5 immagini per un buon carousel
- **Massimo**: 8-10 immagini (per non appesantire)

### Tipo di Immagini da Caricare

1. **Immagine principale** (fronte del prodotto, sfondo bianco)
2. **Vista laterale** (angolazione diversa)
3. **Dettaglio** (zoom su texture/decorazioni)
4. **Packaging** (confezione completa)
5. **Lifestyle** (prodotto in uso/ambientazione)

### Qualità Immagini

- **Formato**: JPG o PNG
- **Dimensione**: Almeno 800x800px
- **Peso**: Max 5MB (vengono ottimizzate automaticamente)
- **Sfondo**: Preferibilmente bianco o neutro
- **Illuminazione**: Buona e uniforme

### Naming Convention

Quando carichi le immagini, usa nomi descrittivi:
```
✅ BUONO:
- praline-amalfi-fronte.jpg
- praline-amalfi-dettaglio.jpg
- praline-amalfi-packaging.jpg

❌ EVITA:
- IMG_1234.jpg
- foto.jpg
- immagine.jpg
```

---

## 🔄 Retrocompatibilità

Il sistema mantiene piena retrocompatibilità:

- ✅ Prodotti esistenti con solo `image_url` continuano a funzionare
- ✅ Se non ci sono immagini multiple, usa automaticamente `image_url`
- ✅ Il campo `image_url` è sempre sincronizzato con la prima immagine di `images`
- ✅ Nessuna modifica necessaria per prodotti già esistenti

---

## 🐛 Troubleshooting

### Le immagini non si caricano

1. Verifica che il bucket "product-images" esista in Supabase Storage
2. Controlla le policy di accesso (devono permettere upload agli admin)
3. Verifica che `SUPABASE_SERVICE_ROLE_KEY` sia configurata

### L'ordine delle immagini non si salva

1. Assicurati di riordinare PRIMA di salvare il prodotto
2. L'ordine viene salvato solo al submit del form
3. Controlla che il campo `images` sia un array valido nel database

### Il carousel non mostra tutte le immagini

1. Controlla che il prodotto abbia effettivamente il campo `images` popolato
2. Verifica che `ProductGallery` riceva l'array corretto
3. Controlla la console browser per eventuali errori

---

## 📈 Vantaggi

### Per il Business
- ✅ Mostra il prodotto da più angolazioni
- ✅ Aumenta la fiducia del cliente
- ✅ Riduce resi (il cliente sa cosa aspettarsi)
- ✅ Migliora le conversioni

### Per i Clienti
- ✅ Vede il prodotto in dettaglio
- ✅ Può zoomare su particolari
- ✅ Ha un'idea completa prima dell'acquisto
- ✅ Esperienza shopping migliore

### Per gli Admin
- ✅ Interfaccia intuitiva drag & drop
- ✅ Anteprima immediata
- ✅ Riordinamento semplice
- ✅ Upload multiplo rapido

---

## 🎉 Conclusione

Il sistema di **immagini multiple** trasforma la visualizzazione dei prodotti da una singola foto statica a una galleria interattiva completa, migliorando significativamente l'esperienza utente e le possibilità di conversione! 🖼️✨




