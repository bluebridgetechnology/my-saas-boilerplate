import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: flag, error } = await supabaseAdmin
      .from('feature_flags')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching feature flag:', error);
      return NextResponse.json({ error: 'Feature flag not found' }, { status: 404 });
    }

    return NextResponse.json(flag);
  } catch (error) {
    console.error('Error in GET /api/admin/feature-flags/[id]:', error);
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
    const { flag_name, is_enabled, rollout_percentage, target_user_groups, description } = body;

    const updateData: any = {};
    if (flag_name !== undefined) updateData.flag_name = flag_name;
    if (is_enabled !== undefined) updateData.is_enabled = is_enabled;
    if (rollout_percentage !== undefined) updateData.rollout_percentage = rollout_percentage;
    if (target_user_groups !== undefined) updateData.target_user_groups = target_user_groups;
    if (description !== undefined) updateData.description = description;

    const { data: flag, error } = await supabaseAdmin
      .from('feature_flags')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating feature flag:', error);
      return NextResponse.json({ error: 'Failed to update feature flag' }, { status: 500 });
    }

    return NextResponse.json(flag);
  } catch (error) {
    console.error('Error in PATCH /api/admin/feature-flags/[id]:', error);
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
      .from('feature_flags')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting feature flag:', error);
      return NextResponse.json({ error: 'Failed to delete feature flag' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Feature flag deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/feature-flags/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
