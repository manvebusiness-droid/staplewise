import { supabase } from './supabase';

// Add missing import
export { supabase } from './supabase';

export class CompanyDetailsService {
  static async getCompanyDetails(userId: string) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      console.log('🔄 Fetching company details for user:', userId);
      
      const { data, error } = await supabase
        .from('company_details')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          console.log('ℹ️ No company details found for user');
          return null;
        }
        throw error;
      }

      console.log('✅ Company details fetched successfully');
      return data;
    } catch (error) {
      console.error('❌ Error fetching company details:', error);
      throw error;
    }
  }

  static async createOrUpdateCompanyDetails(userId: string, companyData: any) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      console.log('🔄 Saving company details for user:', userId);
      
      const { data, error } = await supabase
        .from('company_details')
        .upsert({
          user_id: userId,
          ...companyData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Company details saved successfully');
      return data;
    } catch (error) {
      console.error('❌ Error saving company details:', error);
      throw error;
    }
  }
}

export class ProductService {
  static async getAllProducts(filters?: {
    grade?: string;
    location?: string;
    priceRange?: string;
    stockAvailable?: boolean;
    search?: string;
  }) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          users!products_seller_id_fkey (
            id,
            name,
            email,
            phone,
            company_name
          )
        `)
        .eq('is_active', true);

      if (filters?.grade) {
        query = query.eq('grade', filters.grade);
      }

      if (filters?.location) {
        query = query.eq('location', filters.location);
      }

      if (filters?.stockAvailable) {
        query = query.gt('stock', 0);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,specifications.ilike.%${filters.search}%`);
      }

      if (filters?.priceRange) {
        const [min, max] = filters.priceRange.split('-').map(Number);
        if (max) {
          query = query.gte('price_per_kg', min).lte('price_per_kg', max);
        } else {
          query = query.gte('price_per_kg', min);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  static async getProductById(productId: string) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          users!products_seller_id_fkey (
            id,
            name,
            company_name
          )
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  static async getProductsBySeller(sellerId: string) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching seller products:', error);
      throw error;
    }
  }

  static async createProduct(productData: any) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  static async updateProduct(productId: string, productData: any) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...productData,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  static async deleteProduct(productId: string) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  static async getAllProductsPriceHistory(sellerId: string, days: number = 30) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      const { data, error } = await supabase
        .rpc('get_seller_price_history', {
          p_seller_id: sellerId,
          p_days: days
        });

      if (error) throw error;

      // Group by product_id
      const priceHistoryMap: { [key: string]: any[] } = {};
      (data || []).forEach((entry: any) => {
        if (!priceHistoryMap[entry.product_id]) {
          priceHistoryMap[entry.product_id] = [];
        }
        priceHistoryMap[entry.product_id].push({
          date: entry.date,
          price: entry.price
        });
      });

      return priceHistoryMap;
    } catch (error) {
      console.error('Error fetching price history:', error);
      return {};
    }
  }
}

