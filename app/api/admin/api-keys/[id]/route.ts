import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: apiKey, error } = await supabaseAdmin
      .from('api_keys')
      .select(`
        *,
        user:users!api_keys_user_id_fkey (
          id,
          email,
          name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching API key:', error);
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    return NextResponse.json(apiKey);
  } catch (error) {
    console.error('Error in GET /api/admin/api-keys/[id]:', error);
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
    const { key_name, is_active, rate_limit_per_hour, expires_at } = body;

    const updateData: any = {};
    if (key_name !== undefined) updateData.key_name = key_name;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (rate_limit_per_hour !== undefined) updateData.rate_limit_per_hour = rate_limit_per_hour;
    if (expires_at !== undefined) updateData.expires_at = expires_at;

    const { data: apiKey, error } = await supabaseAdmin
      .from('api_keys')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        user:users!api_keys_user_id_fkey (
          id,
          email,
          name
        )
      `)
      .single();

    if (error) {
      console.error('Error updating API key:', error);
      return NextResponse.json({ error: 'Failed to update API key' }, { status: 500 });
    }

    return NextResponse.json(apiKey);
  } catch (error) {
    console.error('Error in PATCH /api/admin/api-keys/[id]:', error);
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
      .from('api_keys')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting API key:', error);
      return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 });
    }

    return NextResponse.json({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/api-keys/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
