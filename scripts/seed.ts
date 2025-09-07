import { SupabaseAuthService } from '../src/lib/supabaseAuth';
import { Role } from '../src/types';

async function main() {
  console.log('🌱 Starting database seed with Supabase authentication...');

  try {
    // Create admin user
    const adminUser = await SupabaseAuthService.register({
      email: 'admin@staplewise.com',
      password: 'password123',
      name: 'Admin User',
      phone: '+919876543210',
      role: Role.ADMIN,
      companyName: 'StapleWise Admin',
    });
    console.log('✅ Created admin user');

    // Create sales user
    const salesUser = await SupabaseAuthService.register({
      email: 'sales@staplewise.com',
      password: 'password123',
      name: 'Sales Employee',
      phone: '+919876543211',
      role: Role.SALES,
      companyName: 'StapleWise Sales',
    });
    console.log('✅ Created sales user');

    // Create sample buyer
    const buyerUser = await SupabaseAuthService.register({
      email: 'buyer@example.com',
      password: 'password123',
      name: 'John Buyer',
      phone: '+919876543212',
      role: Role.BUYER,
      companyName: 'ABC Foods',
    });
    console.log('✅ Created buyer user');

    // Create sample seller
    const sellerUser = await SupabaseAuthService.register({
      email: 'seller@example.com',
      password: 'password123',
      name: 'Jane Seller',
      phone: '+919876543213',
      role: Role.SELLER,
      companyName: 'XYZ Cashews',
      gst: 'GST123456789',
    });
    console.log('✅ Created seller user');

    console.log('🎉 Database seeded successfully with Supabase authentication!');
    console.log('\n📋 Demo User Credentials:');
    console.log('Admin:  admin@staplewise.com  / password123');
    console.log('Sales:  sales@staplewise.com  / password123');
    console.log('Buyer:  buyer@example.com     / password123');
    console.log('Seller: seller@example.com    / password123');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed script error:', e);
    process.exit(1);
  });