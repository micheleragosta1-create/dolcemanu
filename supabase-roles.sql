-- Sistema di ruoli per Dolce Manu
-- Esegui questo script nel SQL Editor di Supabase

-- 1. Aggiungiamo la colonna role alla tabella auth.users (se non esiste)
-- Nota: In Supabase, user_metadata viene gestito automaticamente

-- 2. Creiamo una tabella per i ruoli utente
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. Creiamo un trigger per aggiornare updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_roles_updated_at 
  BEFORE UPDATE ON user_roles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 4. Inseriamo il super admin (sostituisci con la tua email)
-- IMPORTANTE: Prima registra un account con questa email tramite l'app
INSERT INTO user_roles (user_id, role) 
SELECT id, 'super_admin' 
FROM auth.users 
WHERE email = 'michele.ragosta1@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';

-- 5. Creiamo una funzione per ottenere il ruolo dell'utente
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

-- 6. Aggiorniamo le policy RLS per i prodotti (solo admin possono modificare)
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Products are insertable by admin" ON products;
DROP POLICY IF EXISTS "Products are updatable by admin" ON products;
DROP POLICY IF EXISTS "Products are deletable by admin" ON products;

-- Policy per visualizzare prodotti (tutti)
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Policy per inserire prodotti (solo admin e super_admin)
CREATE POLICY "Products are insertable by admin" ON products
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

-- Policy per aggiornare prodotti (solo admin e super_admin)
CREATE POLICY "Products are updatable by admin" ON products
  FOR UPDATE USING (
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

-- Policy per eliminare prodotti (solo super_admin)
CREATE POLICY "Products are deletable by super_admin" ON products
  FOR DELETE USING (
    get_user_role(auth.uid()) = 'super_admin'
  );

-- 7. Aggiorniamo le policy RLS per gli ordini
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Admin can view all orders" ON orders;
DROP POLICY IF EXISTS "Admin can update order status" ON orders;

-- Policy per visualizzare ordini (utente vede i suoi, admin vede tutti)
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR 
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

-- Policy per inserire ordini (utenti autenticati)
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

-- Policy per aggiornare stato ordini (solo admin e super_admin)
CREATE POLICY "Admin can update order status" ON orders
  FOR UPDATE USING (
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

-- 8. Creiamo una funzione per verificare se l'utente è admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role(user_uuid) IN ('admin', 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Creiamo una funzione per verificare se l'utente è super_admin
CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role(user_uuid) = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Abilitiamo RLS su user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Policy per user_roles (solo super_admin può gestire)
CREATE POLICY "Only super_admin can manage user roles" ON user_roles
  FOR ALL USING (
    get_user_role(auth.uid()) = 'super_admin'
  );

-- 11. Creiamo un indice per migliorare le performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- 12. Funzione per ottenere tutti gli utenti (solo per admin)
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  role VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Verifica che l'utente sia admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: admin privileges required';
  END IF;
  
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    COALESCE(ur.role, 'user') as role,
    u.created_at
  FROM auth.users u
  LEFT JOIN user_roles ur ON u.id = ur.user_id
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Funzione per aggiornare il ruolo di un utente (solo super_admin)
CREATE OR REPLACE FUNCTION update_user_role(target_user_id UUID, new_role VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verifica che l'utente sia super_admin
  IF NOT is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: super_admin privileges required';
  END IF;
  
  -- Verifica che il ruolo sia valido
  IF new_role NOT IN ('user', 'admin', 'super_admin') THEN
    RAISE EXCEPTION 'Invalid role: must be user, admin, or super_admin';
  END IF;
  
  -- Aggiorna o inserisce il ruolo
  INSERT INTO user_roles (user_id, role) 
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id) 
  DO UPDATE SET role = new_role, updated_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Messaggio di conferma
SELECT 'Schema ruoli creato con successo!' as status;
