# Implementazione Formati Box con Prezzi Personalizzati

## 📝 Riepilogo Modifiche

Aggiunto al sistema di gestione prodotti la possibilità di configurare più formati box (6, 9, 12 praline) con prezzi personalizzati per ciascuno. 

## ✨ Funzionalità Implementate

### 1. Configurazione Formati nel Pannello Admin
- ✅ Selezione checkbox per attivare formati specifici (6, 9, 12 praline)
- ✅ Input prezzo personalizzato per ogni formato attivo
- ✅ Anteprima prezzi configurati in tempo reale
- ✅ Validazione: prezzo obbligatorio per formati selezionati

### 2. Visualizzazione nella Pagina Prodotto
- ✅ Mostra solo i formati configurati dall'admin
- ✅ Usa prezzi dal database invece di formule hardcoded
- ✅ Fallback alle formule automatiche se non configurato
- ✅ Selezione automatica primo formato disponibile

### 3. Database e API
- ✅ Nuovo campo `box_formats` (JSONB) in tabella `products`
- ✅ API aggiornate per gestire i formati box
- ✅ Type safety con TypeScript

## 📁 File Modificati

### 1. Database
**`supabase-add-box-formats.sql`** (Nuovo)
```sql
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS box_formats JSONB DEFAULT NULL;
```

Struttura dati:
```json
{
  "6": 18.90,
  "9": 26.90,
  "12": 34.90
}
```

### 2. Types
**`lib/supabase.ts`**
- Aggiunto `box_formats` all'interfaccia `Product`
- Tipo: `{ [key: string]: number } | null`

### 3. Pannello Admin
**`components/admin/AdminProducts.tsx`**
- Nuovo stato `boxFormats` per gestire selezione e prezzi
- Sezione UI "Formati Box Disponibili"
- 3 card interattive per ciascun formato
- Anteprima prezzi in tempo reale
- Validazione e salvataggio su database

### 4. API
**`app/api/products/route.ts`** (POST)
- Aggiunto parametro `box_formats` al body
- Salvataggio sul database

**`app/api/products/[id]/route.ts`** (PUT)
- Aggiunto parametro `box_formats` al body
- Aggiornamento sul database

### 5. Pagina Prodotto
**`app/product/[id]/page.tsx`**
- Logica per leggere `box_formats` dal database
- Mostra solo formati configurati
- Usa prezzi personalizzati invece di formule
- Fallback intelligente

## 🎨 Interfaccia Utente

### Pannello Admin - Sezione Formati Box

```
┌─────────────────────────────────────────────┐
│ Formati Box Disponibili                     │
│                                             │
│ Seleziona i formati box disponibili per     │
│ questo prodotto e indica il prezzo...       │
│                                             │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│ │☑ Box da │ │☑ Box da │ │☐ Box da │       │
│ │  6      │ │  9      │ │  12     │       │
│ │ praline │ │ praline │ │ praline │       │
│ │─────────│ │─────────│ │         │       │
│ │Prezzo   │ │Prezzo   │ │         │       │
│ │€ 18.90  │ │€ 26.90  │ │         │       │
│ └─────────┘ └─────────┘ └─────────┘       │
│                                             │
│ ╭───────────────────────────────────────╮  │
│ │ Anteprima prezzi:                     │  │
│ │ ● 6 praline: €18.90                   │  │
│ │ ● 9 praline: €26.90                   │  │
│ ╰───────────────────────────────────────╯  │
└─────────────────────────────────────────────┘
```

### Pagina Prodotto - Selettore Formati

Prima (tutti i formati, prezzi calcolati):
```
┌─────────────────────────────────────────┐
│ Formato Box:                            │
│ [6 praline]  [9 praline]  [12 praline] │
│  €18.90       €26.46       €33.08      │
└─────────────────────────────────────────┘
```

Dopo (solo formati configurati, prezzi personalizzati):
```
┌───────────────────────────────┐
│ Formato Box:                  │
│ [6 praline]  [9 praline]      │
│  €18.90       €26.90          │
└───────────────────────────────┘
```

## 🚀 Come Usare

### Setup Iniziale (Una Volta)

1. **Esegui lo script SQL su Supabase**
   ```sql
   -- Vai su Supabase Dashboard > SQL Editor
   -- Esegui: supabase-add-box-formati.sql
   ```