export class QueryService {
  static async getAllQueries() {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      const { data, error } = await supabase
        .from('queries')
        .select(`
          *,
          products (
            id,
            name,
            grade
          ),
          assigned_user:users!queries_assigned_to_fkey (
            id,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching queries:', error);
      throw error;
    }
  }

  static async getQueriesAssignedToUser(userId: string) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      const { data, error } = await supabase
        .from('queries')
        .select(`
          *,
          products (
            id,
            name,
            grade
          )
        `)
        .eq('assigned_to', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching assigned queries:', error);
      throw error;
    }
  }

  static async assignQuery(queryId: string, employeeId: string) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      const { data, error } = await supabase
        .from('queries')
        .update({
          assigned_to: employeeId,
          status: 'ASSIGNED',
          updated_at: new Date().toISOString()
        })
        .eq('id', queryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error assigning query:', error);
      throw error;
    }
  }

  static async createQuery(queryData: any) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      const { data, error } = await supabase
        .from('queries')
        .insert(queryData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating query:', error);
      throw error;
    }
  }

  static async updateQueryStatus(queryId: string, status: string) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      const { data, error } = await supabase
        .from('queries')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', queryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating query status:', error);
      throw error;
    }
  }

  static async deleteQuery(queryId: string) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      const { error } = await supabase
        .from('queries')
        .delete()
        .eq('id', queryId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting query:', error);
      throw error;
    }
  }
}

export class OrderService {
  static async getAllOrders() {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products (
            id,
            name,
            grade,
            image
          ),
          buyer:users!orders_buyer_id_fkey (
            id,
            name,
            email,
            company_name,
            phone
          ),
          seller:users!orders_seller_id_fkey (
            id,
            name,
            email,
            company_name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Flatten related fields for UI compatibility
      const mapped = (data || []).map((o: any) => ({
        ...o,
        seller_name: o.seller?.name || null,
        seller_email: o.seller?.email || null,
        seller_phone: o.seller?.phone || null,
        seller_company: o.seller?.company_name || null,
        buyer_name: o.buyer?.name || null,
        buyer_email: o.buyer?.email || null,
        buyer_company: o.buyer?.company_name || null,
        buyer_phone: o.buyer?.phone || null,
        products: o.products || null
      }));
      return mapped;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  static async getOrdersBySeller(sellerId: string) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products (
            id,
            name,
            grade,
            image
          ),
          buyer:users!orders_buyer_id_fkey (
            id,
            name,
            email,
            company_name,
            phone
          )
        `)
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const mapped = (data || []).map((o: any) => ({
        ...o,
        buyer_name: o.buyer?.name || null,
        buyer_email: o.buyer?.email || null,
        buyer_company: o.buyer?.company_name || null,
        buyer_phone: o.buyer?.phone || null,
        products: o.products || null
      }));
      return mapped;
    } catch (error) {
      console.error('Error fetching seller orders:', error);
      throw error;
    }
  }

  static async createOrder(orderData: any) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      console.log('🔄 Creating order with data:', orderData);
      
      // Generate order number if not provided
      if (!orderData.order_number) {
        orderData.order_number = `ORD-${Date.now()}`;
      }
      
      // Ensure all required fields are present
      const requiredFields = ['order_number', 'buyer_id', 'seller_id', 'quantity', 'price_per_kg', 'total_amount'];
      for (const field of requiredFields) {
        if (!orderData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      console.log('✅ All required fields present, creating order...');

      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) {
        console.error('❌ Order creation error:', error);
        throw new Error(`Order creation failed: ${error.message}`);
      }
      
      console.log('✅ Order created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  static async updateOrder(orderId: string, orderData: any) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          ...orderData,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  static async updateOrderStatus(orderId: string, status: string) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  static async deleteOrder(orderId: string) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      console.log('🔄 Deleting order:', orderId);
      
      // Try to delete the order directly
      const { data: deletedData, error: deleteError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId)
        .select(); // Return the deleted rows to verify deletion

      console.log('🔍 Delete operation result:', { deletedData, deleteError });

      if (deleteError) {
        console.error('❌ Order deletion error:', deleteError);
        throw new Error(`Delete failed: ${deleteError.message} (Code: ${deleteError.code})`);
      }
      
      // Check if any rows were actually deleted
      if (!deletedData || deletedData.length === 0) {
        console.error('❌ No rows were deleted - order might not exist or RLS policy blocking deletion');
        
        // Check if order still exists
        const { data: stillExists, error: checkError } = await supabase
          .from('orders')
          .select('id, order_number, status')
          .eq('id', orderId)
          .single();
        
        if (stillExists) {
          console.error('❌ Order still exists after deletion attempt:', stillExists);
          throw new Error('Order deletion failed - order still exists in database. This might be a permissions issue.');
        } else if (checkError && checkError.code !== 'PGRST116') {
          console.error('❌ Error checking order existence:', checkError);
          throw new Error(`Error verifying deletion: ${checkError.message}`);
        } else {
          console.log('✅ Order was already deleted or does not exist');
        }
      } else {
        console.log('✅ Order deleted successfully, rows affected:', deletedData.length);
      }

      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }
}

