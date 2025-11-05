# 🔧 Fix Eliminazione Prodotti con Ordini - Soft Delete

## 🚨 Problema Risolto

**Errore originale**: 
```
update or delete on table "products" violates foreign key constraint 
"order_items_product_id_fkey" on table "order_items"
```

### Causa
Il database impedisce l'eliminazione fisica di prodotti che hanno ordini associati per mantenere l'integrità dei dati. Se elimini un prodotto che qualcuno ha ordinato, gli ordini passati perderebbero il riferimento al prodotto.

### Soluzione: Soft Delete
Invece di eliminare fisicamente i prodotti dal database, li **marchiamo come eliminati** con un timestamp `deleted_at`. In questo modo:
- ✅ Gli ordini passati mantengono i riferimenti ai prodotti
- ✅ I prodotti eliminati non appaiono più nello shop
- ✅ Puoi ripristinare prodotti eliminati per errore
- ✅ Mantieni lo storico completo per analisi e reportistica

## 🎯 Cosa È Stato Modificato

### 1. Database Schema
- Aggiunta colonna `deleted_at` alla tabella `products`
- Creato indice per performance
- Aggiunte funzioni SQL per soft delete e restore

### 2. API Routes
- `DELETE /api/products/[id]` - Ora fa UPDATE invece di DELETE
- Tutte le `GET` filtrano prodotti con `deleted_at IS NULL`

### 3. Frontend
- Tutti gli hook e componenti filtrano prodotti eliminati
- Gestione errori migliorata

## 🚀 Passaggi per Completare l'Installazione

### Step 1: Esegui lo Script SQL su Supabase

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona il tuo progetto
3. Clicca su **SQL Editor** nella sidebar
4. Clicca su **+ New Query**
5. Copia e incolla il contenuto del file `supabase-add-soft-delete.sql`
6. Clicca su **Run** (o premi Ctrl/Cmd + Enter)

**Contenuto dello script** (già creato nel file `supabase-add-soft-delete.sql`):
```sql
-- Aggiungi soft delete ai prodotti
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Crea un indice per query più veloci
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);

-- Funzione helper per soft delete
CREATE OR REPLACE FUNCTION soft_delete_product(product_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE products 
  SET deleted_at = NOW(),
      updated_at = NOW()
  WHERE id = product_uuid 
    AND deleted_at IS NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione helper per restore
CREATE OR REPLACE FUNCTION restore_product(product_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE products 
  SET deleted_at = NULL,
      updated_at = NOW()
  WHERE id = product_uuid 
    AND deleted_at IS NOT NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 2: Verifica che lo Script Sia Stato Eseguito

Esegui questa query nel SQL Editor per verificare:
```sql
-- Verifica che la colonna esista
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'deleted_at';

-- Dovrebbe restituire:
-- column_name | data_type
-- deleted_at  | timestamp with time zone
```

### Step 3: Configura la Service Role Key (se non l'hai già fatto)

Segui la guida in `FIX_ELIMINAZIONE_PRODOTTI.md` per configurare `SUPABASE_SERVICE_ROLE_KEY` nel file `.env.local`.

### Step 4: Riavvia il Server

```bash
# Ferma il server con Ctrl+C
# Poi riavvialo
npm run dev
```

### Step 5: Testa l'Eliminazione

1. Vai su `/admin` > Prodotti
2. Prova a eliminare un prodotto (anche uno che ha ordini)
3. Dovresti vedere: "Prodotto eliminato con successo!"
4. Il prodotto scompare dalla dashboard e dallo shop
5. Verifica su Supabase:
   ```sql
   -- Prodotti attivi
   SELECT * FROM products WHERE deleted_at IS NULL;
   
   -- Prodotti eliminati
   SELECT * FROM products WHERE deleted_at IS NOT NULL;
   ```

## 🔄 Come Ripristinare un Prodotto Eliminato

Se elimini un prodotto per errore, puoi ripristinarlo dal SQL Editor:

```sql
-- Trova il prodotto eliminato
SELECT id, name, deleted_at 
FROM products 
WHERE deleted_at IS NOT NULL;

-- Ripristina usando la funzione
SELECT restore_product('id-del-prodotto-da-ripristinare');

