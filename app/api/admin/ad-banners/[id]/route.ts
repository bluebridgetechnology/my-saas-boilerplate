import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/database';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { banner_name, banner_type, banner_content, banner_position, is_active, display_pages, click_url, alt_text } = body;

    const { data: banner, error } = await supabaseAdmin
      .from('ad_banners')
      .update({
        banner_name,
        banner_type,
        banner_content,
        banner_position,
        is_active,
        display_pages: display_pages || [],
        click_url,
        alt_text,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating ad banner:', error);
      return NextResponse.json({ error: 'Failed to update ad banner' }, { status: 500 });
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error in PUT /api/admin/ad-banners/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin
      .from('ad_banners')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting ad banner:', error);
      return NextResponse.json({ error: 'Failed to delete ad banner' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/ad-banners/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}