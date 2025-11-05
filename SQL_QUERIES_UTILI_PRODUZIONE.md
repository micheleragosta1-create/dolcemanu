# 🔍 Query SQL Utili per Produzione - Dolce Manu

## 📊 Statistiche e Monitoring

### Conta Prodotti Attivi vs Eliminati
```sql
SELECT 
  COUNT(*) FILTER (WHERE deleted_at IS NULL) as prodotti_attivi,
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as prodotti_eliminati,
  COUNT(*) as totale
FROM products;
```

### Statistiche Ordini per Stato
```sql
SELECT 
  status,
  COUNT(*) as numero_ordini,
  SUM(total_amount) as totale_vendite,
  AVG(total_amount) as scontrino_medio,
  MIN(created_at) as primo_ordine,
  MAX(created_at) as ultimo_ordine
FROM orders
GROUP BY status
ORDER BY numero_ordini DESC;
```

### Top 10 Prodotti Più Venduti
```sql
SELECT 
  p.name,
  p.category,
  COUNT(oi.id) as volte_ordinato,
  SUM(oi.quantity) as quantita_totale_venduta,
  SUM(oi.quantity * oi.price) as revenue_totale
FROM products p
INNER JOIN order_items oi ON p.id = oi.product_id
INNER JOIN orders o ON oi.order_id = o.id
WHERE o.status NOT IN ('cancelled')
GROUP BY p.id, p.name, p.category
ORDER BY quantita_totale_venduta DESC
LIMIT 10;
```

### Vendite per Giorno (Ultimi 30 giorni)
```sql
SELECT 
  DATE(created_at) as data,
  COUNT(*) as num_ordini,
  SUM(total_amount) as totale_vendite,
  AVG(total_amount) as scontrino_medio
FROM orders
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND status NOT IN ('cancelled')
GROUP BY DATE(created_at)
ORDER BY data DESC;
```

### Clienti Più Affezionati (Top Spenders)
```sql
SELECT 
  user_email,
  COUNT(*) as numero_ordini,
  SUM(total_amount) as totale_speso,
  AVG(total_amount) as scontrino_medio,
  MAX(created_at) as ultimo_ordine
FROM orders
WHERE status NOT IN ('cancelled')
GROUP BY user_email
HAVING COUNT(*) >= 2
ORDER BY totale_speso DESC
LIMIT 20;
```

### Prodotti con Stock Basso (< 10)
```sql
SELECT 
  name,
  category,
  stock_quantity,
  CASE 
    WHEN stock_quantity = 0 THEN '🔴 ESAURITO'
    WHEN stock_quantity < 5 THEN '🟠 CRITICO'
    ELSE '🟡 BASSO'
  END as alert_level
FROM products
WHERE deleted_at IS NULL
  AND stock_quantity < 10
ORDER BY stock_quantity ASC, name ASC;
```

### Revenue Mensile (Ultimi 12 mesi)
```sql
SELECT 
  DATE_TRUNC('month', created_at) as mese,
  COUNT(*) as numero_ordini,
  SUM(total_amount) as totale_vendite,
  COUNT(DISTINCT user_email) as clienti_unici
FROM orders
WHERE created_at >= NOW() - INTERVAL '12 months'
  AND status NOT IN ('cancelled')
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mese DESC;
```

## 👤 Gestione Utenti

### Lista Tutti gli Admin
```sql
SELECT 
  au.email,
  ur.role,
  ur.created_at as admin_da
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE ur.role IN ('admin', 'super_admin')
ORDER BY ur.role DESC, au.email ASC;
```

### Crea Nuovo Admin
```sql
-- Prima l'utente deve registrarsi tramite app, poi:
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'nuovo-admin@example.com'
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin', updated_at = NOW();
```

### Promuovi Admin a Super Admin
```sql
UPDATE user_roles 
SET role = 'super_admin', updated_at = NOW()
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'email-admin@example.com'
);
```

### Rimuovi Privilegi Admin (torna User)
```sql
UPDATE user_roles 
SET role = 'user', updated_at = NOW()
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'ex-admin@example.com'
);
```

### Conta Utenti per Ruolo
```sql
SELECT 
  role,
  COUNT(*) as numero_utenti
FROM user_roles
GROUP BY role
ORDER BY 
  CASE role
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'user' THEN 3
  END;
```

## 🛍️ Gestione Prodotti

### Aggiungi Nuovo Prodotto
```sql
INSERT INTO products (
  name, 
  description, 
  price, 
  category, 
  stock_quantity,
  image_url,
  chocolate_type,
  collection,
  is_new,
  is_bestseller
) VALUES (
  'Praline al Pistacchio',
  'Deliziose praline ripiene di crema al pistacchio di Bronte',
  24.90,
  'praline',
  50,
  '/images/praline-pistacchio.jpg',
  'latte',
  'Tradizione Siciliana',
  true,
  false
);
```

### Aggiorna Stock Prodotto
```sql
UPDATE products 
SET 
  stock_quantity = 100,
  updated_at = NOW()
WHERE name = 'Nome Prodotto';
```

