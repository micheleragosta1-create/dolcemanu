-- RPC: admin_count_users (ritorna un intero)
CREATE OR REPLACE FUNCTION public.admin_count_users()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE cnt integer;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: admin privileges required';
  END IF;
  SELECT COUNT(*) INTO cnt FROM auth.users;
  RETURN cnt;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_count_users() TO authenticated;