-- Oppure manualmente
UPDATE products 
SET deleted_at = NULL, updated_at = NOW()
WHERE id = 'id-del-prodotto-da-ripristinare';
```

## 📊 Query Utili per il Database

### Visualizza Prodotti Eliminati
```sql
SELECT id, name, category, deleted_at 
FROM products 
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;
```

### Conta Prodotti Attivi vs Eliminati
```sql
SELECT 
  COUNT(*) FILTER (WHERE deleted_at IS NULL) as prodotti_attivi,
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as prodotti_eliminati
FROM products;
```

### Trova Prodotti con Ordini
```sql
SELECT DISTINCT p.id, p.name, COUNT(oi.id) as num_ordini
FROM products p
INNER JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name
ORDER BY num_ordini DESC;
```

### Pulisci Prodotti Eliminati Vecchi (dopo 90 giorni)
```sql
-- ATTENZIONE: Questa query elimina FISICAMENTE i dati!
-- Eseguire solo se sei sicuro e dopo aver fatto un backup
DELETE FROM products 
WHERE deleted_at IS NOT NULL 
  AND deleted_at < NOW() - INTERVAL '90 days'
  AND id NOT IN (SELECT DISTINCT product_id FROM order_items);
```

## 🛡️ Benefici del Soft Delete

### Per il Business
- ✅ Storico ordini sempre intatto
- ✅ Analisi e reportistica complete
- ✅ Recupero da errori umani
- ✅ Audit trail completo

### Per gli Utenti
- ✅ Gli ordini passati mostrano sempre i prodotti corretti
- ✅ Nessun "prodotto non trovato" negli storici
- ✅ Esperienza più professionale

### Per lo Sviluppo
- ✅ Nessun vincolo di foreign key violato
- ✅ Rollback semplice
- ✅ Testing più sicuro
- ✅ Migrazione dati più semplice

## 🐛 Risoluzione Problemi

### La colonna deleted_at non esiste
**Soluzione**: Hai eseguito lo script SQL su Supabase? Riprova lo Step 1.

### I prodotti eliminati sono ancora visibili
**Soluzione**: 
1. Verifica che il server sia stato riavviato
2. Fai hard refresh (Ctrl+F5) 
3. Controlla nel SQL Editor:
   ```sql
   SELECT * FROM products WHERE id = 'id-del-prodotto';
   ```
   Se `deleted_at` è NOT NULL, il problema è di cache del browser.

### Errore "column deleted_at does not exist"
**Soluzione**: Lo script SQL non è stato eseguito. Vai su Supabase SQL Editor ed esegui `supabase-add-soft-delete.sql`.

### Voglio eliminare FISICAMENTE un prodotto
**Soluzione**: Solo per prodotti senza ordini:
```sql
-- Verifica che non ci siano ordini
SELECT COUNT(*) FROM order_items WHERE product_id = 'id-prodotto';

-- Se il count è 0, puoi eliminare fisicamente
DELETE FROM products WHERE id = 'id-prodotto';
```

## 📝 File Modificati

- ✅ `supabase-add-soft-delete.sql` - Script SQL per database
- ✅ `lib/supabase.ts` - Tipo Product + funzioni filtrate
- ✅ `app/api/products/route.ts` - GET filtra deleted_at
- ✅ `app/api/products/[id]/route.ts` - GET e DELETE con soft delete
- ✅ `hooks/useSupabase.ts` - Query filtrate
- ✅ `FIX_SOFT_DELETE.md` - Questa guida

## ✅ Checklist Completamento

- [ ] Ho eseguito `supabase-add-soft-delete.sql` su Supabase
- [ ] Ho verificato che la colonna deleted_at esista
- [ ] Ho configurato SUPABASE_SERVICE_ROLE_KEY nel .env.local
- [ ] Ho riavviato il server (npm run dev)
- [ ] Ho testato l'eliminazione di un prodotto
- [ ] Il prodotto scompare da dashboard e shop
- [ ] Ho verificato su Supabase che deleted_at sia impostato
- [ ] Gli ordini passati funzionano ancora correttamente

## 🎉 Risultato Finale

Dopo aver completato tutti i passaggi:
- ✅ Puoi eliminare qualsiasi prodotto senza errori di foreign key
- ✅ Gli ordini passati mantengono tutti i dati corretti
- ✅ I prodotti eliminati non appaiono più nello shop
- ✅ Puoi ripristinare prodotti eliminati per errore
- ✅ Hai un audit trail completo

## 📚 Best Practices

### Quando Eliminare (Soft Delete)
- Prodotti fuori produzione
- Prodotti stagionali terminati
- Prodotti con errori che devono essere rifatti
- Prodotti sostituiti da nuove versioni

### Quando NON Eliminare
- Prodotti temporaneamente esauriti → Usa `stock_quantity = 0`
- Prodotti che torneranno → Aggiungi un campo `available_from`
- Test durante lo sviluppo → Usa un database di staging

### Pulizia Periodica
Considera di eliminare fisicamente i prodotti soft-deleted dopo:
- 90 giorni (per prodotti senza ordini)
- 1 anno (per archiviazione)
- 3 anni (per conformità GDPR se applicabile)

**Ricorda**: Fai sempre un backup prima di eliminazioni fisiche!

