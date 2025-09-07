import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not configured');
  console.warn('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
  console.warn('The app will use mock authentication as fallback');
}

// Create Supabase client with proper configuration
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}) : null;


// Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string;
          role: 'ADMIN' | 'SALES' | 'BUYER' | 'SELLER';
          company_name?: string;
          gst?: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          phone: string;
          role?: 'ADMIN' | 'SALES' | 'BUYER' | 'SELLER';
          company_name?: string;
          gst?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          phone?: string;
          role?: 'ADMIN' | 'SALES' | 'BUYER' | 'SELLER';
          company_name?: string;
          gst?: string;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          seller_id: string;
          name: string;
          category: string;
          grade: string;
          price_per_kg: number;
          minimum_order_quantity: number;
          stock: number;
          location: string;
          image: string;
          specifications: string;
          delivery_time: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          name: string;
          category: string;
          grade: string;
          price_per_kg: number;
          minimum_order_quantity: number;
          stock: number;
          location: string;
          image: string;
          specifications: string;
          delivery_time: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          name?: string;
          category?: string;
          grade?: string;
          price_per_kg?: number;
          minimum_order_quantity?: number;
          stock?: number;
          location?: string;
          image?: string;
          specifications?: string;
          delivery_time?: string;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      queries: {
        Row: {
          id: string;
          type: 'BUY' | 'SELL';
          product_id?: string;
          quantity: number;
          company_name: string;
          pincode: string;
          email: string;
          phone: string;
          gst?: string;
          status: 'PENDING' | 'ASSIGNED' | 'COMPLETED' | 'REJECTED';
          assigned_to?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: 'BUY' | 'SELL';
          product_id?: string;
          quantity: number;
          company_name: string;
          pincode: string;
          email: string;
          phone: string;
          gst?: string;
          status?: 'PENDING' | 'ASSIGNED' | 'COMPLETED' | 'REJECTED';
          assigned_to?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: 'BUY' | 'SELL';
          product_id?: string;
          quantity?: number;
          company_name?: string;
          pincode?: string;
          email?: string;
          phone?: string;
          gst?: string;
          status?: 'PENDING' | 'ASSIGNED' | 'COMPLETED' | 'REJECTED';
          assigned_to?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          buyer_id: string;
          seller_id: string;
          product_id: string;
          quantity: number;
          price_per_kg: number;
          total_amount: number;
          status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
          payment_status: 'PENDING' | 'PAID' | 'FAILED';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          buyer_id: string;
          seller_id: string;
          product_id: string;
          quantity: number;
          price_per_kg: number;
          total_amount: number;
          status?: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
          payment_status?: 'PENDING' | 'PAID' | 'FAILED';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          buyer_id?: string;
          seller_id?: string;
          product_id?: string;
          quantity?: number;
          price_per_kg?: number;
          total_amount?: number;
          status?: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
          payment_status?: 'PENDING' | 'PAID' | 'FAILED';
          updated_at?: string;
        };
      };
      company_details: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          city: string;
          address_street1: string;
          address_street2?: string;
          address_pincode: string;
          address_state: string;
          registrar_name: string;
          gstin: string;
          year_established: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          city: string;
          address_street1: string;
          address_street2?: string;
          };
      }
    }
  }
}