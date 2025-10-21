import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/database';

export async function GET() {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('admin_settings')
      .select('*')
      .order('setting_key', { ascending: true });

    if (error) {
      console.error('Error fetching admin settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error in GET /api/admin/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { setting_key, setting_value, description } = body;

    const { data: setting, error } = await supabaseAdmin
      .from('admin_settings')
      .insert({
        setting_key,
        setting_value,
        description
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating admin setting:', error);
      return NextResponse.json({ error: 'Failed to create setting' }, { status: 500 });
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error('Error in POST /api/admin/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
