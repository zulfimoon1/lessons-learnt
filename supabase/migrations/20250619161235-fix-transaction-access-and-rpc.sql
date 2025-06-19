
-- Create RPC function for admin transaction access
CREATE OR REPLACE FUNCTION public.get_all_transactions_admin()
RETURNS SETOF transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- This function runs with elevated privileges to bypass RLS
  RETURN QUERY SELECT * FROM public.transactions ORDER BY created_at DESC;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION public.get_all_transactions_admin() TO service_role;

-- Ensure service role has full access to transactions table
GRANT ALL ON public.transactions TO service_role;
