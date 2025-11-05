# ⚡ Fix Rapido - Eliminazione Prodotti

## 🚨 Problema
```
update or delete on table "products" violates foreign key constraint 
"order_items_product_id_fkey" on table "order_items"
```

Il prodotto che stai cercando di eliminare è stato ordinato da qualcuno, quindi il database blocca l'eliminazione per proteggere i dati degli ordini.

## ✅ Soluzione in 3 Passi

### 1️⃣ Esegui questo SQL su Supabase

Vai su [Supabase Dashboard](https://app.supabase.com) > SQL Editor > New Query

Copia e incolla:

```sql
-- Aggiungi colonna per soft delete
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Indice per performance
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);
```

Clicca **Run** ▶️

### 2️⃣ Aggiungi Service Role Key

Nel file `.env.local` (root del progetto):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tuoprogetto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # <-- Aggiungi questa (Settings > API > service_role)
```

### 3️⃣ Riavvia il Server

```bash
# Ferma con Ctrl+C, poi:
npm run dev
```

## ✅ Fatto!

Ora puoi eliminare qualsiasi prodotto, anche quelli con ordini. Il prodotto verrà nascosto ma i dati degli ordini passati rimarranno intatti.

---

## 📖 Guide Complete

Per maggiori dettagli consulta:
- `FIX_SOFT_DELETE.md` - Guida completa al soft delete
- `FIX_ELIMINAZIONE_PRODOTTI.md` - Configurazione Service Role Key
- `supabase-add-soft-delete.sql` - Script SQL completo con funzioni avanzate

## 🔍 Verifica

Dopo aver fatto i 3 passi, testa:

1. Vai su `/admin` > Prodotti
2. Elimina un prodotto
3. ✅ Dovrebbe scomparire dalla dashboard e dallo shop
4. ✅ Gli ordini passati funzionano ancora

Verifica su Supabase SQL Editor:
```sql
-- Vedi prodotti eliminati
SELECT id, name, deleted_at FROM products WHERE deleted_at IS NOT NULL;
```

## 🆘 Problemi?

- **Colonna deleted_at non esiste**: Hai eseguito lo Step 1 su Supabase?
- **Ancora errore foreign key**: Hai riavviato il server dopo aver aggiunto la Service Role Key?
- **Prodotti ancora visibili**: Hard refresh (Ctrl+F5)

Per debug completo leggi `FIX_SOFT_DELETE.md`

