import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is admin
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (adminError || !adminData?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Try to query the subscription_expires_at column
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('subscription_expires_at')
      .limit(1);

    if (error && error.message.includes('subscription_expires_at')) {
      return NextResponse.json({ 
        error: 'Column subscription_expires_at does not exist. Please run the migration: supabase/migrations/004_add_subscription_expires_at.sql',
        needsMigration: true
      }, { status: 400 });
    } else if (error) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Column subscription_expires_at exists',
      exists: true
    });

  } catch (error) {
    console.error('Error checking subscription_expires_at column:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
