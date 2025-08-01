-- Add company_id column to control_framework table
ALTER TABLE public.control_framework 
ADD COLUMN company_id uuid;

-- Add foreign key constraint to reference companies table
ALTER TABLE public.control_framework 
ADD CONSTRAINT fk_control_framework_company 
FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;