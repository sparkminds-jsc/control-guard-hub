-- Tạo bảng domains
CREATE TABLE public.domains (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tạo bảng activities
CREATE TABLE public.activities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tạo bảng markets
CREATE TABLE public.markets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS cho tất cả các bảng
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;

-- Tạo policies cho domains
CREATE POLICY "Anyone can view domains" ON public.domains FOR SELECT USING (true);
CREATE POLICY "Anyone can insert domains" ON public.domains FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update domains" ON public.domains FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete domains" ON public.domains FOR DELETE USING (true);

-- Tạo policies cho activities
CREATE POLICY "Anyone can view activities" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Anyone can insert activities" ON public.activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update activities" ON public.activities FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete activities" ON public.activities FOR DELETE USING (true);

-- Tạo policies cho markets
CREATE POLICY "Anyone can view markets" ON public.markets FOR SELECT USING (true);
CREATE POLICY "Anyone can insert markets" ON public.markets FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update markets" ON public.markets FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete markets" ON public.markets FOR DELETE USING (true);

-- Tạo indexes cho hiệu suất
CREATE INDEX idx_domains_company_id ON public.domains(company_id);
CREATE INDEX idx_activities_company_id ON public.activities(company_id);
CREATE INDEX idx_markets_company_id ON public.markets(company_id);

-- Tạo trigger functions cho updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tạo triggers cho updated_at
CREATE TRIGGER update_domains_updated_at
  BEFORE UPDATE ON public.domains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_markets_updated_at
  BEFORE UPDATE ON public.markets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();