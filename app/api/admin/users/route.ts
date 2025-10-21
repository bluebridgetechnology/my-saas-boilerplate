import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const plan = searchParams.get('plan') || 'all';
    const status = searchParams.get('status') || 'all';
    const admin = searchParams.get('admin') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build the query
    let query = supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        name,
        plan_name,
        subscription_status,
        created_at,
        last_login,
        login_count,
        is_admin,
        role
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }

    if (plan !== 'all') {
      query = query.eq('plan_name', plan);
    }

    if (status !== 'all') {
      query = query.eq('subscription_status', status);
    }

    if (admin === 'admin') {
      query = query.eq('is_admin', true);
    } else if (admin === 'user') {
      query = query.eq('is_admin', false);
    }

    // Get total count for pagination
    const { count } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: users, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, plan_name, is_admin } = body;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        name,
        plan_name: plan_name || 'free',
        is_admin: is_admin || false,
        subscription_status: 'active',
        login_count: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in POST /api/admin/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
