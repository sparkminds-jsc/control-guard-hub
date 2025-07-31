-- Create control_framework table
CREATE TABLE public.control_framework (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  context TEXT,
  description TEXT,
  id_domain UUID REFERENCES public.domains(id),
  id_activities UUID REFERENCES public.activities(id),
  countryApplied TEXT,
  id_laws_and_regulations UUID REFERENCES public.laws_and_regulations(id),
  riskManagement TEXT,
  referralSource TEXT,
  id_markets UUID REFERENCES public.markets(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.control_framework ENABLE ROW LEVEL SECURITY;

-- Create policies for control_framework
CREATE POLICY "Anyone can view control_framework" 
ON public.control_framework 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert control_framework" 
ON public.control_framework 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update control_framework" 
ON public.control_framework 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete control_framework" 
ON public.control_framework 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_control_framework_updated_at
BEFORE UPDATE ON public.control_framework
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();