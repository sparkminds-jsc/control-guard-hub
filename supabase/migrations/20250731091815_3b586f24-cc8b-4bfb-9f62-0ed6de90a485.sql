-- Enable realtime for laws_and_regulations table
ALTER TABLE public.laws_and_regulations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.laws_and_regulations;

-- Enable realtime for control_framework table  
ALTER TABLE public.control_framework REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.control_framework;

-- Create function to handle cascade updates when laws_and_regulations is deleted
CREATE OR REPLACE FUNCTION handle_laws_and_regulations_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Update control_framework records to set id_laws_and_regulations to NULL 
  -- when the referenced law is deleted
  UPDATE public.control_framework 
  SET id_laws_and_regulations = NULL,
      updated_at = now()
  WHERE id_laws_and_regulations = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for laws_and_regulations deletion
CREATE TRIGGER on_laws_and_regulations_delete
  BEFORE DELETE ON public.laws_and_regulations
  FOR EACH ROW
  EXECUTE FUNCTION handle_laws_and_regulations_delete();

-- Create function to handle cascade updates when laws_and_regulations is updated
CREATE OR REPLACE FUNCTION handle_laws_and_regulations_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the updated_at timestamp of related control_framework records
  -- when the referenced law is updated
  UPDATE public.control_framework 
  SET updated_at = now()
  WHERE id_laws_and_regulations = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for laws_and_regulations updates
CREATE TRIGGER on_laws_and_regulations_update
  AFTER UPDATE ON public.laws_and_regulations
  FOR EACH ROW
  EXECUTE FUNCTION handle_laws_and_regulations_update();