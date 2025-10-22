import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/database';
import { createServerClient } from '@/lib/auth/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
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

    // Get recent activities from multiple sources
    const activities: Array<{
      id: string;
      user: string;
      action: string;
      timestamp: string;
      type: string;
    }> = [];

    // Get recent user registrations
    const { data: recentUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('email, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!usersError && recentUsers) {
      recentUsers.forEach(user => {
        activities.push({
          id: `user-${user.email}`,
          user: user.email,
          action: 'Registered',
          timestamp: formatTimeAgo(user.created_at),
          type: 'user',
        });
      });
    }

    // Get recent subscription changes from admin_analytics
    const { data: recentSubscriptions, error: subsError } = await supabaseAdmin
      .from('admin_analytics')
      .select('metric_name, metadata, created_at')
      .in('metric_name', ['subscription_updated', 'subscription_removed'])
      .order('created_at', { ascending: false })
      .limit(5);

    if (!subsError && recentSubscriptions) {
      recentSubscriptions.forEach(sub => {
        const userEmail = sub.metadata?.user_id ? 'User' : 'Unknown';
        const action = sub.metric_name === 'subscription_updated' ? 'Updated subscription' : 'Removed subscription';
        activities.push({
          id: `sub-${sub.created_at}`,
          user: userEmail,
          action,
          timestamp: formatTimeAgo(sub.created_at),
          type: 'payment',
        });
      });
    }

    // Get recent support tickets
    const { data: recentTickets, error: ticketsError } = await supabaseAdmin
      .from('support_tickets')
      .select('subject, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (!ticketsError && recentTickets) {
      recentTickets.forEach(ticket => {
        activities.push({
          id: `ticket-${ticket.created_at}`,
          user: 'Support',
          action: `New ticket: ${ticket.subject}`,
          timestamp: formatTimeAgo(ticket.created_at),
          type: 'support',
        });
      });
    }

    // Sort activities by timestamp (most recent first)
    activities.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });

    // Return only the 10 most recent activities
    return NextResponse.json({
      activities: activities.slice(0, 10)
    });

  } catch (error) {
    console.error('Error in GET /api/admin/analytics/recent-activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}
