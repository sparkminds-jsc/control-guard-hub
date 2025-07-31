-- Enable realtime for tables to support live updates
ALTER TABLE public.laws_and_regulations REPLICA IDENTITY FULL;
ALTER TABLE public.domains REPLICA IDENTITY FULL;  
ALTER TABLE public.activities REPLICA IDENTITY FULL;
ALTER TABLE public.markets REPLICA IDENTITY FULL;

-- Add tables to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.laws_and_regulations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.domains;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.markets;