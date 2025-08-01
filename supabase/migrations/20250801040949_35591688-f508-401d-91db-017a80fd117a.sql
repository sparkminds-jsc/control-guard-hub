-- Add status column to companies table for soft delete
ALTER TABLE public.companies 
ADD COLUMN status text NOT NULL DEFAULT 'active';

-- Add check constraint to ensure valid status values
ALTER TABLE public.companies 
ADD CONSTRAINT companies_status_check 
CHECK (status IN ('active', 'deleted', 'inactive'));

-- Create index for better performance when filtering by status
CREATE INDEX idx_companies_status ON public.companies(status);