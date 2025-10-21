import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: ticket, error } = await supabaseAdmin
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
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching support ticket:', error);
      return NextResponse.json({ error: 'Support ticket not found' }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error in GET /api/admin/support-tickets/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, priority, assigned_to, resolution } = body;

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
    if (resolution !== undefined) updateData.resolution = resolution;

    const { data: ticket, error } = await supabaseAdmin
      .from('support_tickets')
      .update(updateData)
      .eq('id', id)
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
      console.error('Error updating support ticket:', error);
      return NextResponse.json({ error: 'Failed to update support ticket' }, { status: 500 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error in PATCH /api/admin/support-tickets/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin
      .from('support_tickets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting support ticket:', error);
      return NextResponse.json({ error: 'Failed to delete support ticket' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Support ticket deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/support-tickets/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
