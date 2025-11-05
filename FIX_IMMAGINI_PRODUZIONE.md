# 🖼️ Fix Immagini Non Visibili in Produzione

## 🚨 Il Problema

**Sintomo**: 
- ✅ Dashboard (admin): Immagini visibili
- ❌ Shop (utenti): Immagini NON visibili  
- ✅ Locale: Tutto funziona

**Causa**: Le policy di **Supabase Storage** non permettono l'accesso pubblico alle immagini. Gli admin autenticati le vedono, ma gli utenti normali (non autenticati) no.

## ✅ Soluzione in 3 Passi

### 1️⃣ Esegui Script SQL

1. Vai su **Supabase Dashboard** (produzione)
2. **SQL Editor** > New Query
3. Copia e incolla: **`supabase-fix-storage-public-access.sql`**
4. Click **Run** ▶️

Dovresti vedere:
```
✅ CONFIGURAZIONE STORAGE COMPLETATA!

Verifica:
  - Bucket product-images: ✅ PUBBLICO
  - Policy configurate: 4

📝 Cosa è stato configurato:
  ✅ Tutti possono VEDERE le immagini (anche non autenticati)
  ✅ Solo ADMIN possono caricare/modificare immagini
  ✅ Solo SUPER_ADMIN possono eliminare immagini
```

### 2️⃣ Verifica Configurazione (Opzionale)

Nel SQL Editor, esegui:

```sql
-- Verifica che il bucket sia pubblico
SELECT id, name, public 
FROM storage.buckets 
WHERE id = 'product-images';

-- Deve mostrare: public = true
```

Se `public = false`, esegui:
```sql
UPDATE storage.buckets 
SET public = true 
WHERE id = 'product-images';
```

### 3️⃣ Test Funzionamento

1. **Apri il sito in modalità incognito** (non autenticato)
2. Vai sullo **shop**
3. **Le immagini DEVONO essere visibili** ✅

Se non funziona ancora, vai alla sezione Troubleshooting sotto.

---

## 🔍 Verifica Dettagliata

### Controlla URL Immagini

Apri la console del browser (F12) e cerca errori come:

**❌ Errore 403 Forbidden:**
```
Failed to load resource: the server responded with a status of 403 (Forbidden)
https://xxx.supabase.co/storage/v1/object/public/product-images/xxx.jpg
```

**Causa**: Policy storage non configurate correttamente

**Soluzione**: Riesegui lo script `supabase-fix-storage-public-access.sql`

---

**❌ Errore 404 Not Found:**
```
Failed to load resource: the server responded with a status of 404 (Not Found)
```

**Causa**: 
1. L'immagine non è stata caricata sul bucket di produzione
2. L'URL salvato nel database è sbagliato

**Soluzione**: Verifica nel database di produzione:

```sql
-- Vedi gli URL delle immagini
SELECT id, name, image_url 
FROM products 
WHERE deleted_at IS NULL 
LIMIT 10;
```

Gli URL devono essere nel formato:
```
https://tuoprogetto.supabase.co/storage/v1/object/public/product-images/nome-file.jpg
```

---

## 🛠️ Troubleshooting Avanzato

### Problema 1: Bucket Non Esiste

**Sintomo**: "bucket product-images does not exist"

**Soluzione**:
1. Vai su **Storage** nella dashboard Supabase
2. Click **New bucket**
3. Nome: `product-images`
4. **Public bucket**: ✅ Sì
5. Click Create
6. Riesegui lo script SQL

---

### Problema 2: Immagini Caricate in Locale ma Non in Produzione

**Causa**: I database locale e produzione sono separati. Le immagini caricate in locale non sono su Supabase Storage di produzione.

**Soluzione Opzione A - Ricarica Immagini**:
1. Vai su `/admin` in **produzione**
2. Modifica ogni prodotto
3. Ricarica l'immagine
4. Salva

**Soluzione Opzione B - Migrazione Manuale**:

1. **Esporta prodotti dal locale**:
```sql
-- Nel database locale
SELECT id, name, image_url 
FROM products 
WHERE deleted_at IS NULL;
```

2. **Scarica le immagini** dalla cartella `public/images/` locale

3. **Carica su Supabase Storage** (produzione):
   - Storage > product-images
   - Upload files
   - Carica le immagini

4. **Aggiorna URL nel database produzione**:
```sql
-- Esempio: aggiorna URL per un prodotto
UPDATE products 
SET image_url = 'https://tuoprogetto.supabase.co/storage/v1/object/public/product-images/prodotto-1.jpg'
WHERE name = 'Nome Prodotto';
```

---

### Problema 3: CORS Error

**Sintomo**: Console mostra errori CORS

```
Access to image at 'https://xxx.supabase.co/...' from origin 'https://tuosito.com' 
has been blocked by CORS policy
```

**Soluzione**:
1. Vai su **Settings** > **API** in Supabase
2. **CORS Settings**
3. Aggiungi il tuo dominio:
   ```
   https://tuosito.com
   https://www.tuosito.com
   ```
