import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const priority = searchParams.get('priority') || 'all';
    const assigned = searchParams.get('assigned') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build the query with user information
    let query = supabaseAdmin
      .from('support_tickets')
      .select(`
        *,
        user:users!support_tickets_user_id_fkey (
          id,
          email,
          name
        ),
        assigned_user:users!support_tickets_assigned_to_fkey (
          id,
          email,
          name
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`subject.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (priority !== 'all') {
      query = query.eq('priority', priority);
    }

    if (assigned === 'assigned') {
      query = query.not('assigned_to', 'is', null);
    } else if (assigned === 'unassigned') {
      query = query.is('assigned_to', null);
    }

    // Get total count for pagination
    const { count } = await supabaseAdmin
      .from('support_tickets')
      .select('*', { count: 'exact', head: true });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: tickets, error } = await query;

    if (error) {
      console.error('Error fetching support tickets:', error);
      return NextResponse.json({ error: 'Failed to fetch support tickets' }, { status: 500 });
    }

    // Transform the data to match the frontend interface
    const transformedTickets = tickets?.map(ticket => ({
      id: ticket.id,
      user_id: ticket.user_id,
      user_email: ticket.user?.email || 'Unknown',
      user_name: ticket.user?.name || 'Unknown User',
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      assigned_to: ticket.assigned_user?.email || null,
      resolution: ticket.resolution,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at
    })) || [];

    return NextResponse.json({
      tickets: transformedTickets,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in GET /api/admin/support-tickets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, subject, description, priority, assigned_to } = body;

    const { data: ticket, error } = await supabaseAdmin
      .from('support_tickets')
      .insert({
        user_id,
        subject,
        description,
        priority: priority || 'medium',
        status: 'open',
        assigned_to
      })
      .select(`
        *,
        user:users!support_tickets_user_id_fkey (
          id,
          email,
          name
        ),
        assigned_user:users!support_tickets_assigned_to_fkey (
          id,
          email,
          name
        )
      `)
      .single();

    if (error) {
      console.error('Error creating support ticket:', error);
      return NextResponse.json({ error: 'Failed to create support ticket' }, { status: 500 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error in POST /api/admin/support-tickets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
