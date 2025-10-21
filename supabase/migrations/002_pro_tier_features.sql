-- Sprint 4: Pro Tier Features & Payment Integration
-- Migration: 002_pro_tier_features.sql

-- Add new columns to users table for enhanced Pro features
ALTER TABLE users ADD COLUMN IF NOT EXISTS usage_stats JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS feature_usage JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_trial_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end BOOLEAN DEFAULT FALSE;

-- Create projects table for Pro users
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tool_type VARCHAR(50) NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  files_metadata JSONB DEFAULT '[]',
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  feature_name VARCHAR(100) NOT NULL,
  usage_count INTEGER DEFAULT 1,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment history table
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount INTEGER NOT NULL, -- Amount in cents
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create watermark templates table
CREATE TABLE IF NOT EXISTS watermark_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_tool_type ON projects(tool_type);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_feature_name ON usage_tracking(feature_name);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_last_used ON usage_tracking(last_used);
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_stripe_payment_intent_id ON payment_history(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_watermark_templates_user_id ON watermark_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_watermark_templates_is_public ON watermark_templates(is_public);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE watermark_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for usage tracking
CREATE POLICY "Users can view own usage tracking" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own usage tracking" ON usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage tracking" ON usage_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for payment history
CREATE POLICY "Users can view own payment history" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payment history" ON payment_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for watermark templates
CREATE POLICY "Users can view own watermark templates" ON watermark_templates
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own watermark templates" ON watermark_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watermark templates" ON watermark_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watermark templates" ON watermark_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Service role policies for all tables
CREATE POLICY "Service role full access projects" ON projects
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access usage_tracking" ON usage_tracking
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access payment_history" ON payment_history
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access watermark_templates" ON watermark_templates
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON usage_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watermark_templates_updated_at BEFORE UPDATE ON watermark_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to track feature usage
CREATE OR REPLACE FUNCTION track_feature_usage(
  p_user_id UUID,
  p_feature_name VARCHAR(100),
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO usage_tracking (user_id, feature_name, metadata)
  VALUES (p_user_id, p_feature_name, p_metadata)
  ON CONFLICT (user_id, feature_name) 
  DO UPDATE SET 
    usage_count = usage_tracking.usage_count + 1,
    last_used = NOW(),
    metadata = p_metadata,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to get user plan limits
CREATE OR REPLACE FUNCTION get_user_plan_limits(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  user_plan VARCHAR(50);
  limits JSONB;
BEGIN
  SELECT plan_name INTO user_plan FROM users WHERE id = p_user_id;
  
  IF user_plan = 'pro' OR user_plan = 'Pro' THEN
    limits := '{
      "maxImages": 100,
      "maxFileSize": 52428800,
      "enableFolderUpload": true,
      "enablePriorityQueue": true,
      "enableCustomNaming": true,
      "enableZIPDownload": true,
      "enableProjectManagement": true,
      "enableWatermarkTemplates": true
    }';
  ELSE
    limits := '{
      "maxImages": 5,
      "maxFileSize": 10485760,
      "enableFolderUpload": false,
      "enablePriorityQueue": false,
      "enableCustomNaming": false,
      "enableZIPDownload": false,
      "enableProjectManagement": false,
      "enableWatermarkTemplates": false
    }';
  END IF;
  
  RETURN limits;
END;
$$ LANGUAGE plpgsql;

-- Insert some default watermark templates
INSERT INTO watermark_templates (name, description, template_data, is_public) VALUES
('Copyright Text', 'Simple copyright watermark', '{"type": "text", "text": "© 2024", "position": "bottom-right", "opacity": 0.7, "fontSize": 16, "color": "#FFFFFF"}', true),
('Brand Logo', 'Professional brand watermark', '{"type": "text", "text": "Your Brand", "position": "bottom-left", "opacity": 0.8, "fontSize": 20, "color": "#000000"}', true),
('Website URL', 'Website promotion watermark', '{"type": "text", "text": "www.yoursite.com", "position": "top-right", "opacity": 0.6, "fontSize": 14, "color": "#666666"}', true)
ON CONFLICT DO NOTHING;