4. Salva

---

### Problema 4: Policy Non Funzionano

**Verifica le policy esistenti**:
```sql
SELECT 
  policyname,
  cmd,
  roles,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has conditions'
    ELSE 'No conditions'
  END as has_conditions
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%product%'
ORDER BY policyname;
```

**Se vedi policy duplicate o in conflitto**:
```sql
-- Elimina TUTTE le policy per product-images
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Super admin can delete product images" ON storage.objects;

-- Poi riesegui supabase-fix-storage-public-access.sql
```

---

## 🎯 Checklist Completa

Dopo aver eseguito lo script, verifica:

- [ ] Script `supabase-fix-storage-public-access.sql` eseguito senza errori
- [ ] Bucket `product-images` esiste
- [ ] Bucket è impostato come **pubblico** (`public = true`)
- [ ] 4 policy configurate per storage.objects
- [ ] Le immagini sono visibili in **modalità incognito**
- [ ] Le immagini sono visibili nello **shop** (non autenticato)
- [ ] Gli admin possono **caricare** nuove immagini dalla dashboard
- [ ] Nessun errore 403 o CORS nella console del browser

---

## 📝 Spiegazione Tecnica

### Come Funzionano le Policy Storage

**Bucket Pubblico vs Privato**:
- **Pubblico** (`public = true`): Le immagini sono accessibili via URL pubblico
- **Privato** (`public = false`): Serve autenticazione per accedere

**Policy RLS**:
Anche con bucket pubblico, le **policy RLS** controllano chi può:
- **SELECT** (vedere): Configurato per `public` (tutti)
- **INSERT** (caricare): Configurato per `authenticated` admin
- **UPDATE** (modificare): Configurato per `authenticated` admin
- **DELETE** (eliminare): Configurato per `authenticated` super_admin

### Formato URL Corretto

**Bucket Pubblico**:
```
https://tuoprogetto.supabase.co/storage/v1/object/public/product-images/file.jpg
                                                    ^^^^^^
```

**Bucket Privato** (con token):
```
https://tuoprogetto.supabase.co/storage/v1/object/authenticated/product-images/file.jpg?token=xxx
                                                    ^^^^^^^^^^^^^
```

Per prodotti visibili a tutti, usa sempre bucket **pubblico**.

---

## 🚀 Best Practices

### Ottimizzazione Immagini

Prima di caricare in produzione:

1. **Ridimensiona** le immagini (max 1200x1200px per prodotti)
2. **Comprimi** con strumenti come:
   - TinyPNG: https://tinypng.com/
   - Squoosh: https://squoosh.app/
3. **Formato consigliato**: WebP (migliore compressione) o JPEG
4. **Dimensione target**: < 200KB per immagine

### Naming Convention

```
product-images/
  ├── prodotto-slug-principale.jpg       # Immagine principale
  ├── prodotto-slug-dettaglio-1.jpg      # Dettaglio 1
  ├── prodotto-slug-dettaglio-2.jpg      # Dettaglio 2
  └── ...
```

### Backup Immagini

```bash
# Scarica tutte le immagini periodicamente
# Vai su Storage > product-images > Download all
```

---

## 📞 Supporto

### Se Ancora Non Funziona

1. **Copia l'errore dalla console** (F12) del browser
2. **Verifica URL** di un'immagine che non funziona
3. **Esegui query di diagnostica**:

```sql
-- Info bucket
SELECT * FROM storage.buckets WHERE id = 'product-images';

-- Info policy
SELECT policyname, cmd FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Sample immagini caricate
SELECT name, created_at FROM storage.objects 
WHERE bucket_id = 'product-images' 
LIMIT 5;
```

4. Condividi questi risultati per supporto

---

## ✅ Test Finale

Dopo la configurazione, questo dovrebbe funzionare:

1. **Test 1**: Modalità Incognito
   - Apri sito in incognito
   - Vai su `/shop`
   - ✅ Immagini visibili

2. **Test 2**: Console del Browser
   - F12 > Console
   - Nessun errore 403 o CORS
   - ✅ Tutte le immagini caricate (status 200)

3. **Test 3**: Dashboard Admin
   - Login come admin
   - Vai su `/admin` > Prodotti
   - Prova a caricare una nuova immagine
   - ✅ Upload funziona

4. **Test 4**: URL Diretto
   - Copia URL immagine da network tab
   - Aprilo in un nuovo tab (incognito)
   - ✅ Immagine si vede

Se tutti i test passano → **Problema Risolto!** 🎉

---

## 🎉 Congratulazioni!

Se hai completato tutti i passi, le tue immagini ora dovrebbero essere visibili in produzione sia nello shop che nella dashboard!

**File correlati**:
- `supabase-fix-storage-public-access.sql` - Script SQL fix
- `STORAGE_SETUP_GUIDE.md` - Guida setup storage (se esiste)

