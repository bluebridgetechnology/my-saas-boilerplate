import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/database';

export async function GET() {
  try {
    const { data: injections, error } = await supabaseAdmin
      .from('code_injections')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching code injections:', error);
      return NextResponse.json({ error: 'Failed to fetch code injections' }, { status: 500 });
    }

    return NextResponse.json(injections);
  } catch (error) {
    console.error('Error in GET /api/admin/code-injections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { injection_name, injection_type, injection_code, is_active, target_pages, priority } = body;

    const { data: injection, error } = await supabaseAdmin
      .from('code_injections')
      .insert({
        injection_name,
        injection_type,
        injection_code,
        is_active,
        target_pages: target_pages || [],
        priority: priority || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating code injection:', error);
      return NextResponse.json({ error: 'Failed to create code injection' }, { status: 500 });
    }

    return NextResponse.json(injection);
  } catch (error) {
    console.error('Error in POST /api/admin/code-injections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}