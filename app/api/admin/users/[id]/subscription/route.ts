import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/database';
import { createServerClient } from '@/lib/auth/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verify admin access
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

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

    const body = await request.json();
    const { plan_name, subscription_status, expires_at } = body;

    // Validate input
    if (!plan_name || !subscription_status) {
      return NextResponse.json({ 
        error: 'plan_name and subscription_status are required' 
      }, { status: 400 });
    }

    // Update user subscription
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        plan_name,
        subscription_status,
        subscription_expires_at: expires_at || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user subscription:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update subscription' 
      }, { status: 500 });
    }

    // Log the admin action
    try {
      await supabaseAdmin
        .from('admin_analytics')
        .insert({
          metric_name: 'subscription_updated',
          metric_value: 1,
          metric_type: 'count',
          date_recorded: new Date().toISOString().split('T')[0],
          metadata: {
            admin_id: user.id,
            user_id: id,
            plan_name,
            subscription_status,
            action: 'admin_subscription_update'
          }
        });
    } catch (logError) {
      console.warn('Failed to log admin action:', logError);
    }

    return NextResponse.json({
      message: 'Subscription updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error in POST /api/admin/users/[id]/subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verify admin access
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

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

    // Remove subscription (set to free)
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        plan_name: 'free',
        subscription_status: 'inactive',
        subscription_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error removing user subscription:', updateError);
      return NextResponse.json({ 
        error: 'Failed to remove subscription' 
      }, { status: 500 });
    }

    // Log the admin action
    try {
      await supabaseAdmin
        .from('admin_analytics')
        .insert({
          metric_name: 'subscription_removed',
          metric_value: 1,
          metric_type: 'count',
          date_recorded: new Date().toISOString().split('T')[0],
          metadata: {
            admin_id: user.id,
            user_id: id,
            action: 'admin_subscription_removal'
          }
        });
    } catch (logError) {
      console.warn('Failed to log admin action:', logError);
    }

    return NextResponse.json({
      message: 'Subscription removed successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error in DELETE /api/admin/users/[id]/subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
