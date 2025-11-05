# 🔒 Fix Errore Upload: "violates row-level security policy"

## 🚨 Il Problema

**Errore completo**:
```
Errore caricamento immagine: Errore upload: new row violates row-level security policy
```

**Quando succede**: 
- Quando provi a caricare un'immagine dalla dashboard admin in produzione
- Funziona in locale ma NON in produzione

**Causa**: 
Il tuo account utente **non ha il ruolo admin** configurato nel database di produzione. Le policy di Supabase Storage verificano che tu sia admin prima di permettere l'upload.

---

## ✅ Soluzione in 2 Passi

### 📋 Pre-requisiti

Prima di iniziare, assicurati di:
- ✅ Esserti **registrato** sul sito di produzione con la tua email
- ✅ Aver **confermato** l'email (controlla la casella di posta)
- ✅ Poter fare **login** con successo

Se non l'hai fatto, fallo ora prima di continuare.

---

### 1️⃣ Imposta il Tuo Ruolo come Super Admin

**Script**: `supabase-setup-admin-user.sql`

1. **Vai su Supabase Dashboard** (produzione)
2. **SQL Editor** > New Query
3. **Apri** il file `supabase-setup-admin-user.sql`
4. **MODIFICA lo STEP 3** - Cerca questa riga:
   ```sql
   WHERE email = 'tua-email@example.com'  -- <-- ⚠️ CAMBIA QUI!
   ```
5. **Sostituisci** con la TUA email (quella con cui ti sei registrato)
6. **Esegui** lo script (Run ▶️)

**Output atteso**:
```
✅ CONFIGURAZIONE ADMIN COMPLETATA!

Admin/Super Admin configurati: 1

email                  | role        | admin_da
-----------------------|-------------|------------------
tua-email@example.com  | super_admin | 2024-...
```

---

### 2️⃣ Testa l'Upload

1. **Fai logout** dal sito
2. **Fai login** di nuovo (importante per ricaricare il ruolo)
3. **Vai su `/admin`**
4. **Prova a caricare un'immagine**
5. ✅ **Dovrebbe funzionare!**

---

## 🐛 Se Ancora Non Funziona

### Opzione A: Verifica il Ruolo

Nel SQL Editor, esegui:

```sql
-- Verifica il tuo ruolo
SELECT 
  au.email,
  ur.role,
  ur.created_at
FROM auth.users au
LEFT JOIN user_roles ur ON au.id = ur.user_id
WHERE au.email = 'tua-email@example.com';  -- Sostituisci con la tua email
```

**Risultato atteso**:
```
email                  | role        | created_at
-----------------------|-------------|------------------
tua-email@example.com  | super_admin | 2024-...
```

**Se vedi `role = NULL`** → Il ruolo non è stato impostato. Riesegui lo STEP 1 verificando che la email sia corretta.

---

### Opzione B: Policy Storage Semplificate (Temporanee)

Se dopo lo Step 1 ancora non funziona, usa policy temporanee più permissive:

**Script**: `supabase-storage-simple-policies.sql`

1. SQL Editor > New Query
2. Copia e incolla `supabase-storage-simple-policies.sql`
3. Esegui (Run ▶️)

⚠️ **ATTENZIONE**: Queste policy permettono a **tutti gli utenti autenticati** di caricare immagini. È meno sicuro ma funziona. Dopo aver risolto, considera di tornare alle policy restrittive.

---

### Opzione C: Verifica Funzione get_user_role

Le policy storage usano la funzione `get_user_role()`. Verifica che esista:

```sql
-- Verifica che la funzione esista
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'get_user_role';
```