### Aggiorna Prezzo Prodotto
```sql
UPDATE products 
SET 
  price = 29.90,
  updated_at = NOW()
WHERE id = 'uuid-prodotto';
```

### Soft Delete Prodotto
```sql
-- Usando la funzione
SELECT soft_delete_product('uuid-prodotto');

-- Oppure manualmente
UPDATE products 
SET deleted_at = NOW(), updated_at = NOW()
WHERE id = 'uuid-prodotto';
```

### Ripristina Prodotto Eliminato
```sql
-- Usando la funzione
SELECT restore_product('uuid-prodotto');

-- Oppure manualmente
UPDATE products 
SET deleted_at = NULL, updated_at = NOW()
WHERE id = 'uuid-prodotto';
```

### Imposta Prodotto come Bestseller
```sql
UPDATE products 
SET 
  is_bestseller = true,
  updated_at = NOW()
WHERE id = 'uuid-prodotto';
```

### Aggiungi Sconto a Prodotto
```sql
UPDATE products 
SET 
  discount_percentage = 15, -- 15% di sconto
  updated_at = NOW()
WHERE id = 'uuid-prodotto';
```

### Rimuovi Badge "Novità" da Prodotti Vecchi
```sql
UPDATE products 
SET 
  is_new = false,
  updated_at = NOW()
WHERE created_at < NOW() - INTERVAL '30 days'
  AND is_new = true;
```

### Duplica Prodotto (per varianti)
```sql
INSERT INTO products (
  name, description, price, image_url, category, 
  stock_quantity, chocolate_type, collection, 
  is_new, is_bestseller, discount_percentage
)
SELECT 
  name || ' - Variante',  -- Modifica nome
  description,
  price * 1.1,  -- Prezzo +10%
  image_url,
  category,
  0,  -- Stock iniziale a 0
  chocolate_type,
  collection,
  false,  -- Non è nuova
  false,  -- Non è bestseller
  discount_percentage
FROM products
WHERE id = 'uuid-prodotto-originale';
```

## 📦 Gestione Ordini

### Ordini in Attesa di Processamento
```sql
SELECT 
  o.id,
  o.user_email,
  o.total_amount,
  o.created_at,
  o.shipping_name,
  o.shipping_city,
  COUNT(oi.id) as num_prodotti
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.status = 'pending'
GROUP BY o.id
ORDER BY o.created_at ASC;
```

### Dettagli Ordine Specifico
```sql
SELECT 
  o.id,
  o.user_email,
  o.status,
  o.total_amount,
  o.shipping_address,
  o.shipping_name,
  o.created_at,
  oi.product_name,
  oi.quantity,
  oi.price,
  (oi.quantity * oi.price) as subtotale
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.id = 'uuid-ordine'
ORDER BY oi.created_at;
```

### Cambia Stato Ordine
```sql
UPDATE orders 
SET 
  status = 'shipped',  -- pending, processing, shipped, delivered, cancelled
  updated_at = NOW()
WHERE id = 'uuid-ordine';
```

### Aggiungi Nota Admin a Ordine
```sql
UPDATE orders 
SET 
  admin_note = 'Cliente ha richiesto consegna urgente',
  updated_at = NOW()
WHERE id = 'uuid-ordine';
```

### Cancella Ordine (e ripristina stock)
```sql
BEGIN;

-- Ripristina stock per ogni prodotto nell'ordine
UPDATE products p
SET 
  stock_quantity = stock_quantity + oi.quantity,
  updated_at = NOW()
FROM order_items oi
WHERE oi.order_id = 'uuid-ordine'
  AND p.id = oi.product_id;

-- Segna ordine come cancellato
UPDATE orders 
SET 
  status = 'cancelled',
  admin_note = COALESCE(admin_note || ' | ', '') || 'Ordine cancellato e stock ripristinato',
  updated_at = NOW()
WHERE id = 'uuid-ordine';

COMMIT;
```

### Ordini Non Completati (carrelli abbandonati potenziali)
```sql
SELECT 
  user_email,
  COUNT(*) as ordini_pending,
  MIN(created_at) as primo_ordine_pending,
  MAX(created_at) as ultimo_ordine_pending
FROM orders
WHERE status = 'pending'
  AND created_at < NOW() - INTERVAL '24 hours'
GROUP BY user_email
ORDER BY ultimo_ordine_pending DESC;
```

## 🧹 Manutenzione Database

### Trova Prodotti Senza Immagine
```sql
SELECT id, name, category, created_at
FROM products
WHERE deleted_at IS NULL
  AND (image_url IS NULL OR image_url = '')
ORDER BY created_at DESC;
```

### Prodotti Mai Ordinati
```sql
SELECT 
  p.id,
  p.name,
  p.category,
  p.stock_quantity,
  p.created_at
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
WHERE p.deleted_at IS NULL
  AND oi.id IS NULL
ORDER BY p.created_at ASC;
```

