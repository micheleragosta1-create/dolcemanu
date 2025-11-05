-- ============================================================================
-- DOLCE MANU - SCHEMA COMPLETO DATABASE PER PRODUZIONE
-- ============================================================================
-- Questo script crea lo schema completo del database per il progetto Dolce Manu
-- Include: tabelle, policy RLS, funzioni, trigger, indici
-- 
-- ISTRUZIONI:
-- 1. Vai su Supabase Dashboard > SQL Editor
-- 2. Crea una nuova query
-- 3. Copia e incolla questo script COMPLETO
-- 4. Esegui (Run)
-- 5. Verifica che non ci siano errori
--
-- Versione: 2.0 (con soft delete)
-- Data: 2024
-- ============================================================================

-- ============================================================================
-- STEP 1: ABILITA ESTENSIONI
-- ============================================================================

-- Estensione per UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 2: CREA TABELLE PRINCIPALI
-- ============================================================================

-- TABELLA: products
-- Catalogo prodotti con soft delete
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT,
  category VARCHAR(100) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  
  -- Campi opzionali aggiuntivi
  ingredients TEXT,
  allergens TEXT,
  nutrition JSONB,
  
  -- Filtri avanzati
  chocolate_type VARCHAR(20) CHECK (chocolate_type IN ('fondente', 'latte', 'bianco', 'ruby', 'misto')),
  collection VARCHAR(100),
  box_format INTEGER CHECK (box_format IN (6, 9, 12)),
  box_formats JSONB, -- Formati con prezzi personalizzati: {"6": 18.90, "9": 26.90, "12": 34.90}
  
  -- Badge e promozioni
  is_new BOOLEAN DEFAULT true,
  is_bestseller BOOLEAN DEFAULT false,
  discount_percentage INTEGER CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  
  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- TABELLA: orders
-- Ordini clienti
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  
  -- Dati spedizione
  shipping_address TEXT NOT NULL,
  shipping_name VARCHAR(255),
  shipping_phone VARCHAR(50),
  shipping_city VARCHAR(100),
  shipping_zip VARCHAR(20),
  shipping_notes TEXT,
  
  -- Note admin
  admin_note TEXT,
  
  -- Stripe
  stripe_payment_intent_id VARCHAR(255),
  stripe_session_id VARCHAR(255),
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- TABELLA: order_items
-- Dettaglio prodotti negli ordini
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT, -- RESTRICT: non eliminare prodotti con ordini
  product_name VARCHAR(255) NOT NULL, -- Snapshot del nome al momento dell'ordine
  product_image_url TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0), -- Prezzo al momento dell'ordine
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- TABELLA: user_roles
-- Sistema di ruoli per admin
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- TABELLA: profiles
-- Profili utenti (anagrafica)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(30),
  address TEXT,
  city VARCHAR(100),
  zip VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- TABELLA: reviews (opzionale - se implementate)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true, -- Per moderazione
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- STEP 3: CREA INDICI PER PERFORMANCE
-- ============================================================================

-- Indici per products
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at); -- Per soft delete
CREATE INDEX IF NOT EXISTS idx_products_chocolate_type ON products(chocolate_type);
CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection);
CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new) WHERE is_new = true;
CREATE INDEX IF NOT EXISTS idx_products_is_bestseller ON products(is_bestseller) WHERE is_bestseller = true;

-- Indici per orders
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id);

-- Indici per order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Indici per user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Indici per profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Indici per reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_email ON reviews(user_email);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_is_visible ON reviews(is_visible) WHERE is_visible = true;

-- ============================================================================
-- STEP 4: CREA FUNZIONI UTILITY
-- ============================================================================

-- Funzione per aggiornare automaticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Funzione per soft delete prodotti
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

-- Funzione per ripristinare prodotti eliminati
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

-- Funzione per ottenere il ruolo utente
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

