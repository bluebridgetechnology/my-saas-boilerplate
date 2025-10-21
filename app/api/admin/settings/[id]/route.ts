import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: setting, error } = await supabaseAdmin
      .from('admin_settings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching admin setting:', error);
      return NextResponse.json({ error: 'Setting not found' }, { status: 404 });
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error in GET /api/admin/settings/[id]:', error);
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
    const { setting_value, description } = body;

    const updateData: any = {};
    if (setting_value !== undefined) updateData.setting_value = setting_value;
    if (description !== undefined) updateData.description = description;

    const { data: setting, error } = await supabaseAdmin
      .from('admin_settings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating admin setting:', error);
      return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error in PATCH /api/admin/settings/[id]:', error);
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
      .from('admin_settings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting admin setting:', error);
      return NextResponse.json({ error: 'Failed to delete setting' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/settings/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
