import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/database';

export async function GET() {
  try {
    const { data: banners, error } = await supabaseAdmin
      .from('ad_banners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ad banners:', error);
      return NextResponse.json({ error: 'Failed to fetch ad banners' }, { status: 500 });
    }

    return NextResponse.json(banners);
  } catch (error) {
    console.error('Error in GET /api/admin/ad-banners:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // For admin operations, we'll use the service role key directly
    // In production, you might want to add additional admin verification
    
    const body = await request.json();
    const { banner_name, banner_type, banner_content, banner_position, is_active, display_pages, click_url, alt_text } = body;

    const { data: banner, error } = await supabaseAdmin
      .from('ad_banners')
      .insert({
        banner_name,
        banner_type,
        banner_content,
        banner_position,
        is_active,
        display_pages: display_pages || [],
        click_url,
        alt_text
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating ad banner:', error);
      return NextResponse.json({ error: 'Failed to create ad banner' }, { status: 500 });
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error('Error in POST /api/admin/ad-banners:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