**Se non esiste**, esegui lo schema completo:
```sql
-- Dal file: supabase-schema-complete-production.sql
-- O solo questa parte:

CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS VARCHAR AS $$
DECLARE
  user_role VARCHAR;
BEGIN
  SELECT role INTO user_role 
  FROM user_roles 
  WHERE user_id = user_uuid;
  
  RETURN COALESCE(user_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🔍 Diagnostica Completa

Se hai ancora problemi, esegui questa query diagnostica:

```sql
-- DIAGNOSTICA COMPLETA
DO $$
DECLARE
  user_exists BOOLEAN;
  user_role VARCHAR;
  bucket_exists BOOLEAN;
  bucket_public BOOLEAN;
  policy_count INTEGER;
  function_exists BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DIAGNOSTICA UPLOAD IMMAGINI';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  -- Verifica utente
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE email = 'tua-email@example.com'
  ) INTO user_exists;
  
  -- Verifica ruolo
  SELECT ur.role INTO user_role
  FROM auth.users au
  LEFT JOIN user_roles ur ON au.id = ur.user_id
  WHERE au.email = 'tua-email@example.com';
  
  -- Verifica bucket
  SELECT 
    EXISTS(SELECT 1 FROM storage.buckets WHERE id = 'product-images'),
    (SELECT public FROM storage.buckets WHERE id = 'product-images')
  INTO bucket_exists, bucket_public;
  
  -- Conta policy
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'storage' 
    AND tablename = 'objects'
    AND policyname LIKE '%product%';
  
  -- Verifica funzione
  SELECT EXISTS(
    SELECT 1 FROM pg_proc WHERE proname = 'get_user_role'
  ) INTO function_exists;
  
  -- Output
  RAISE NOTICE '1. Utente registrato: %', CASE WHEN user_exists THEN '✅ Sì' ELSE '❌ No - Registrati prima!' END;
  RAISE NOTICE '2. Ruolo utente: %', COALESCE(user_role, '❌ NULL - Esegui setup-admin-user.sql');
  RAISE NOTICE '3. Bucket exists: %', CASE WHEN bucket_exists THEN '✅ Sì' ELSE '❌ No - Crealo!' END;
  RAISE NOTICE '4. Bucket pubblico: %', CASE WHEN bucket_public THEN '✅ Sì' ELSE '❌ No' END;
  RAISE NOTICE '5. Policy storage: %', policy_count;
  RAISE NOTICE '6. Funzione get_user_role: %', CASE WHEN function_exists THEN '✅ Sì' ELSE '❌ No' END;
  RAISE NOTICE '';
  
  -- Consigli
  IF NOT user_exists THEN
    RAISE NOTICE '❌ PROBLEMA: Utente non registrato';
    RAISE NOTICE '   Soluzione: Registrati sul sito prima';
  ELSIF user_role IS NULL THEN
    RAISE NOTICE '❌ PROBLEMA: Ruolo non impostato';
    RAISE NOTICE '   Soluzione: Esegui supabase-setup-admin-user.sql';
  ELSIF NOT bucket_exists THEN
    RAISE NOTICE '❌ PROBLEMA: Bucket non esiste';
    RAISE NOTICE '   Soluzione: Crea bucket product-images in Storage';
  ELSIF NOT function_exists THEN
    RAISE NOTICE '❌ PROBLEMA: Funzione get_user_role mancante';
    RAISE NOTICE '   Soluzione: Esegui schema completo o crea funzione';
  ELSIF policy_count = 0 THEN
    RAISE NOTICE '❌ PROBLEMA: Nessuna policy configurata';
    RAISE NOTICE '   Soluzione: Esegui fix-storage-public-access.sql';
  ELSE
    RAISE NOTICE '✅ Tutto sembra configurato correttamente!';
    RAISE NOTICE '   Prova: Fai logout e login di nuovo';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- Sostituisci 'tua-email@example.com' con la tua email!
```

---

## 📝 Checklist Completa

Dopo aver seguito i passi, verifica:

- [ ] Registrato sul sito di produzione
- [ ] Email confermata
- [ ] Script `supabase-setup-admin-user.sql` eseguito
- [ ] Email corretta nello script (modificata)
- [ ] Query verifica ruolo: mostra `super_admin`
- [ ] Fatto logout e login di nuovo
- [ ] Provato a caricare immagine dalla dashboard
- [ ] ✅ Upload funziona!

---

## 🎯 Soluzione Rapida (TL;DR)

```sql
-- 1. Esegui questo nel SQL Editor (sostituisci la tua email)
INSERT INTO user_roles (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email = 'TUA-EMAIL@EXAMPLE.COM'  -- ⚠️ CAMBIA QUI!
ON CONFLICT (user_id) 
DO UPDATE SET role = 'super_admin', updated_at = NOW();

-- 2. Verifica che sia stato impostato
SELECT au.email, ur.role
FROM auth.users au
JOIN user_roles ur ON au.id = ur.user_id
WHERE au.email = 'TUA-EMAIL@EXAMPLE.COM';  -- ⚠️ CAMBIA QUI!

-- 3. Fai logout e login di nuovo
-- 4. Prova a caricare immagine → Dovrebbe funzionare!
```

---

## 🔐 Nota sulla Sicurezza

**Policy Restrittive** (Raccomandate per produzione):
- ✅ Solo admin possono caricare immagini
- ✅ Controllo basato su ruoli in `user_roles`
- ✅ Più sicuro

**Policy Semplificate** (Solo per debugging):
- ⚠️ Tutti gli autenticati possono caricare
- ⚠️ Meno sicuro
- ⚠️ Usa solo temporaneamente

Dopo aver risolto, usa sempre le policy restrittive!

---

## 📚 File Correlati

1. **`supabase-setup-admin-user.sql`** ⭐ - Imposta ruolo admin (ESEGUI QUESTO)
2. **`supabase-storage-simple-policies.sql`** - Policy semplificate (se necessario)
3. **`supabase-fix-storage-public-access.sql`** - Policy complete con sicurezza
4. **`FIX_IMMAGINI_PRODUZIONE.md`** - Fix per immagini non visibili nello shop

---

## 🆘 Serve Aiuto?

Se dopo tutti questi passi ancora non funziona:

1. Esegui la **query diagnostica completa** sopra
2. **Copia tutto l'output**
3. Condividi l'output per ulteriore supporto
4. Include anche eventuali errori dalla console del browser (F12)

---

## ✅ Congratulazioni!

Se hai seguito i passi, ora dovresti poter:
- ✅ Caricare immagini dalla dashboard admin
- ✅ Vedere le immagini nello shop (utenti non autenticati)
- ✅ Gestire prodotti senza errori RLS

**Prossimi passi**: Testa tutto il flusso admin e continua con lo sviluppo! 🚀