export class UserService {
  static async getAllUsers() {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          company_details (
            gstin
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  static async getUsersByRole(role: string) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', role)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  }

  static async createSalesEmployee(employeeData: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      console.log('🔄 Creating sales employee account:', employeeData.email);
      
      // 1. Create auth user with regular signup (not admin API)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: employeeData.email,
        password: employeeData.password,
        options: {
          emailRedirectTo: undefined,
          data: {
            name: employeeData.name,
            phone: employeeData.phone,
            role: 'SALES'
          }
        }
      });

      if (authError) {
        console.error('❌ Auth user creation failed:', authError);
        throw new Error(`Failed to create auth user: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Failed to create auth user - no user returned');
      }

      console.log('✅ Auth user created successfully');

      // 2. Auto-confirm the email (since we can't use admin API)
      // Note: In production, you might want to handle email confirmation differently
      const { error: confirmError } = await supabase.auth.updateUser({
        email_confirm: true
      });

      if (confirmError) {
        console.warn('⚠️ Could not auto-confirm email:', confirmError.message);
        // Continue anyway - user can confirm email manually
      }

      // 3. Wait a moment for the auth user to be fully created
      await new Promise(resolve => setTimeout(resolve, 100));

      // 4. Create user profile in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: employeeData.email,
          name: employeeData.name,
          phone: employeeData.phone,
          role: 'SALES',
          company_name: 'StapleWise Sales',
          is_active: true
        })
        .select()
        .single();

      if (userError) {
        console.error('❌ User profile creation failed:', userError);
        // Note: Cannot clean up auth user without admin API
        console.warn('⚠️ Auth user created but profile creation failed. User may need manual cleanup.');
        throw new Error(`Failed to create user profile: ${userError.message}`);
      }

      console.log('✅ Sales employee created successfully:', userData);
      return userData;
    } catch (error) {
      console.error('❌ Error creating sales employee:', error);
      throw error;
    }
  }

  static async updateUser(userId: string, userData: {
    name: string;
    email: string;
    phone: string;
  }) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      console.log('🔄 Updating user:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .update({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ User update failed:', error);
        throw new Error(`Failed to update user: ${error.message}`);
      }

      console.log('✅ User updated successfully');
      return data;
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }
  }

  static async deleteUser(userId: string) {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      console.log('🔄 Deleting user:', userId);
      
      // First, delete from users table
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (deleteError) {
        console.error('❌ User deletion failed:', deleteError);
        throw new Error(`Failed to delete user: ${deleteError.message}`);
      }

      console.log('✅ User deleted successfully from database');
      
      // Note: We cannot delete from Supabase Auth without admin API
      // The auth user will remain but won't be able to login since profile is deleted
      console.log('ℹ️ Auth user remains in Supabase Auth but profile deleted');
      
      return true;
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }
  }
}

export class DashboardService {
  static async getAdminStats() {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      const [usersData, productsData, queriesData, ordersData] = await Promise.all([
        supabase.from('users').select('id'),
        supabase.from('products').select('id'),
        supabase.from('queries').select('id'),
        supabase.from('orders').select('id')
      ]);

      return {
        totalVisitors: 12345, // Mock data for visitors
        totalProducts: productsData.data?.length || 0,
        totalQueries: queriesData.data?.length || 0,
        totalUsers: usersData.data?.length || 0
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return {
        totalVisitors: 0,
        totalProducts: 0,
        totalQueries: 0,
        totalUsers: 0
      };
    }
  }

  static async getSalesStats() {
    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      const { data, error } = await supabase
        .from('queries')
        .select('status');

      if (error) throw error;

      const queries = data || [];
      return {
        assignedQueries: queries.filter(q => q.status === 'ASSIGNED' || q.status === 'PENDING').length,
        completedQueries: queries.filter(q => q.status === 'COMPLETED').length,
        pendingQueries: queries.filter(q => q.status === 'PENDING').length,
        recentQueries: queries.slice(0, 5)
      };
    } catch (error) {
      console.error('Error fetching sales stats:', error);
      return {
        assignedQueries: 0,
        completedQueries: 0,
        pendingQueries: 0,
        recentQueries: []
      };
    }
  }
}