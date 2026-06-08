
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_emergency_contacts_limit() FROM PUBLIC, anon, authenticated;
