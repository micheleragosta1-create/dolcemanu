-- Fix per le policy RLS su user_roles
-- Problema: Le policy bloccano anche le funzioni SECURITY DEFINER

-- Drop delle policy esistenti
DROP POLICY IF EXISTS "User roles are viewable by admins" ON user_roles;
DROP POLICY IF EXISTS "User roles are manageable by super_admins" ON user_roles;

-- Policy per SELECT (admin e super_admin possono vedere)
CREATE POLICY "User roles are viewable by admins" ON user_roles
  FOR SELECT USING (
    get_user_role(auth.uid()) IN ('admin', 'super_admin')
  );

-- Policy per INSERT (solo super_admin, con WITH CHECK)
CREATE POLICY "User roles insertable by super_admins" ON user_roles
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) = 'super_admin'
  );

-- Policy per UPDATE (solo super_admin)
CREATE POLICY "User roles updatable by super_admins" ON user_roles
  FOR UPDATE 
  USING (get_user_role(auth.uid()) = 'super_admin')
  WITH CHECK (get_user_role(auth.uid()) = 'super_admin');

-- Policy per DELETE (solo super_admin)
CREATE POLICY "User roles deletable by super_admins" ON user_roles
  FOR DELETE USING (
    get_user_role(auth.uid()) = 'super_admin'
  );

-- OPPURE: Soluzione alternativa più semplice
-- Disabilita temporaneamente RLS per testare
-- ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Test: verifica le policy
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'user_roles';

