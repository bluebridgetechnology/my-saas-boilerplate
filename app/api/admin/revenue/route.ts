import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get user data to calculate revenue metrics
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, plan_name, subscription_status, created_at')
      .gte('created_at', startDate.toISOString());

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    // Calculate revenue based on pro users (since subscriptions table doesn't exist)
    const proUsers = users?.filter(user => 
      user.plan_name === 'pro' || user.subscription_status === 'active'
    ).length || 0;

    // Mock pricing: $9.99/month for pro users
    const monthlyPrice = 9.99;
    const totalRevenue = proUsers * monthlyPrice;
    const monthlyRevenue = totalRevenue; // Assuming all are monthly subscriptions

    // Calculate metrics
    const averageRevenuePerUser = proUsers > 0 ? totalRevenue / proUsers : 0;
    const conversionRate = users?.length > 0 ? (proUsers / users.length) * 100 : 0;

    // Generate revenue growth data (weekly intervals)
    const revenueGrowth = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i * 7);
      const proUsersAtDate = users?.filter(user => 
        new Date(user.created_at) <= date && 
        (user.plan_name === 'pro' || user.subscription_status === 'active')
      ).length || 0;
      revenueGrowth.push({
        date: date.toISOString().split('T')[0],
        revenue: proUsersAtDate * monthlyPrice
      });
    }

    // Mock subscription breakdown
    const subscriptionBreakdown = [
      { plan: 'Pro Monthly', count: proUsers, revenue: totalRevenue },
      { plan: 'Free', count: (users?.length || 0) - proUsers, revenue: 0 },
    ];

    // Generate MRR data (monthly intervals)
    const monthlyRecurringRevenue = [];
    for (let i = 4; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().slice(0, 7); // YYYY-MM format
      
      // Mock MRR calculation
      const mrrAtDate = Math.floor(proUsers * (0.8 + Math.random() * 0.4)) * monthlyPrice;
      
      monthlyRecurringRevenue.push({
        month: monthStr,
        mrr: mrrAtDate
      });
    }

    // Mock top customers (would come from actual subscription data)
    const topCustomers = [
      { email: 'enterprise@company.com', revenue: 99.99, plan: 'Pro Monthly' },
      { email: 'business@firm.com', revenue: 29.97, plan: 'Pro Monthly' },
      { email: 'creative@studio.com', revenue: 19.98, plan: 'Pro Monthly' },
      { email: 'designer@agency.com', revenue: 19.98, plan: 'Pro Monthly' },
      { email: 'photographer@pro.com', revenue: 9.99, plan: 'Pro Monthly' },
    ].slice(0, Math.min(5, proUsers));

    const revenue = {
      totalRevenue,
      monthlyRevenue,
      yearlyRevenue: totalRevenue * 12, // Estimate
      averageRevenuePerUser,
      conversionRate,
      churnRate: 3.2, // Mock data - would calculate from cancellations
      lifetimeValue: averageRevenuePerUser * 12, // Rough estimate
      revenueGrowth,
      subscriptionBreakdown,
      monthlyRecurringRevenue,
      topCustomers,
      refunds: [] // No refunds data available yet
    };

    return NextResponse.json(revenue);
  } catch (error) {
    console.error('Error in GET /api/admin/revenue:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}