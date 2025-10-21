import { createServerClient } from '@/lib/auth/supabase';

export interface UserAccess {
  hasProAccess: boolean;
  isAdmin: boolean;
  planName: string | null;
  subscriptionStatus: string | null;
}

/**
 * Check if a user has pro access (either through subscription or admin privileges)
 */
export async function checkUserProAccess(userId: string): Promise<UserAccess> {
  try {
    const supabase = await createServerClient();
    
    const { data: userData, error } = await supabase
      .from('users')
      .select('plan_name, subscription_status, is_admin')
      .eq('id', userId)
      .single();

    if (error || !userData) {
      return {
        hasProAccess: false,
        isAdmin: false,
        planName: null,
        subscriptionStatus: null,
      };
    }

    const isAdmin = userData.is_admin || false;
    const hasPaidSubscription = (userData.plan_name === 'pro' || userData.plan_name === 'Pro') && 
                                 (userData.subscription_status === 'active' || userData.subscription_status === 'trialing');
    
    return {
      hasProAccess: isAdmin || hasPaidSubscription, // Admin users get pro access
      isAdmin,
      planName: userData.plan_name,
      subscriptionStatus: userData.subscription_status,
    };
  } catch (error) {
    console.error('Error checking user pro access:', error);
    return {
      hasProAccess: false,
      isAdmin: false,
      planName: null,
      subscriptionStatus: null,
    };
  }
}

/**
 * Check if current authenticated user has pro access
 */
export async function getCurrentUserProAccess(): Promise<UserAccess> {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        hasProAccess: false,
        isAdmin: false,
        planName: null,
        subscriptionStatus: null,
      };
    }

    return await checkUserProAccess(user.id);
  } catch (error) {
    console.error('Error getting current user pro access:', error);
    return {
      hasProAccess: false,
      isAdmin: false,
      planName: null,
      subscriptionStatus: null,
    };
  }
}
