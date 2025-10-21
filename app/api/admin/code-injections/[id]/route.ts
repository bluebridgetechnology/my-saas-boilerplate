import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/database';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { injection_name, injection_type, injection_code, is_active, target_pages, priority } = body;

    const { data: injection, error } = await supabaseAdmin
      .from('code_injections')
      .update({
        injection_name,
        injection_type,
        injection_code,
        is_active,
        target_pages: target_pages || [],
        priority: priority || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating code injection:', error);
      return NextResponse.json({ error: 'Failed to update code injection' }, { status: 500 });
    }

    return NextResponse.json(injection);
  } catch (error) {
    console.error('Error in PUT /api/admin/code-injections/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin
      .from('code_injections')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting code injection:', error);
      return NextResponse.json({ error: 'Failed to delete code injection' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/code-injections/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}