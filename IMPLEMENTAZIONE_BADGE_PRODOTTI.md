# 🏷️ Sistema di Badge per Prodotti

## 📋 Panoramica

Il sistema di **badge** permette di evidenziare prodotti con etichette visive nello shop:
- **⭐ Novità** - Prodotti appena aggiunti (impostato automaticamente)
- **🔥 Bestseller** - Prodotti più venduti (da impostare manualmente)
- **💰 Sconto** - Prodotti con percentuale di sconto

---

## 🗂️ Struttura Database

### Nuove Colonne nella Tabella `products`

```sql
-- Badge "Novità"
is_new BOOLEAN DEFAULT false

-- Badge "Bestseller"
is_bestseller BOOLEAN DEFAULT false

-- Percentuale di sconto
discount_percentage INTEGER DEFAULT NULL
```

**Indici per performance:**
```sql
CREATE INDEX idx_products_is_new ON products(is_new);
CREATE INDEX idx_products_is_bestseller ON products(is_bestseller);
CREATE INDEX idx_products_discount ON products(discount_percentage);
```

---

## ✨ Funzionalità Principali

### 1. Badge "Novità" - Automatico ⭐

Quando crei un **nuovo prodotto**, il badge "Novità" viene **attivato automaticamente**:

- ✅ **Form nuovo prodotto**: Checkbox "Novità" già spuntato di default
- ✅ **API**: Il campo `is_new` viene impostato a `true` automaticamente
- ✅ **Shop**: Il badge verde "Novità" appare sulla card del prodotto

**Quando usarlo:**
- Lascia attivo per prodotti appena lanciati
- Disattiva dopo qualche settimana quando non è più una novità

### 2. Badge "Bestseller" - Manuale 🔥

Il badge "Bestseller" va **attivato manualmente** per prodotti che vendono di più:

- Checkbox nel form di caricamento/modifica prodotto
- Badge arancione "Bestseller" visibile nello shop
- Aiuta gli utenti a scegliere i prodotti più popolari

**Quando usarlo:**
- Prodotti con più vendite
- Top 3-5 prodotti del mese
- Prodotti con molte recensioni positive

### 3. Badge "Sconto" - Percentuale 💰

Mostra la percentuale di sconto sui prodotti in promozione:

- Campo numerico: inserisci la percentuale (0-100)
- Badge rosso "-XX%" visibile nello shop
- Attira l'attenzione su offerte speciali

**Quando usarlo:**
- Promozioni stagionali
- Liquidazione stock
- Offerte flash
- Saldi

---

## 📝 Form di Caricamento Prodotto

### Sezione "Badge e Promozioni"

Nel form admin è stata aggiunta una nuova sezione dedicata:

```tsx
{/* Badge e Promozioni */}
<div className="form-section">
  <h3>🏷️ Badge e Promozioni</h3>
  
  {/* Checkbox Novità */}
  <label className="checkbox-label">
    <input type="checkbox" checked={formData.is_new} />
    <span>⭐ Novità</span>
  </label>
  
  {/* Checkbox Bestseller */}
  <label className="checkbox-label">
    <input type="checkbox" checked={formData.is_bestseller} />
    <span>🔥 Bestseller</span>
  </label>
  
  {/* Input Sconto */}
  <label>💰 Sconto (%)</label>
  <input type="number" min="0" max="100" placeholder="0" />
</div>
```

---

## 🎨 Design nello Shop

### Visualizzazione Badge

I badge appaiono nell'angolo in alto a sinistra di ogni card prodotto:

```tsx
<div className="product-badges">
  {/* Badge Novità */}
  {product.is_new && (
    <span className="badge badge-new">
      <Tag size={12} />
      Novità
    </span>
  )}
  
  {/* Badge Bestseller */}
  {product.is_bestseller && (
    <span className="badge badge-bestseller">
      <TrendingUp size={12} />
      Bestseller
    </span>
  )}
  
  {/* Badge Sconto */}
  {product.discount_percentage > 0 && (
    <span className="badge badge-discount">
      <Percent size={12} />
      -{product.discount_percentage}%
    </span>
  )}
</div>
```

### Stili CSS

