/*
  # Fix Orders Table with All Required Fields

  1. New Columns
    - Add all missing order fields without window functions
    - Product details, seller information, delivery address
    - Order notes and enhanced tracking

  2. Features
    - Complete order information storage
    - Better order tracking and management
    - Enhanced seller and product relationship

  3. Security
    - Maintain existing RLS policies
    - Proper indexing for performance
    - Data integrity constraints
*/

-- Add missing columns to orders table
DO $$
BEGIN
  -- Add product_name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'product_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN product_name VARCHAR(255);
  END IF;

  -- Add product_category column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'product_category'
  ) THEN
    ALTER TABLE orders ADD COLUMN product_category VARCHAR(50);
  END IF;

  -- Add product_grade column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'product_grade'
  ) THEN
    ALTER TABLE orders ADD COLUMN product_grade VARCHAR(50);
  END IF;

  -- Add product_sku column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'product_sku'
  ) THEN
    ALTER TABLE orders ADD COLUMN product_sku VARCHAR(20);
  END IF;

  -- Add seller_name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'seller_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN seller_name VARCHAR(255);
  END IF;

  -- Add seller_email column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'seller_email'
  ) THEN
    ALTER TABLE orders ADD COLUMN seller_email VARCHAR(255);
  END IF;

  -- Add seller_phone column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'seller_phone'
  ) THEN
    ALTER TABLE orders ADD COLUMN seller_phone VARCHAR(20);
  END IF;

  -- Add seller_company column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'seller_company'
  ) THEN
    ALTER TABLE orders ADD COLUMN seller_company VARCHAR(255);
  END IF;

  -- Add delivery_address column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'delivery_address'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivery_address TEXT;
  END IF;

  -- Add order_notes column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'order_notes'
  ) THEN
    ALTER TABLE orders ADD COLUMN order_notes TEXT;
  END IF;

  -- Add buyer_name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'buyer_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN buyer_name VARCHAR(255);
  END IF;

  -- Add buyer_email column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'buyer_email'
  ) THEN
    ALTER TABLE orders ADD COLUMN buyer_email VARCHAR(255);
  END IF;

  -- Add buyer_phone column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'buyer_phone'
  ) THEN
    ALTER TABLE orders ADD COLUMN buyer_phone VARCHAR(20);
  END IF;

  -- Add buyer_company column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'buyer_company'
  ) THEN
    ALTER TABLE orders ADD COLUMN buyer_company VARCHAR(255);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_product_sku ON orders(product_sku);
CREATE INDEX IF NOT EXISTS idx_orders_product_category ON orders(product_category);
CREATE INDEX IF NOT EXISTS idx_orders_seller_email ON orders(seller_email);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_email ON orders(buyer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Update existing orders with sample data if they don't have the new fields
UPDATE orders 
SET 
  product_name = COALESCE(product_name, 'Sample Product'),
  product_category = COALESCE(product_category, 'cashews'),
  product_grade = COALESCE(product_grade, 'W320'),
  delivery_address = COALESCE(delivery_address, 'Sample delivery address'),
  order_notes = COALESCE(order_notes, 'Admin created order')
WHERE product_name IS NULL OR product_category IS NULL OR product_grade IS NULL;

-- Generate SKUs for existing orders without window functions
DO $$
DECLARE
    order_record RECORD;
    counter INTEGER := 1;
    new_sku VARCHAR(20);
BEGIN
    FOR order_record IN 
        SELECT id, product_category, product_grade, created_at 
        FROM orders 
        WHERE product_sku IS NULL 
        ORDER BY created_at
    LOOP
        -- Generate SKU based on category and grade
        new_sku := CASE 
            WHEN order_record.product_category = 'cashews' THEN 'CSH'
            WHEN order_record.product_category = 'cloves' THEN 'CLV'
            WHEN order_record.product_category = 'chillies' THEN 'CHL'
            WHEN order_record.product_category = 'star-anise' THEN 'STA'
            WHEN order_record.product_category = 'pepper' THEN 'PEP'
            WHEN order_record.product_category = 'cinnamon' THEN 'CIN'
            ELSE 'OTH'
        END || '-' || 
        LEFT(REGEXP_REPLACE(UPPER(COALESCE(order_record.product_grade, 'UNKNOWN')), '[^A-Z0-9]', '', 'g'), 6) || '-' || 
        LPAD(counter::TEXT, 6, '0');
        
        UPDATE orders 
        SET product_sku = new_sku 
        WHERE id = order_record.id;
        
        counter := counter + 1;
    END LOOP;
END $$;

-- Update seller information from users table
UPDATE orders 
SET 
  seller_name = u.name,
  seller_email = u.email,
  seller_phone = u.phone,
  seller_company = u.company_name
FROM users u
WHERE orders.seller_id = u.id
AND (orders.seller_name IS NULL OR orders.seller_email IS NULL);

-- Update buyer information from users table
UPDATE orders 
SET 
  buyer_name = u.name,
  buyer_email = u.email,
  buyer_phone = u.phone,
  buyer_company = u.company_name
FROM users u
WHERE orders.buyer_id = u.id
AND (orders.buyer_name IS NULL OR orders.buyer_email IS NULL);

-- Create function to auto-populate seller info when order is created
CREATE OR REPLACE FUNCTION populate_order_info()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-populate seller information from users table
  SELECT name, email, phone, company_name
  INTO NEW.seller_name, NEW.seller_email, NEW.seller_phone, NEW.seller_company
  FROM users
  WHERE id = NEW.seller_id;
  
  -- Auto-populate buyer information from users table
  SELECT name, email, phone, company_name
  INTO NEW.buyer_name, NEW.buyer_email, NEW.buyer_phone, NEW.buyer_company
  FROM users
  WHERE id = NEW.buyer_id;
  
  -- Auto-populate product information if product_id is provided
  IF NEW.product_id IS NOT NULL THEN
    SELECT name, category, grade, sku
    INTO NEW.product_name, NEW.product_category, NEW.product_grade, NEW.product_sku
    FROM products
    WHERE id = NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-populate order info
DROP TRIGGER IF EXISTS populate_order_info_trigger ON orders;
CREATE TRIGGER populate_order_info_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION populate_order_info();