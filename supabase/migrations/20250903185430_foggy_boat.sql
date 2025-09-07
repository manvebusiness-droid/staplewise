/*
  # Add Demo Products for Seller Portal

  1. New Data
    - Add comprehensive demo products with all new fields
    - Include quality assurance and packaging delivery points
    - Cover different cashew grades and categories
    - Add realistic pricing and specifications

  2. Features
    - Products with grade descriptions
    - Quality assurance points (up to 5)
    - Packaging and delivery points (up to 5)
    - Proper seller assignment
*/

-- Insert demo products with new fields for the current seller
INSERT INTO products (
    id, 
    seller_id, 
    name, 
    category, 
    grade, 
    grade_description,
    quality_assurance,
    packaging_delivery,
    price_per_kg, 
    minimum_order_quantity, 
    stock, 
    location, 
    image, 
    specifications, 
    delivery_time
) VALUES 
(
    '660e8400-e29b-41d4-a716-446655440010',
    '12f4c405-55bd-4272-a557-87f61388e19e',
    'Premium W320 Cashew Kernels',
    'cashews',
    'W320',
    'Premium quality W320 grade cashew kernels with 320 pieces per pound. These are whole, unbroken kernels with natural white color and excellent taste. Perfect for direct consumption, confectionery, and premium food applications.',
    ARRAY['ISO 22000 certified facility', 'HACCP compliant processing', 'Regular third-party quality audits', 'Premium grade selection process', 'Food safety management system'],
    ARRAY['Vacuum sealed packaging', 'Express delivery available', 'Bulk packaging options', 'Temperature controlled shipping', 'Insurance coverage included'],
    850.00,
    100,
    1000,
    'Mangalore, Karnataka',
    'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Premium quality W320 grade cashew kernels with 320 pieces per pound',
    '3-5 business days'
),
(
    '660e8400-e29b-41d4-a716-446655440011',
    '12f4c405-55bd-4272-a557-87f61388e19e',
    'Super Premium W180 Cashew Kernels',
    'cashews',
    'W180',
    'Super premium W180 grade cashew kernels with only 180 pieces per pound. These are the largest size cashews available, perfect for premium gifting, luxury confectionery, and high-end culinary applications.',
    ARRAY['Organic certification', 'Hand-picked selection', 'Zero chemical processing', 'Premium export quality', 'Traceability system'],
    ARRAY['Premium gift packaging', 'Same day dispatch', 'Cold chain logistics', 'Eco-friendly packaging', 'Global shipping available'],
    1200.00,
    50,
    500,
    'Mangalore, Karnataka',
    'https://images.pexels.com/photos/1630588/pexels-photo-1630588.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Super premium W180 grade cashew kernels with only 180 pieces per pound',
    '2-4 business days'
),
(
    '660e8400-e29b-41d4-a716-446655440012',
    '12f4c405-55bd-4272-a557-87f61388e19e',
    'Commercial Grade LWP Cashew Pieces',
    'cashews',
    'LWP',
    'Large White Pieces (LWP) are broken cashew kernels ideal for commercial food processing, bakery applications, and industrial use. Excellent value for money with consistent quality and taste.',
    ARRAY['Food grade processing', 'Consistent piece size', 'Low moisture content', 'Regular quality testing', 'Bulk processing capability'],
    ARRAY['Industrial packaging', 'Bulk delivery options', 'Flexible payment terms', 'Quick turnaround time', 'Custom packaging available'],
    650.00,
    200,
    2000,
    'Mangalore, Karnataka',
    'https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Large White Pieces - Broken cashew kernels, excellent for processing',
    '1-3 business days'
),
(
    '660e8400-e29b-41d4-a716-446655440013',
    '12f4c405-55bd-4272-a557-87f61388e19e',
    'Export Quality W240 Cashew Kernels',
    'cashews',
    'W240',
    'Export quality W240 grade cashew kernels with 240 pieces per pound. These kernels meet international export standards and are perfect for global markets, premium retail, and high-quality food manufacturing.',
    ARRAY['Export quality standards', 'International certifications', 'Fumigation certificates', 'Quality documentation', 'Export packaging compliance'],
    ARRAY['Export standard packaging', 'Container loading facility', 'Documentation support', 'Port delivery available', 'Quality certificates included'],
    950.00,
    75,
    800,
    'Mangalore, Karnataka',
    'https://images.pexels.com/photos/4110257/pexels-photo-4110257.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Export quality W240 grade cashew kernels with 240 pieces per pound',
    '3-5 business days'
),
(
    '660e8400-e29b-41d4-a716-446655440014',
    '12f4c405-55bd-4272-a557-87f61388e19e',
    'Bakery Grade SWP Cashew Pieces',
    'cashews',
    'SWP',
    'Small White Pieces (SWP) are broken cashew kernels specifically processed for bakery and confectionery applications. Uniform size, excellent taste, and perfect for mixing into baked goods and sweets.',
    ARRAY['Bakery grade processing', 'Uniform piece size', 'Enhanced shelf life', 'Consistent quality', 'Food safety certified'],
    ARRAY['Bakery-friendly packaging', 'Moisture-proof bags', 'Quick delivery service', 'Flexible order quantities', 'Recipe support available'],
    580.00,
    150,
    1500,
    'Mangalore, Karnataka',
    'https://images.pexels.com/photos/4198020/pexels-photo-4198020.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Small White Pieces - Broken cashew kernels, ideal for bakery use',
    '2-4 business days'
)
ON CONFLICT (id) DO NOTHING;