```css
.product-badges {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 10;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.badge-new {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.badge-bestseller {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.badge-discount {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}
```

---

## 🔍 Filtri nello Shop

I badge sono anche **filtri attivi** nello shop:

### Filtri Rapidi (già implementati)

```tsx
<button onClick={() => setShowOnlyNew(!showOnlyNew)}>
  <Tag size={16} />
  Novità
</button>

<button onClick={() => setShowOnlyBestseller(!showOnlyBestseller)}>
  <TrendingUp size={16} />
  Bestseller
</button>

<button onClick={() => setShowOnlyDiscount(!showOnlyDiscount)}>
  <Percent size={16} />
  In Sconto
</button>
```

**Funzionalità:**
- Click sul filtro → Mostra solo prodotti con quel badge
- Filtri combinabili con collezioni, tipo cioccolato, etc.
- Contatore di filtri attivi

---

## 🚀 Setup e Migrazione

### 1. Esegui lo Script SQL

Nella dashboard Supabase → SQL Editor:

```bash
# Esegui il file supabase-add-badges.sql
```

Oppure copia e incolla il contenuto di `supabase-add-badges.sql`.

### 2. Verifica le Colonne

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN ('is_new', 'is_bestseller', 'discount_percentage');
```

Risultato atteso:
```
column_name          | data_type | column_default
--------------------|-----------|---------------
is_new              | boolean   | false
is_bestseller       | boolean   | false
discount_percentage | integer   | NULL
```

### 3. Test nel Form Admin

1. Accedi al pannello admin
2. Crea un nuovo prodotto
3. Verifica che "Novità" sia già spuntato
4. Spunta anche "Bestseller"
5. Inserisci uno sconto (es. 15%)
6. Salva il prodotto

### 4. Test nello Shop

1. Vai alla pagina `/shop`
2. Trova il prodotto appena creato
3. Verifica che i badge appaiano:
   - ⭐ Novità (verde)
   - 🔥 Bestseller (arancione)
   - 💰 -15% (rosso)
4. Testa i filtri "Novità", "Bestseller", "In Sconto"

---

## 📊 Workflow Consigliato

### Per Nuovi Prodotti

1. **Crea prodotto** → `is_new = true` (automatico)
2. **Dopo 2-4 settimane** → Togli il badge "Novità" modificando il prodotto
3. **Se vende bene** → Attiva "Bestseller"

### Per Bestseller

1. Monitora le vendite (dashboard ordini)
2. Identifica i top 3-5 prodotti
3. Modifica prodotti e attiva il badge "Bestseller"
4. Aggiorna periodicamente (es. ogni mese)

### Per Sconti

1. **Promo stagionale** → Inserisci sconto (es. -20%)
2. **Fine promo** → Rimuovi sconto (imposta a 0 o vuoto)
3. **Saldi di fine stagione** → Sconti più alti (-30%, -50%)

---

## 🎯 Best Practices

### Gestione Badge "Novità"

- ✅ **Auto-attivo** per nuovi prodotti
- ✅ **Rimuovi dopo 2-4 settimane** per mantenere freschezza
- ❌ **Non lasciare attivo indefinitamente** (perde significato)

### Gestione Badge "Bestseller"

- ✅ **Max 3-5 prodotti contemporaneamente** (mantieni esclusività)
- ✅ **Aggiorna regolarmente** in base alle vendite reali
- ❌ **Non mettere su tutti i prodotti** (perde valore)

### Gestione Sconti

- ✅ **Usa percentuali realistiche** (10%, 15%, 20%, 25%, 30%, 50%)
- ✅ **Comunica chiaramente la durata** dell'offerta
- ❌ **Non abusare degli sconti** (rischi di svalutare il brand)

### Combinazioni Badge

**Esempi efficaci:**
- ⭐ Novità + 💰 Sconto = "Nuovo prodotto in promo lancio"
- 🔥 Bestseller + 💰 Sconto = "Il più venduto ora in offerta!"
- ⭐ Novità + 🔥 Bestseller = "Nuovo successo immediato"

**Evita:**
- Tutti e 3 i badge contemporaneamente (troppo carico visivo)

---

## 🔧 Personalizzazione

### Cambiare Colori Badge

In `app/shop/page.tsx` (sezione CSS):

```css
/* Badge Novità - Verde */
.badge-new {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

/* Badge Bestseller - Arancione */
.badge-bestseller {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

/* Badge Sconto - Rosso */
.badge-discount {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}
```

### Aggiungere Nuovi Badge

1. **Database**: Aggiungi colonna (es. `is_limited_edition BOOLEAN`)
2. **Form**: Aggiungi checkbox in `AdminProducts.tsx`
3. **API**: Includi campo in `POST` e `PUT`
4. **Shop**: Aggiungi rendering badge in `app/shop/page.tsx`
5. **Filtri**: Aggiungi filtro se necessario

---

## 📈 Analytics e Monitoraggio

### Metriche da Tracciare

1. **Click Rate sui badge** - Quali badge generano più click?
2. **Conversioni per badge** - Quale badge converte meglio?
3. **Filtri più usati** - Gli utenti filtrano per badge?
4. **Durata "Novità"** - Quanto tieni attivo il badge?

### Tool Consigliati

- **Google Analytics** - Eventi personalizzati per click badge
- **Hotjar** - Heatmap per vedere interazioni con badge
- **Supabase Analytics** - Query per prodotti con badge più venduti

---

## 🎉 Esempi Pratici

### Esempio 1: Lancio Nuovo Prodotto

**Prodotto:** Praline Limoncello Limited Edition

```json
{
  "name": "Praline Limoncello Limited Edition",
  "collection": "Costiera Amalfitana",
  "is_new": true,
  "is_bestseller": false,
  "discount_percentage": 10
}
```

**Risultato Shop:**
- ⭐ Badge "Novità" (verde)
- 💰 Badge "-10%" (rosso)
- Appare nel filtro "Novità"
- Appare nel filtro "In Sconto"

### Esempio 2: Bestseller Consolidato

**Prodotto:** Sfogliatella Pralinata

```json
{
  "name": "Sfogliatella Pralinata",
  "collection": "Tradizione Napoletana",
  "is_new": false,
  "is_bestseller": true,
  "discount_percentage": null
}
```

**Risultato Shop:**
- 🔥 Badge "Bestseller" (arancione)
- Appare nel filtro "Bestseller"
- Social proof per nuovi clienti

### Esempio 3: Promo Flash Weekend

**Prodotto:** Box Assortito 12pz

```json
{
  "name": "Box Assortito 12pz",
  "is_new": false,
  "is_bestseller": true,
  "discount_percentage": 25
}
```

**Risultato Shop:**
- 🔥 Badge "Bestseller" (arancione)
- 💰 Badge "-25%" (rosso)
- Urgency + Social proof = Conversione alta

---

## ✅ Checklist Implementazione

- [x] SQL script per aggiungere colonne badge
- [x] Form admin con checkbox "Novità" e "Bestseller"
- [x] Form admin con input sconto percentuale
- [x] Badge "Novità" auto-attivo per nuovi prodotti
- [x] API routes aggiornate per gestire badge
- [x] Rendering badge nelle card prodotto (shop)
- [x] Stili CSS per badge colorati
- [x] Filtri shop per badge (già implementati)
- [x] Indici database per query performanti
- [x] Documentazione completa

---

## 🎊 Conclusione

Il sistema di **badge** trasforma lo shop aggiungendo:

✨ **Visual Hierarchy** - Attira l'attenzione su prodotti specifici  
🎯 **Social Proof** - "Bestseller" aumenta la fiducia  
⚡ **Urgency** - Sconti creano senso di urgenza  
🔍 **Scopribilità** - Filtri rapidi per trovare novità e offerte

**Risultato:** Miglior UX, più conversioni, gestione prodotti più strategica!

---

## 🔗 File Coinvolti

1. `supabase-add-badges.sql` - Script database
2. `components/admin/AdminProducts.tsx` - Form admin
3. `app/api/products/route.ts` - API POST
4. `app/api/products/[id]/route.ts` - API PUT
5. `app/shop/page.tsx` - Visualizzazione badge e filtri
6. `lib/supabase.ts` - Type definitions

