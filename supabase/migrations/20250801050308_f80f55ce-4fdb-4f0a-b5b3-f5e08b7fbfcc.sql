-- Remove password column from users table since Supabase auth handles password encryption
ALTER TABLE public.users DROP COLUMN IF EXISTS password;