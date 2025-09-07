/*
  # Fix SKU Generation for Products

  1. New Columns
    - `sku` (varchar) - Unique product identifier
    - Auto-generated SKU for existing products
    - Unique constraint on SKU field

  2. Features
    - Automatic SKU generation function
    - Trigger to generate SKU on product insert
    - Update existing products with SKUs using proper SQL syntax
*/

-- Add SKU column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'sku'
  ) THEN
    ALTER TABLE products ADD COLUMN sku VARCHAR(20) UNIQUE;
  END IF;
END $$;

-- Create function to generate unique SKU
CREATE OR REPLACE FUNCTION generate_product_sku()
RETURNS TRIGGER AS $$
DECLARE
    category_prefix VARCHAR(3);
    grade_prefix VARCHAR(10);
    random_suffix VARCHAR(6);
    new_sku VARCHAR(20);
    sku_exists BOOLEAN;
BEGIN
    -- Generate category prefix
    category_prefix := CASE 
        WHEN NEW.category = 'cashews' THEN 'CSH'
        WHEN NEW.category = 'cloves' THEN 'CLV'
        WHEN NEW.category = 'chillies' THEN 'CHL'
        WHEN NEW.category = 'star-anise' THEN 'STA'
        WHEN NEW.category = 'pepper' THEN 'PEP'
        WHEN NEW.category = 'cinnamon' THEN 'CIN'
        ELSE 'OTH'
    END;
    
    -- Clean grade for prefix (remove special characters)
    grade_prefix := REGEXP_REPLACE(UPPER(NEW.grade), '[^A-Z0-9]', '', 'g');
    grade_prefix := LEFT(grade_prefix, 6);
    
    -- Generate SKU with retry logic
    LOOP
        -- Generate random suffix
        random_suffix := LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
        
        -- Combine to create SKU
        new_sku := category_prefix || '-' || grade_prefix || '-' || random_suffix;
        
        -- Check if SKU already exists
        SELECT EXISTS(SELECT 1 FROM products WHERE sku = new_sku) INTO sku_exists;
        
        -- Exit loop if SKU is unique
        EXIT WHEN NOT sku_exists;
    END LOOP;
    
    NEW.sku := new_sku;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate SKU
DROP TRIGGER IF EXISTS generate_sku_trigger ON products;
CREATE TRIGGER generate_sku_trigger
    BEFORE INSERT ON products
    FOR EACH ROW
    WHEN (NEW.sku IS NULL)
    EXECUTE FUNCTION generate_product_sku();

-- Update existing products with SKUs using a different approach
DO $$
DECLARE
    product_record RECORD;
    category_prefix VARCHAR(3);
    grade_prefix VARCHAR(10);
    counter INTEGER := 1;
    new_sku VARCHAR(20);
BEGIN
    -- Loop through each product that doesn't have a SKU
    FOR product_record IN 
        SELECT id, category, grade, created_at 
        FROM products 
        WHERE sku IS NULL 
        ORDER BY created_at
    LOOP
        -- Generate category prefix
        category_prefix := CASE 
            WHEN product_record.category = 'cashews' THEN 'CSH'
            WHEN product_record.category = 'cloves' THEN 'CLV'
            WHEN product_record.category = 'chillies' THEN 'CHL'
            WHEN product_record.category = 'star-anise' THEN 'STA'
            WHEN product_record.category = 'pepper' THEN 'PEP'
            WHEN product_record.category = 'cinnamon' THEN 'CIN'
            ELSE 'OTH'
        END;
        
        -- Clean grade for prefix
        grade_prefix := LEFT(REGEXP_REPLACE(UPPER(product_record.grade), '[^A-Z0-9]', '', 'g'), 6);
        
        -- Generate SKU
        new_sku := category_prefix || '-' || grade_prefix || '-' || LPAD(counter::TEXT, 6, '0');
        
        -- Update the product with the new SKU
        UPDATE products 
        SET sku = new_sku 
        WHERE id = product_record.id;
        
        -- Increment counter
        counter := counter + 1;
    END LOOP;
END $$;

-- Add new columns to queries table for SKU and category tracking
DO $$
BEGIN
  -- Add product_sku column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'queries' AND column_name = 'product_sku'
  ) THEN
    ALTER TABLE queries ADD COLUMN product_sku VARCHAR(20);
  END IF;

  -- Add product_category column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'queries' AND column_name = 'product_category'
  ) THEN
    ALTER TABLE queries ADD COLUMN product_category VARCHAR(50);
  END IF;
END $$;

-- Create index for SKU lookups
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_queries_product_sku ON queries(product_sku);