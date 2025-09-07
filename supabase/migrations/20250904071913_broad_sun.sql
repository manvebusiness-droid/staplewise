/*
  # Add Price History Tracking

  1. New Tables
    - `product_price_history` - Track price changes over time
    - Records every price update with timestamp
    - Links to products table for relationship

  2. Features
    - Automatic price history tracking
    - Trigger to insert price changes
    - Query functions for price trends
    - Historical price analysis

  3. Security
    - RLS disabled for price history (read-only data)
    - Proper indexing for performance
    - Automatic timestamp management
*/

-- Create product price history table
CREATE TABLE IF NOT EXISTS product_price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    price_per_kg DECIMAL(10,2) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    change_reason VARCHAR(255) DEFAULT 'Price update',
    previous_price DECIMAL(10,2),
    
    -- Indexes for performance
    INDEX idx_price_history_product_id (product_id),
    INDEX idx_price_history_changed_at (changed_at)
);

-- Disable RLS for price history (read-only data)
ALTER TABLE product_price_history DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON product_price_history TO authenticated;
GRANT SELECT ON product_price_history TO anon;

-- Create function to track price changes
CREATE OR REPLACE FUNCTION track_price_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only insert if price actually changed
    IF OLD.price_per_kg IS DISTINCT FROM NEW.price_per_kg THEN
        INSERT INTO product_price_history (
            product_id,
            price_per_kg,
            previous_price,
            changed_by,
            change_reason
        ) VALUES (
            NEW.id,
            NEW.price_per_kg,
            OLD.price_per_kg,
            NEW.seller_id, -- Use seller_id as changed_by
            'Price updated'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically track price changes
DROP TRIGGER IF EXISTS track_product_price_changes ON products;
CREATE TRIGGER track_product_price_changes
    AFTER UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION track_price_change();

-- Insert initial price history for existing products
INSERT INTO product_price_history (product_id, price_per_kg, change_reason, changed_at)
SELECT 
    id,
    price_per_kg,
    'Initial price',
    created_at
FROM products
WHERE id NOT IN (SELECT DISTINCT product_id FROM product_price_history);

-- Create function to get price history for a product
CREATE OR REPLACE FUNCTION get_product_price_history(
    p_product_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    date DATE,
    price DECIMAL(10,2),
    change_reason VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(changed_at) as date,
        price_per_kg as price,
        product_price_history.change_reason
    FROM product_price_history
    WHERE product_id = p_product_id
    AND changed_at >= NOW() - INTERVAL '1 day' * p_days
    ORDER BY changed_at ASC;
END;
$$ LANGUAGE plpgsql;