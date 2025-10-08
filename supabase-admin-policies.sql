-- Policy per permettere agli admin di vedere e gestire tutti gli ordini
-- Esegui questo script nel SQL Editor di Supabase

-- 1. Elimina le policy esistenti che potrebbero essere troppo restrittive
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Users can view order items for their orders" ON order_items;
DROP POLICY IF EXISTS "Users can create order items for their orders" ON order_items;

-- 2. Policy per Orders - Lettura
CREATE POLICY "Users can view their own orders OR admins can view all" ON orders
  FOR SELECT USING (
    auth.jwt() ->> 'email' = user_email 
    OR 
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = (auth.jwt() ->> 'sub')::uuid 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 3. Policy per Orders - Creazione (tutti possono creare ordini)
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

-- 4. Policy per Orders - Aggiornamento (solo admin)
CREATE POLICY "Admins can update all orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = (auth.jwt() ->> 'sub')::uuid 
      AND role IN ('admin', 'super_admin')
    )
  );

-- 5. Policy per Order Items - Lettura
CREATE POLICY "Users can view items for their orders OR admins can view all" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (
        orders.user_email = auth.jwt() ->> 'email'
        OR
        EXISTS (
          SELECT 1 FROM user_roles 
          WHERE user_id = (auth.jwt() ->> 'sub')::uuid 
          AND role IN ('admin', 'super_admin')
        )
      )
    )
  );

-- 6. Policy per Order Items - Creazione (tutti possono creare)
CREATE POLICY "Anyone can create order items" ON order_items
  FOR INSERT WITH CHECK (true);

-- 7. Policy per permettere accesso pubblico temporaneo agli ordini (solo per test)
-- ATTENZIONE: Questa è una policy temporanea per permettere all'admin di vedere gli ordini
-- In produzione, assicurati che gli admin siano registrati correttamente nella tabella user_roles

-- Se non hai ancora configurato user_roles, usa questa policy temporanea:
DROP POLICY IF EXISTS "Temp: Allow service role to view all orders" ON orders;
CREATE POLICY "Service role can view all orders" ON orders
  FOR SELECT USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR
    true -- ATTENZIONE: Rimuovi questo "OR true" in produzione!
  );

-- Policy temporanea per order_items
DROP POLICY IF EXISTS "Temp: Service role can view all order items" ON order_items;
CREATE POLICY "Service role can view all order items" ON order_items
  FOR SELECT USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    OR
    true -- ATTENZIONE: Rimuovi questo "OR true" in produzione!
  );

-- Nota: Le policy con "OR true" permettono a tutti di leggere gli ordini.
-- Questo è solo per facilitare lo sviluppo e il testing.
-- In produzione, rimuovi "OR true" e assicurati che gli admin siano nella tabella user_roles.

