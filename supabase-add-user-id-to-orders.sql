-- =====================================================
-- AGGIUNGI user_id ALLA TABELLA ORDERS
-- =====================================================
-- Questo script collega gli ordini all'UUID dell'utente invece che alla sola email
-- Così l'ordine è associato all'utente indipendentemente dall'email usata per pagare

-- 1. Aggiungi la colonna user_id (nullable per retrocompatibilità)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN orders.user_id IS 
'UUID dell''utente che ha effettuato l''ordine. Collegato a auth.users.';

-- 2. Crea un indice per query veloci
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- 3. Prova a collegare ordini esistenti agli utenti basandoti sull'email
-- (opzionale, solo se hai ordini esistenti da collegare)
UPDATE orders o
SET user_id = u.id
FROM auth.users u
WHERE o.user_email = u.email
  AND o.user_id IS NULL;

-- 4. Verifica i risultati
SELECT 
  COUNT(*) as total_orders,
  COUNT(user_id) as orders_with_user_id,
  COUNT(*) - COUNT(user_id) as orders_without_user_id
FROM orders;

-- ✅ Struttura aggiornata:
-- - orders.user_id: UUID dell'utente (NUOVO)
-- - orders.user_email: Email di riferimento (mantenuto per info)
-- - Indice su user_id per query veloci
-- - Query per user_id invece di user_email