### Pulisci Prodotti Eliminati da > 90 giorni (ATTENZIONE!)
```sql
-- ⚠️ ATTENZIONE: Questo ELIMINA FISICAMENTE i dati!
-- Esegui SOLO se sei sicuro e dopo backup

-- Prima verifica cosa verrà eliminato:
SELECT id, name, deleted_at
FROM products
WHERE deleted_at IS NOT NULL 
  AND deleted_at < NOW() - INTERVAL '90 days'
  AND id NOT IN (SELECT DISTINCT product_id FROM order_items);

-- Se sei sicuro, decommenta ed esegui:
-- DELETE FROM products 
-- WHERE deleted_at IS NOT NULL 
--   AND deleted_at < NOW() - INTERVAL '90 days'
--   AND id NOT IN (SELECT DISTINCT product_id FROM order_items);
```

### Vacuum e Analyze per Performance
```sql
-- Esegui periodicamente per ottimizzare performance
VACUUM ANALYZE products;
VACUUM ANALYZE orders;
VACUUM ANALYZE order_items;
```

### Dimensione Tabelle
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Indici Utilizzati (o Non Utilizzati)
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;

-- Se idx_scan è 0, considera di eliminare l'indice (se non critico)
```

## 📧 Query per Email Marketing

### Clienti Attivi (ordinato negli ultimi 30 giorni)
```sql
SELECT DISTINCT 
  user_email,
  MAX(created_at) as ultimo_ordine
FROM orders
WHERE created_at >= NOW() - INTERVAL '30 days'
  AND status NOT IN ('cancelled')
GROUP BY user_email
ORDER BY ultimo_ordine DESC;
```

### Clienti Inattivi (non ordinano da > 90 giorni)
```sql
SELECT 
  user_email,
  MAX(created_at) as ultimo_ordine,
  COUNT(*) as ordini_totali,
  SUM(total_amount) as speso_totale
FROM orders
WHERE status NOT IN ('cancelled')
GROUP BY user_email
HAVING MAX(created_at) < NOW() - INTERVAL '90 days'
ORDER BY ultimo_ordine DESC;
```

### Nuovi Clienti (primo ordine negli ultimi 7 giorni)
```sql
SELECT 
  user_email,
  MIN(created_at) as primo_ordine,
  COUNT(*) as ordini_totali
FROM orders
WHERE status NOT IN ('cancelled')
GROUP BY user_email
HAVING MIN(created_at) >= NOW() - INTERVAL '7 days'
ORDER BY primo_ordine DESC;
```

## 🔐 Sicurezza e Audit

### Attività Recenti Admin
```sql
-- Modifiche prodotti recenti
SELECT 
  p.name,
  p.updated_at,
  p.created_at,
  CASE 
    WHEN p.created_at = p.updated_at THEN 'Creato'
    ELSE 'Modificato'
  END as azione
FROM products p
WHERE p.updated_at >= NOW() - INTERVAL '7 days'
  OR p.created_at >= NOW() - INTERVAL '7 days'
ORDER BY GREATEST(p.created_at, p.updated_at) DESC;
```

### Verifica Integrità Ordini
```sql
-- Verifica che tutti gli order_items abbiano ordini validi
SELECT COUNT(*) as items_orfani
FROM order_items oi
LEFT JOIN orders o ON oi.order_id = o.id
WHERE o.id IS NULL;

-- Dovrebbe essere 0
```

## 💾 Backup e Export

### Export Prodotti Attivi (CSV-ready)
```sql
COPY (
  SELECT 
    name,
    description,
    price,
    category,
    stock_quantity,
    chocolate_type,
    collection,
    is_new,
    is_bestseller,
    discount_percentage
  FROM products 
  WHERE deleted_at IS NULL
  ORDER BY category, name
) TO STDOUT WITH CSV HEADER;
```

### Export Ordini Mese Corrente (CSV-ready)
```sql
COPY (
  SELECT 
    o.id,
    o.user_email,
    o.total_amount,
    o.status,
    o.created_at,
    o.shipping_name,
    o.shipping_city
  FROM orders o
  WHERE DATE_TRUNC('month', o.created_at) = DATE_TRUNC('month', NOW())
  ORDER BY o.created_at DESC
) TO STDOUT WITH CSV HEADER;
```

## 🎯 Tips e Best Practices

### Esegui Query Pesanti in Orari di Basso Traffico
```sql
-- Esempio: Report completo (esegui la notte)
-- Usa EXPLAIN ANALYZE prima per verificare il piano
EXPLAIN ANALYZE
SELECT ...;
```

### Usa Transazioni per Operazioni Multiple
```sql
BEGIN;
-- query 1
-- query 2
-- query 3
COMMIT;  -- oppure ROLLBACK; se qualcosa va storto
```

### Crea Indici Prima di Grandi Operazioni
```sql
-- Se devi fare molte query su un campo non indicizzato
CREATE INDEX CONCURRENTLY idx_temp ON table(column);
-- Esegui le tue query
-- Poi eventualmente rimuovi l'indice se non serve più
DROP INDEX idx_temp;
```

---

**📌 Salva questo file e tienilo a portata di mano per la gestione quotidiana del database!**

