-- Sprint 5: Admin Dashboard & Advanced Features
-- Migration: 003_admin_features.sql

-- Add admin role and permissions to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_permissions JSONB DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Create admin_settings table for configuration
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feature_flags table
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name VARCHAR(100) NOT NULL UNIQUE,
  is_enabled BOOLEAN DEFAULT FALSE,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_user_groups JSONB DEFAULT '[]',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_analytics table for tracking
CREATE TABLE IF NOT EXISTS admin_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(100) NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- 'count', 'revenue', 'percentage', 'duration'
  date_recorded DATE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
  priority VARCHAR(10) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  assigned_to UUID REFERENCES users(id),
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create api_keys table for Pro users
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  key_name VARCHAR(255) NOT NULL,
  api_key VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create social_presets table for unlimited presets
CREATE TABLE IF NOT EXISTS social_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  preset_name VARCHAR(255) NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  quality INTEGER DEFAULT 90,
  format VARCHAR(10) DEFAULT 'jpeg',
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);
CREATE INDEX IF NOT EXISTS idx_admin_settings_setting_key ON admin_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_flag_name ON feature_flags(flag_name);
CREATE INDEX IF NOT EXISTS idx_feature_flags_is_enabled ON feature_flags(is_enabled);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_metric_name ON admin_analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_admin_analytics_date_recorded ON admin_analytics(date_recorded);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_social_presets_user_id ON social_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_social_presets_platform ON social_presets(platform);
CREATE INDEX IF NOT EXISTS idx_social_presets_is_public ON social_presets(is_public);

-- Enable Row Level Security (RLS)
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_presets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin_settings (admin only)
CREATE POLICY "Admins can view admin settings" ON admin_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can manage admin settings" ON admin_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Create RLS policies for feature_flags (admin only)
CREATE POLICY "Admins can view feature flags" ON feature_flags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can manage feature flags" ON feature_flags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Create RLS policies for admin_analytics (admin only)
CREATE POLICY "Admins can view admin analytics" ON admin_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can manage admin analytics" ON admin_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Create RLS policies for support_tickets
CREATE POLICY "Users can view own support tickets" ON support_tickets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create support tickets" ON support_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own support tickets" ON support_tickets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all support tickets" ON support_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can manage support tickets" ON support_tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Create RLS policies for api_keys
CREATE POLICY "Users can view own api keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own api keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own api keys" ON api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own api keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for social_presets
CREATE POLICY "Users can view own social presets" ON social_presets
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own social presets" ON social_presets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social presets" ON social_presets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social presets" ON social_presets
  FOR DELETE USING (auth.uid() = user_id);

-- Service role policies for all tables
CREATE POLICY "Service role full access admin_settings" ON admin_settings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access feature_flags" ON feature_flags
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access admin_analytics" ON admin_analytics
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access support_tickets" ON support_tickets
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access api_keys" ON api_keys
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access social_presets" ON social_presets
  FOR ALL USING (auth.role() = 'service_role');

