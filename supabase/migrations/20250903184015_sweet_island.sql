/*
  # Add New Product Fields

  1. New Columns
    - `grade_description` (text) - Description about specifications and grade
    - `quality_assurance` (text array) - Up to 5 quality assurance points
    - `packaging_delivery` (text array) - Up to 5 packaging and delivery points

  2. Changes
    - Add new columns to products table
    - Update existing products with default values
    - Maintain backward compatibility
*/

-- Add new columns to products table
DO $$
BEGIN
  -- Add grade_description column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'grade_description'
  ) THEN
    ALTER TABLE products ADD COLUMN grade_description TEXT;
  END IF;

  -- Add quality_assurance column (array of text)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'quality_assurance'
  ) THEN
    ALTER TABLE products ADD COLUMN quality_assurance TEXT[] DEFAULT '{}';
  END IF;

  -- Add packaging_delivery column (array of text)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'packaging_delivery'
  ) THEN
    ALTER TABLE products ADD COLUMN packaging_delivery TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Update existing products with default values
UPDATE products 
SET 
  grade_description = COALESCE(grade_description, 'Premium quality ' || grade || ' grade cashew kernels with excellent specifications'),
  quality_assurance = COALESCE(quality_assurance, ARRAY['Premium grade selection', 'Regular quality checks', 'Food safety standards']),
  packaging_delivery = COALESCE(packaging_delivery, ARRAY['Vacuum sealed packaging', 'Express delivery available', 'Bulk packaging options'])
WHERE grade_description IS NULL OR quality_assurance IS NULL OR packaging_delivery IS NULL;