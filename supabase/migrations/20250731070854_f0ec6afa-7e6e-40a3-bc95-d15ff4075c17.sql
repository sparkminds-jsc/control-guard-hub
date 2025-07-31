-- Create laws_and_regulations table
CREATE TABLE public.laws_and_regulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  country TEXT NOT NULL,
  source TEXT NOT NULL,
  company_id UUID NOT NULL,
  domain_id UUID REFERENCES public.domains(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  market_id UUID REFERENCES public.markets(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.laws_and_regulations ENABLE ROW LEVEL SECURITY;

-- Create policies for laws_and_regulations access
CREATE POLICY "Anyone can view laws_and_regulations" 
ON public.laws_and_regulations 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert laws_and_regulations" 
ON public.laws_and_regulations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update laws_and_regulations" 
ON public.laws_and_regulations 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete laws_and_regulations" 
ON public.laws_and_regulations 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_laws_and_regulations_updated_at
BEFORE UPDATE ON public.laws_and_regulations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();