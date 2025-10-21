import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_product_id?: string;
  plan_name?: string;
  subscription_status?: string;
  subscription_expires_at?: string;
  role?: string;
  is_admin?: boolean;
  admin_permissions?: string[];
  last_login?: string;
  login_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: number;
  user_id: string;
  action: string;
  timestamp: string;
  ip_address?: string;
}

// Database operations
export class DatabaseService {
  // User operations
  static async getUser(userId: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    
    return data;
  }

  static async createUser(user: Partial<User>): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      return null;
    }
    
    return data;
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return null;
    }
    
    return data;
  }

  // Activity log operations
  static async logActivity(userId: string, action: string, ipAddress?: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('activity_logs')
      .insert({
        user_id: userId,
        action,
        ip_address: ipAddress || null
      });
    
    if (error) {
      console.error('Error logging activity:', error);
    }
  }

  static async getActivityLogs(userId: string, limit = 10): Promise<ActivityLog[]> {
    const { data, error } = await supabaseAdmin
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching activity logs:', error);
      return [];
    }
    
    return data || [];
  }
}
