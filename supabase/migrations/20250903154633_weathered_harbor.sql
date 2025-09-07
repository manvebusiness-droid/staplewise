-- StapleWise B2B Platform Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'BUYER' CHECK (role IN ('ADMIN', 'SALES', 'BUYER', 'SELLER')),
    company_name VARCHAR(255),
    gst VARCHAR(15),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company details table
CREATE TABLE IF NOT EXISTS company_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address_street1 VARCHAR(255) NOT NULL,
    address_street2 VARCHAR(255),
    address_pincode VARCHAR(6) NOT NULL,
    address_state VARCHAR(100) NOT NULL,
    registrar_name VARCHAR(255) NOT NULL,
    gstin VARCHAR(15) NOT NULL,
    year_established INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    grade VARCHAR(50) NOT NULL,
    price_per_kg DECIMAL(10,2) NOT NULL,
    minimum_order_quantity INTEGER NOT NULL DEFAULT 1,
    stock INTEGER NOT NULL DEFAULT 0,
    location VARCHAR(100) NOT NULL,
    image TEXT NOT NULL,
    specifications TEXT NOT NULL,
    delivery_time VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Queries table
CREATE TABLE IF NOT EXISTS queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(10) NOT NULL CHECK (type IN ('BUY', 'SELL')),
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    pincode VARCHAR(6) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    gst VARCHAR(15),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ASSIGNED', 'COMPLETED', 'REJECTED')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price_per_kg DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_queries_status ON queries(status);
CREATE INDEX IF NOT EXISTS idx_queries_assigned_to ON queries(assigned_to);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_details_updated_at BEFORE UPDATE ON company_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_queries_updated_at BEFORE UPDATE ON queries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO users (id, email, name, phone, role, company_name, gst) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@staplewise.com', 'Admin User', '+91 98765 43210', 'ADMIN', 'StapleWise Admin', NULL),
('550e8400-e29b-41d4-a716-446655440001', 'sales@staplewise.com', 'Sales Manager', '+91 98765 43211', 'SALES', 'StapleWise Sales', NULL),
('550e8400-e29b-41d4-a716-446655440002', 'buyer@example.com', 'John Buyer', '+91 98765 43212', 'BUYER', 'ABC Trading Co.', NULL),
('550e8400-e29b-41d4-a716-446655440003', 'seller@example.com', 'Jane Seller', '+91 98765 43213', 'SELLER', 'XYZ Exports', '29ABCDE1234F1Z5')
ON CONFLICT (email) DO NOTHING;

-- Insert sample products
INSERT INTO products (id, seller_id, name, category, grade, price_per_kg, minimum_order_quantity, stock, location, image, specifications, delivery_time) VALUES
('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003', 'W320 Cashew Kernels', 'CASHEWS', 'W320', 850.00, 100, 500, 'Mangalore', 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=400', 'Premium quality W320 grade cashew kernels, 100% natural, 320 pieces per pound', '3-5 business days'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'W180 Cashew Kernels', 'CASHEWS', 'W180', 950.00, 50, 300, 'Panruti', 'https://images.pexels.com/photos/1630588/pexels-photo-1630588.jpeg?auto=compress&cs=tinysrgb&w=400', 'Premium quality W180 grade cashew kernels, 180 pieces per pound', '2-4 business days')
ON CONFLICT (id) DO NOTHING;

-- Insert sample queries
INSERT INTO queries (id, type, product_id, quantity, company_name, pincode, email, phone, status, assigned_to) VALUES
('770e8400-e29b-41d4-a716-446655440000', 'BUY', '660e8400-e29b-41d4-a716-446655440000', 100, 'ABC Foods Ltd', '560001', 'buyer@abcfoods.com', '+919876543210', 'ASSIGNED', '550e8400-e29b-41d4-a716-446655440001'),
('770e8400-e29b-41d4-a716-446655440001', 'SELL', '660e8400-e29b-41d4-a716-446655440001', 250, 'XYZ Cashews', '641001', 'seller@xyzcashews.com', '+919876543211', 'COMPLETED', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

-- Insert sample orders
INSERT INTO orders (id, order_number, buyer_id, seller_id, product_id, quantity, price_per_kg, total_amount, status, payment_status) VALUES
('880e8400-e29b-41d4-a716-446655440000', 'ORD-2024-001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440000', 100, 850.00, 85000.00, 'DELIVERED', 'PAID'),
('880e8400-e29b-41d4-a716-446655440001', 'ORD-2024-002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 50, 950.00, 47500.00, 'SHIPPED', 'PAID')
ON CONFLICT (order_number) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Company details policies
CREATE POLICY "Users can read own company details" ON company_details FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own company details" ON company_details FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own company details" ON company_details FOR UPDATE USING (auth.uid() = user_id);

-- Products policies
CREATE POLICY "Anyone can read active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Sellers can manage own products" ON products FOR ALL USING (auth.uid() = seller_id);

-- Queries policies
CREATE POLICY "Anyone can read queries" ON queries FOR SELECT TO authenticated;
CREATE POLICY "Anyone can create queries" ON queries FOR INSERT TO authenticated;
CREATE POLICY "Sales and admin can update queries" ON queries FOR UPDATE TO authenticated;

-- Orders policies
CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT TO authenticated;
CREATE POLICY "Sellers can update order status" ON orders FOR UPDATE USING (auth.uid() = seller_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;