-- Create triggers for updated_at
CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_presets_updated_at BEFORE UPDATE ON social_presets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = p_user_id 
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to get admin analytics
CREATE OR REPLACE FUNCTION get_admin_analytics(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  metric_name VARCHAR(100),
  metric_value NUMERIC,
  metric_type VARCHAR(50),
  date_recorded DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    aa.metric_name,
    aa.metric_value,
    aa.metric_type,
    aa.date_recorded
  FROM admin_analytics aa
  WHERE aa.date_recorded BETWEEN p_start_date AND p_end_date
  ORDER BY aa.date_recorded DESC, aa.metric_name;
END;
$$ LANGUAGE plpgsql;

-- Create function to track admin metrics
CREATE OR REPLACE FUNCTION track_admin_metric(
  p_metric_name VARCHAR(100),
  p_metric_value NUMERIC,
  p_metric_type VARCHAR(50),
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO admin_analytics (metric_name, metric_value, metric_type, date_recorded, metadata)
  VALUES (p_metric_name, p_metric_value, p_metric_type, CURRENT_DATE, p_metadata);
END;
$$ LANGUAGE plpgsql;

-- Insert default admin settings
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
('app_name', '"ResizeSuite"', 'Application name'),
('app_description', '"Professional Image Tools That Work Instantly"', 'Application description'),
('max_free_images', '5', 'Maximum images for free users'),
('max_pro_images', '100', 'Maximum images for pro users'),
('max_free_file_size', '10485760', 'Maximum file size for free users (bytes)'),
('max_pro_file_size', '52428800', 'Maximum file size for pro users (bytes)'),
('pro_monthly_price', '9.99', 'Pro monthly subscription price'),
('pro_yearly_price', '99.99', 'Pro yearly subscription price'),
('trial_days', '14', 'Number of trial days'),
('maintenance_mode', 'false', 'Enable maintenance mode'),
('registration_enabled', 'true', 'Allow new user registrations'),
('email_notifications', 'true', 'Enable email notifications')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default feature flags
INSERT INTO feature_flags (flag_name, is_enabled, rollout_percentage, description) VALUES
('unlimited_social_presets', true, 100, 'Enable unlimited social presets for Pro users'),
('advanced_compression', true, 100, 'Enable advanced compression algorithms'),
('api_access', true, 100, 'Enable API access for Pro users'),
('watermark_templates', true, 100, 'Enable watermark templates'),
('project_management', true, 100, 'Enable project management features'),
('batch_processing', true, 100, 'Enable batch processing'),
('priority_queue', true, 100, 'Enable priority processing queue'),
('zip_downloads', true, 100, 'Enable ZIP file downloads'),
('custom_naming', true, 100, 'Enable custom file naming'),
('folder_upload', true, 100, 'Enable folder upload functionality')
ON CONFLICT (flag_name) DO NOTHING;

-- Create ad_banners table for managing ad banners
CREATE TABLE IF NOT EXISTS ad_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_name VARCHAR(255) NOT NULL,
  banner_type VARCHAR(50) NOT NULL, -- 'image', 'code', 'google_adsense'
  banner_content TEXT, -- HTML code or image URL
  banner_position VARCHAR(50) NOT NULL, -- 'header', 'sidebar', 'footer', 'between_content'
  is_active BOOLEAN DEFAULT TRUE,
  display_pages JSONB DEFAULT '[]', -- Array of page paths where banner should show
  click_url VARCHAR(500),
  alt_text VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create code_injections table for custom scripts
CREATE TABLE IF NOT EXISTS code_injections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  injection_name VARCHAR(255) NOT NULL,
  injection_type VARCHAR(50) NOT NULL, -- 'head', 'body_start', 'body_end', 'analytics'
  injection_code TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  target_pages JSONB DEFAULT '[]', -- Array of page paths where code should inject
  priority INTEGER DEFAULT 0, -- Higher priority injects first
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for ad banners and code injections
CREATE INDEX IF NOT EXISTS idx_ad_banners_banner_type ON ad_banners(banner_type);
CREATE INDEX IF NOT EXISTS idx_ad_banners_banner_position ON ad_banners(banner_position);
CREATE INDEX IF NOT EXISTS idx_ad_banners_is_active ON ad_banners(is_active);
CREATE INDEX IF NOT EXISTS idx_code_injections_injection_type ON code_injections(injection_type);
CREATE INDEX IF NOT EXISTS idx_code_injections_is_active ON code_injections(is_active);
CREATE INDEX IF NOT EXISTS idx_code_injections_priority ON code_injections(priority);

-- Enable RLS for new tables
ALTER TABLE ad_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_injections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ad_banners (admin only)
CREATE POLICY "Admins can view ad banners" ON ad_banners
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can manage ad banners" ON ad_banners
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Create RLS policies for code_injections (admin only)
CREATE POLICY "Admins can view code injections" ON code_injections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can manage code injections" ON code_injections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Service role policies
CREATE POLICY "Service role full access ad_banners" ON ad_banners
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access code_injections" ON code_injections
  FOR ALL USING (auth.role() = 'service_role');

-- Create triggers for updated_at
CREATE TRIGGER update_ad_banners_updated_at BEFORE UPDATE ON ad_banners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_code_injections_updated_at BEFORE UPDATE ON code_injections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default social presets
INSERT INTO social_presets (platform, preset_name, width, height, quality, format, is_public) VALUES
('instagram', 'Instagram Post', 1080, 1080, 90, 'jpeg', true),
('instagram', 'Instagram Story', 1080, 1920, 90, 'jpeg', true),
('instagram', 'Instagram Reel', 1080, 1920, 90, 'jpeg', true),
('facebook', 'Facebook Post', 1200, 630, 90, 'jpeg', true),
('facebook', 'Facebook Cover', 1200, 315, 90, 'jpeg', true),
('twitter', 'Twitter Post', 1200, 675, 90, 'jpeg', true),
('twitter', 'Twitter Header', 1500, 500, 90, 'jpeg', true),
('linkedin', 'LinkedIn Post', 1200, 627, 90, 'jpeg', true),
('linkedin', 'LinkedIn Cover', 1584, 396, 90, 'jpeg', true),
('youtube', 'YouTube Thumbnail', 1280, 720, 90, 'jpeg', true),
('pinterest', 'Pinterest Pin', 1000, 1500, 90, 'jpeg', true),
('tiktok', 'TikTok Video', 1080, 1920, 90, 'jpeg', true)
ON CONFLICT DO NOTHING;