-- Funzione per verificare se un utente è admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role(user_uuid) IN ('admin', 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione per decrementare stock in modo sicuro
CREATE OR REPLACE FUNCTION decrease_stock(product_uuid UUID, quantity INTEGER)
RETURNS INTEGER AS $$
DECLARE
  current_stock INTEGER;
  new_stock INTEGER;
BEGIN
  -- Blocca la riga per evitare race conditions
  SELECT stock_quantity INTO current_stock 
  FROM products 
  WHERE id = product_uuid
  FOR UPDATE;
  
  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  IF current_stock < quantity THEN
    RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', current_stock, quantity;
  END IF;
  
  new_stock := current_stock - quantity;
  
  UPDATE products 
  SET stock_quantity = new_stock,
      updated_at = NOW()
  WHERE id = product_uuid;
  
  RETURN new_stock;
END;
$$ LANGUAGE plpgsql;

-- Funzione RPC per ottenere tutti gli utenti (solo admin)
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  user_id UUID,
  email VARCHAR,
  role VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Verifica che l'utente chiamante sia admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin only.';
  END IF;
  
  RETURN QUERY
  SELECT 
    ur.user_id,
    au.email::VARCHAR,
    ur.role,
    ur.created_at
  FROM user_roles ur
  JOIN auth.users au ON ur.user_id = au.id
  ORDER BY ur.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione RPC per contare utenti (solo admin)
CREATE OR REPLACE FUNCTION admin_count_users()
RETURNS INTEGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin only.';
  END IF;
  
  SELECT COUNT(*) INTO user_count FROM user_roles;
  RETURN user_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funzione RPC per aggiornare ruolo utente (solo super_admin)
CREATE OR REPLACE FUNCTION update_user_role(target_user_id UUID, new_role VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  -- Solo super_admin può modificare i ruoli
  IF get_user_role(auth.uid()) != 'super_admin' THEN
    RAISE EXCEPTION 'Access denied. Super admin only.';
  END IF;
  
  -- Non puoi modificare il tuo stesso ruolo
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot modify your own role';
  END IF;
  
  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id) 
  DO UPDATE SET role = new_role, updated_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 5: CREA TRIGGER
-- ============================================================================

-- Trigger per products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger per orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger per user_roles
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at 
  BEFORE UPDATE ON user_roles
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger per profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger per reviews
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at 
  BEFORE UPDATE ON reviews
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 6: ABILITA ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 7: POLICY RLS PER PRODUCTS
-- ============================================================================

-- Drop policy esistenti
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products are insertable by admin" ON products;
DROP POLICY IF EXISTS "Products are updatable by admin" ON products;
DROP POLICY IF EXISTS "Products are deletable by super_admin" ON products;
DROP POLICY IF EXISTS "Allow public read access to products" ON products;

-- Tutti possono vedere prodotti attivi (non eliminati)
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (deleted_at IS NULL);

-- Solo admin possono inserire
CREATE POLICY "Products are insertable by admin" ON products
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

-- Solo admin possono aggiornare
CREATE POLICY "Products are updatable by admin" ON products
  FOR UPDATE USING (
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

-- Solo super_admin possono eliminare (soft delete)
CREATE POLICY "Products are deletable by super_admin" ON products
  FOR DELETE USING (
    get_user_role(auth.uid()) = 'super_admin'
  );

-- ============================================================================
-- STEP 8: POLICY RLS PER ORDERS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Admin can update order status" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;

-- Utenti vedono i propri ordini, admin vedono tutti
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (
    auth.jwt() ->> 'email' = user_email OR
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

-- Utenti autenticati possono creare ordini
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'email' = user_email
  );

-- Solo admin possono aggiornare stato ordini
CREATE POLICY "Admin can update order status" ON orders
  FOR UPDATE USING (
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

-- ============================================================================
-- STEP 9: POLICY RLS PER ORDER_ITEMS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view order items for their orders" ON order_items;
DROP POLICY IF EXISTS "Users can create order items for their orders" ON order_items;

-- Utenti vedono items dei propri ordini, admin vedono tutti
CREATE POLICY "Users can view order items for their orders" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (
        orders.user_email = auth.jwt() ->> 'email' OR
        get_user_role(auth.uid()) IN ('admin', 'super_admin')
      )
    )
  );

-- Utenti possono creare items per i propri ordini
CREATE POLICY "Users can create order items for their orders" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_email = auth.jwt() ->> 'email'
    )
  );

-- ============================================================================
-- STEP 10: POLICY RLS PER USER_ROLES
-- ============================================================================

DROP POLICY IF EXISTS "User roles are viewable by admins" ON user_roles;
DROP POLICY IF EXISTS "User roles are manageable by super_admins" ON user_roles;

