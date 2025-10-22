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
  created_at: string;
  updated_at: string;
  is_admin?: boolean;
  last_login_at?: string;
  email_verified_at?: string;
  phone?: string;
  country?: string;
  timezone?: string;
  language?: string;
  preferences?: any;
  metadata?: any;
}

export interface Activity {
  id: string;
  user_id: string;
  type: string;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: any;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface AdminAnalytics {
  id: string;
  metric_name: string;
  metric_value: number;
  metadata?: any;
  created_at: string;
}

export interface AdBanner {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  link_url?: string;
  position: 'top' | 'bottom' | 'sidebar' | 'popup';
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  target_audience?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key_hash: string;
  permissions: string[];
  is_active: boolean;
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CodeInjection {
  id: string;
  name: string;
  code: string;
  location: 'head' | 'body_start' | 'body_end';
  is_active: boolean;
  target_pages?: string[];
  created_at: string;
  updated_at: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  is_enabled: boolean;
  target_users?: string[];
  rollout_percentage?: number;
  conditions?: any;
  created_at: string;
  updated_at: string;
}

export interface AdminSettings {
  id: string;
  key: string;
  value: any;
  description?: string;
  category: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
