-- Drop the old table if it exists (it has wrong column types)
DROP TABLE IF EXISTS public.site_data CASCADE;

-- Create the site_data table with TEXT id so we can use 'main' as the key
CREATE TABLE public.site_data (
  id text PRIMARY KEY,
  content jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.site_data ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read data (your website visitors need this)
CREATE POLICY "Allow public read access" 
  ON public.site_data 
  FOR SELECT 
  USING (true);

-- Allow anyone to insert/update data (your admin panel needs this)
CREATE POLICY "Allow public write access" 
  ON public.site_data 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public update access" 
  ON public.site_data 
  FOR UPDATE 
  USING (true);

-- Insert the initial empty row so the frontend can read and update it
INSERT INTO public.site_data (id, content) 
VALUES ('main', '{}'::jsonb);