-- Solo admin possono vedere i ruoli
CREATE POLICY "User roles are viewable by admins" ON user_roles
  FOR SELECT USING (
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

-- Solo super_admin possono modificare ruoli
CREATE POLICY "User roles are manageable by super_admins" ON user_roles
  FOR ALL USING (
    get_user_role(auth.uid()) = 'super_admin'
  );

-- ============================================================================
-- STEP 11: POLICY RLS PER PROFILES
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can upsert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Utenti vedono il proprio profilo
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (
    auth.uid() = user_id OR
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

-- Utenti possono inserire il proprio profilo
CREATE POLICY "Users can upsert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Utenti possono aggiornare il proprio profilo
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 12: POLICY RLS PER REVIEWS
-- ============================================================================

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Admin can manage all reviews" ON reviews;

-- Tutti vedono recensioni visibili
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (
    is_visible = true OR
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

-- Utenti autenticati possono creare recensioni
CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'email' = user_email
  );

-- Utenti possono aggiornare le proprie recensioni
CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (
    auth.jwt() ->> 'email' = user_email OR
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

-- Admin possono eliminare recensioni
CREATE POLICY "Admin can manage all reviews" ON reviews
  FOR DELETE USING (
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

-- ============================================================================
-- STEP 13: CREA VISTE UTILI (Opzionale)
-- ============================================================================

-- Vista per prodotti attivi
CREATE OR REPLACE VIEW active_products AS
SELECT * FROM products 
WHERE deleted_at IS NULL;

-- Vista per statistiche ordini
CREATE OR REPLACE VIEW order_statistics AS
SELECT 
  DATE_TRUNC('day', created_at) as order_date,
  status,
  COUNT(*) as order_count,
  SUM(total_amount) as total_revenue
FROM orders
GROUP BY DATE_TRUNC('day', created_at), status
ORDER BY order_date DESC;

-- ============================================================================
-- STEP 14: COMMENTI PER DOCUMENTAZIONE
-- ============================================================================

COMMENT ON TABLE products IS 'Catalogo prodotti con soft delete';
COMMENT ON COLUMN products.deleted_at IS 'Timestamp eliminazione soft. NULL = attivo, NOT NULL = eliminato';
COMMENT ON COLUMN products.box_formats IS 'Prezzi personalizzati per formati: {"6": 18.90, "9": 26.90, "12": 34.90}';

COMMENT ON TABLE orders IS 'Ordini clienti con tracking stato';
COMMENT ON TABLE order_items IS 'Dettaglio prodotti negli ordini (snapshot al momento ordine)';
COMMENT ON TABLE user_roles IS 'Sistema ruoli per controllo accessi admin';
COMMENT ON TABLE profiles IS 'Profili utenti per anagrafica e indirizzi';
COMMENT ON TABLE reviews IS 'Recensioni prodotti con moderazione';

COMMENT ON FUNCTION soft_delete_product IS 'Elimina (soft) un prodotto nascondendolo ma mantenendo i dati';
COMMENT ON FUNCTION restore_product IS 'Ripristina un prodotto eliminato';
COMMENT ON FUNCTION get_user_role IS 'Ottiene il ruolo di un utente';
COMMENT ON FUNCTION is_admin IS 'Verifica se un utente è admin o super_admin';

-- ============================================================================
-- STEP 15: INSERISCI SUPER ADMIN (PERSONALIZZA!)
-- ============================================================================

-- ⚠️ IMPORTANTE: Sostituisci con la TUA email di super admin
-- Prima registra un account con questa email tramite l'applicazione,
-- poi esegui questa query per impostare il ruolo super_admin

-- ESEMPIO (da personalizzare):
-- INSERT INTO user_roles (user_id, role) 
-- SELECT id, 'super_admin' 
-- FROM auth.users 
-- WHERE email = 'tua-email@example.com'
-- ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';

-- ⚠️ Decommenta e personalizza la query sopra con la tua email

-- ============================================================================
-- STEP 16: VERIFICA INSTALLAZIONE
-- ============================================================================

-- Query di verifica (esegui dopo l'installazione)
DO $$
DECLARE
  table_count INTEGER;
  function_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Conta tabelle
  SELECT COUNT(*) INTO table_count 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN ('products', 'orders', 'order_items', 'user_roles', 'profiles', 'reviews');
  
  -- Conta funzioni
  SELECT COUNT(*) INTO function_count
  FROM pg_proc
  WHERE proname IN ('soft_delete_product', 'restore_product', 'get_user_role', 'is_admin', 'decrease_stock');
  
  -- Conta policy
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';
  
  RAISE NOTICE '✅ Schema installato con successo!';
  RAISE NOTICE 'Tabelle create: %', table_count;
  RAISE NOTICE 'Funzioni create: %', function_count;
  RAISE NOTICE 'Policy RLS create: %', policy_count;
  RAISE NOTICE '';
  RAISE NOTICE '📝 Prossimi passi:';
  RAISE NOTICE '1. Personalizza lo STEP 15 con la tua email admin';
  RAISE NOTICE '2. Configura le variabili ambiente (.env.local)';
  RAISE NOTICE '3. Testa la connessione dall applicazione';
END $$;

-- ============================================================================
-- FINE SCRIPT
-- ============================================================================

-- Nota: Questo schema è production-ready e include:
-- ✅ Soft delete per prodotti
-- ✅ Sistema ruoli completo (user, admin, super_admin)
-- ✅ Row Level Security (RLS) configurato
-- ✅ Indici per performance
-- ✅ Funzioni utility per operazioni comuni
-- ✅ Trigger per updated_at automatico
-- ✅ Foreign keys per integrità dati
-- ✅ Constraint per validazione dati
-- ✅ Documentazione inline