2. **Verifica che la colonna sia stata aggiunta**
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'products' 
   AND column_name = 'box_formats';
   ```

### Configurazione Prodotto con Formati Box

1. **Accedi al Pannello Admin**
   - Vai su `/admin`
   - Clicca su "Prodotti"

2. **Crea/Modifica Prodotto**
   - Clicca "Nuovo Prodotto" o "Modifica" su un prodotto esistente

3. **Compila Informazioni Base**
   - Nome, descrizione, prezzo base, categoria, ecc.

4. **Configura Formati Box** (Sezione dedicata)
   - Seleziona checkbox per i formati disponibili
   - Per ogni formato selezionato, inserisci il prezzo
   - Vedi l'anteprima in tempo reale

5. **Salva**
   - Clicca "Crea Prodotto" o "Aggiorna Prodotto"
   - I formati verranno salvati nel database

### Visualizzazione nel Catalogo

- I clienti vedranno solo i formati configurati
- I prezzi mostrati saranno quelli personalizzati
- Se nessun formato è configurato, il prodotto usa il prezzo base

## 💡 Esempi d'Uso

### Esempio 1: Praline con 3 Formati

**Admin configura:**
- ☑ Box da 6: €18.90
- ☑ Box da 9: €26.90
- ☑ Box da 12: €34.90

**Cliente vede:**
- 3 bottoni con prezzi esatti configurati
- Può scegliere tra tutti e 3 i formati

### Esempio 2: Solo 2 Formati

**Admin configura:**
- ☑ Box da 6: €15.00
- ☑ Box da 12: €28.00
- ☐ Box da 9: (non selezionato)

**Cliente vede:**
- 2 bottoni (solo 6 e 12)
- Non vede l'opzione da 9 praline

### Esempio 3: Prodotto Singolo (No Formati)

**Admin configura:**
- ☐ Non seleziona alcun formato
- Usa solo prezzo base €12.00

**Cliente vede:**
- Nessun selettore di formati
- Solo prezzo singolo: €12.00

## 🔧 Dettagli Tecnici

### Struttura Dati Database

```typescript
// Campo box_formats in products
box_formats: {
  "6"?: number,   // Prezzo per box da 6
  "9"?: number,   // Prezzo per box da 9
  "12"?: number   // Prezzo per box da 12
} | null
```

### Logica Pagina Prodotto

```typescript
// 1. Legge box_formats dal database
const formats = product.box_formats

// 2. Se esistono, usa quei prezzi
if (formats) {
  boxPrices = {
    6: formats['6'] || 0,
    9: formats['9'] || 0,
    12: formats['12'] || 0
  }
}

// 3. Altrimenti, usa formule di fallback
else {
  boxPrices = {
    6: basePrice,
    9: basePrice * 1.4,
    12: basePrice * 1.75
  }
}

// 4. Mostra solo formati con prezzo > 0
availableFormats = [6, 9, 12].filter(
  size => boxPrices[size] > 0
)
```

### Validazione Form Admin

```typescript
// Prezzo obbligatorio se formato selezionato
{boxFormats['6'].enabled && (
  <input
    type="number"
    required={true}  // Obbligatorio!
    value={boxFormats['6'].price}
  />
)}

// Solo formati validi vengono salvati
Object.entries(boxFormats).forEach(([size, data]) => {
  if (data.enabled && data.price) {
    const price = parseFloat(data.price)
    if (!isNaN(price) && price > 0) {
      boxFormatsData[size] = price  // ✅ Valido
    }
  }
})
```

## 📊 Vantaggi del Sistema

### Prima (Sistema Vecchio)
- ❌ Prezzi calcolati automaticamente con formule fisse
- ❌ Nessun controllo sui margini
- ❌ Sempre tutti e 3 i formati visibili
- ❌ Nessuna flessibilità

### Dopo (Sistema Nuovo)
- ✅ Controllo totale sui prezzi per ogni formato
- ✅ Margini personalizzabili per prodotto
- ✅ Mostra solo i formati disponibili
- ✅ Massima flessibilità
- ✅ Fallback intelligente per compatibilità

## 🎯 Casi d'Uso

### 1. Prodotti Premium
- Box da 6: €25.00
- Box da 12: €45.00 (sconto per quantità)
- Nessun formato da 9 (non conveniente)

### 2. Prodotti Economici
- Box da 6: €12.00
- Box da 9: €17.00
- Box da 12: €22.00

### 3. Prodotti Speciali
- Solo Box da 12: €39.00
- Formato esclusivo

### 4. Prodotti Base
- Nessun formato configurato
- Usa prezzo singolo del prodotto

## 🐛 Risoluzione Problemi

### Formati non appaiono nella pagina prodotto

**Causa**: Formati non configurati o prezzi = 0  
**Soluzione**: 
1. Verifica che i checkbox siano selezionati
2. Verifica che i prezzi siano > 0
3. Salva il prodotto

### Prezzi non si aggiornano

**Causa**: Cache del browser o dati non salvati  
**Soluzione**:
1. Ricarica la pagina con Ctrl+Shift+R
2. Verifica il salvataggio in admin
3. Controlla il database:
   ```sql
   SELECT name, box_formats 
   FROM products 
   WHERE id = 'product-id';
   ```

### Errore di validazione al salvataggio

**Causa**: Formato selezionato senza prezzo  
**Soluzione**: Inserisci un prezzo valido per ogni formato attivo

## 📚 File di Riferimento

- **SQL Schema**: `supabase-add-box-formats.sql`
- **Admin Form**: `components/admin/AdminProducts.tsx`
- **Product Page**: `app/product/[id]/page.tsx`
- **API POST**: `app/api/products/route.ts`
- **API PUT**: `app/api/products/[id]/route.ts`
- **Types**: `lib/supabase.ts`

## ✅ Checklist Implementazione

- [x] Schema database aggiornato
- [x] Types TypeScript aggiunti
- [x] UI admin per selezione formati
- [x] Validazione form
- [x] API POST aggiornata
- [x] API PUT aggiornata
- [x] Pagina prodotto aggiornata
- [x] Logica fallback implementata
- [x] Documentazione completa

## 🎉 Conclusione

Il sistema di formati box personalizzati è completamente implementato e pronto all'uso!

**Vantaggi chiave:**
- ✨ Controllo totale sui prezzi
- 💰 Margini ottimizzabili
- 🎨 UI intuitiva
- 🔄 Compatibilità con sistema esistente
- 📱 Responsive e accessibile

---

**Implementato con successo il**: 21 Ottobre 2025  
**Versione**: 1.0.0  
**Compatibilità**: Sistema upload immagini + Formati box

