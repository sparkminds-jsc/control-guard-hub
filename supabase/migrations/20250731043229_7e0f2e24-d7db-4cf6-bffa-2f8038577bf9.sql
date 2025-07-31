-- Remove country column from companies table
ALTER TABLE public.companies 
DROP COLUMN IF EXISTS country;