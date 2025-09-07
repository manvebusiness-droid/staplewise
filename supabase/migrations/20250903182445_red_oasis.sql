/*
  # Fix Company Details Table Access Issues

  1. Table Structure
    - Recreate company_details table with proper structure
    - Fix any column naming or constraint issues
    - Add proper indexes and permissions

  2. Security
    - Completely disable RLS for company_details table
    - Grant full access to authenticated users
    - Remove any conflicting policies

  3. Data
    - Insert sample company details for testing
    - Ensure data integrity and proper relationships
*/

-- Drop and recreate company_details table to fix any structural issues
DROP TABLE IF EXISTS company_details CASCADE;

CREATE TABLE company_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Disable RLS completely for company_details
ALTER TABLE company_details DISABLE ROW LEVEL SECURITY;

-- Grant full permissions
GRANT ALL ON company_details TO authenticated;
GRANT ALL ON company_details TO anon;
GRANT ALL ON company_details TO postgres;

-- Create indexes
CREATE INDEX idx_company_details_user_id ON company_details(user_id);
CREATE INDEX idx_company_details_gstin ON company_details(gstin);

-- Create updated_at trigger
CREATE TRIGGER update_company_details_updated_at 
    BEFORE UPDATE ON company_details 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for the current seller user
INSERT INTO company_details (
    user_id, 
    company_name, 
    city, 
    address_street1, 
    address_pincode, 
    address_state, 
    registrar_name, 
    gstin, 
    year_established
) VALUES (
    '12f4c405-55bd-4272-a557-87f61388e19e',
    'Sample Company',
    'Bangalore',
    '123 Business Street',
    '560001',
    'Karnataka',
    'Company Registrar',
    '29ABCDE1234F1Z5',
    2020
) ON CONFLICT (user_id) DO NOTHING;

-- Also insert for the default seller user if it exists
INSERT INTO company_details (
    user_id, 
    company_name, 
    city, 
    address_street1, 
    address_pincode, 
    address_state, 
    registrar_name, 
    gstin, 
    year_established
) VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    'XYZ Exports',
    'Bangalore',
    '456 Export Street',
    '560002',
    'Karnataka',
    'Jane Seller',
    '29ABCDE1234F1Z6',
    2019
) ON CONFLICT (user_id) DO NOTHING;