/*
  # Create Product Images Storage Bucket

  1. Storage Setup
    - Create product-images bucket with proper configuration
    - Set up public access for product images
    - Configure file size and type restrictions
    - Enable simple RLS policies that work

  2. Security
    - Public read access for all product images
    - Authenticated users can upload images
    - Simple, working RLS policies without complex type casting
*/

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own product images" ON storage.objects;
DROP POLICY IF EXISTS "Enable read access for product images" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert for authenticated users on product images" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for authenticated users on product images" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for authenticated users on product images" ON storage.objects;

-- Create simple, working policies for storage
CREATE POLICY "Allow public read access to product images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated upload to product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated update of product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated delete of product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;
GRANT ALL ON storage.buckets TO authenticated;
GRANT SELECT ON storage.buckets TO anon;