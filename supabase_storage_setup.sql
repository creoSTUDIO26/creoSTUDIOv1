-- Run this AFTER the site_data table setup

-- Create the storage bucket for media uploads (logos, work images, etc.)
-- Go to: Supabase Dashboard > Storage > New Bucket
-- Name: portfolio-media
-- Make it PUBLIC (toggle on)

-- If the bucket already exists, just make sure it's set to PUBLIC.
-- Then add this storage policy so uploads work:

-- 1. Go to Storage > Policies (on the portfolio-media bucket)
-- 2. Add these policies:

-- OPTION A: Run this SQL to create policies automatically:

-- Allow anyone to upload files
INSERT INTO storage.policies (name, bucket_id, operation, definition)
SELECT 'Allow public uploads', 'portfolio-media', 'INSERT', '(true)'
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies 
  WHERE bucket_id = 'portfolio-media' AND operation = 'INSERT'
);

-- Allow anyone to read/download files  
INSERT INTO storage.policies (name, bucket_id, operation, definition)
SELECT 'Allow public reads', 'portfolio-media', 'SELECT', '(true)'
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies 
  WHERE bucket_id = 'portfolio-media' AND operation = 'SELECT'
);

-- OPTION B (EASIER - Do this manually instead):
-- 1. Go to Supabase Dashboard > Storage
-- 2. Click "New Bucket"
-- 3. Name: portfolio-media
-- 4. Toggle "Public bucket" ON
-- 5. Click "Create bucket"
-- 6. Click on the bucket > Policies tab
-- 7. Click "New Policy" > "For full customization"
-- 8. Policy name: "Allow all operations"
-- 9. Allowed operation: ALL
-- 10. Target roles: (leave empty for anon)
-- 11. USING expression: true
-- 12. WITH CHECK expression: true
-- 13. Click "Review" then "Save"
