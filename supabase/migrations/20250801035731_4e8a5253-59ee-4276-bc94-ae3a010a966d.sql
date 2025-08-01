-- Enable realtime for all tables
ALTER TABLE public.companies REPLICA IDENTITY FULL;
ALTER TABLE public.domains REPLICA IDENTITY FULL;
ALTER TABLE public.activities REPLICA IDENTITY FULL;
ALTER TABLE public.markets REPLICA IDENTITY FULL;
ALTER TABLE public.laws_and_regulations REPLICA IDENTITY FULL;
ALTER TABLE public.control_framework REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.companies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.domains;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.markets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.laws_and_regulations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.control_framework;