import { createServerClient } from '@/lib/auth/supabase';

/**
 * Middleware helper to check if user has pro access
 * Returns true if user is admin OR has active pro subscription
 */
export async function hasProAccess(userId: string): Promise<boolean> {
  try {
    const supabase = await createServerClient();
    
    const { data: userData, error } = await supabase
      .from('users')
      .select('plan_name, subscription_status, is_admin')
      .eq('id', userId)
      .single();

    if (error || !userData) {
      return false;
    }

    // Admin users always have pro access
    if (userData.is_admin) {
      return true;
    }

    // Check for active pro subscription
    return (userData.plan_name === 'pro' || userData.plan_name === 'Pro') && 
           (userData.subscription_status === 'active' || userData.subscription_status === 'trialing');
  } catch (error) {
    console.error('Error checking pro access:', error);
    return false;
  }
}

