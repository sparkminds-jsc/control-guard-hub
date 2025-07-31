-- Remove array columns from companies table since we're using separate tables
ALTER TABLE public.companies 
DROP COLUMN IF EXISTS domains,
DROP COLUMN IF EXISTS activities, 
DROP COLUMN IF EXISTS markets;