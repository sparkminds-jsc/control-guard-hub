-- Add columns to track button states for company details
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS company_details_fetched BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS laws_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS control_framework_generated BOOLEAN DEFAULT false;