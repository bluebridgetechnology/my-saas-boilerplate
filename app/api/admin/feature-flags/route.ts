import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/database';

export async function GET() {
  try {
    const { data: flags, error } = await supabaseAdmin
      .from('feature_flags')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feature flags:', error);
      return NextResponse.json({ error: 'Failed to fetch feature flags' }, { status: 500 });
    }

    return NextResponse.json(flags);
  } catch (error) {
    console.error('Error in GET /api/admin/feature-flags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flag_name, is_enabled, rollout_percentage, target_user_groups, description } = body;

    const { data: flag, error } = await supabaseAdmin
      .from('feature_flags')
      .insert({
        flag_name,
        is_enabled: is_enabled || false,
        rollout_percentage: rollout_percentage || 0,
        target_user_groups: target_user_groups || [],
        description
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating feature flag:', error);
      return NextResponse.json({ error: 'Failed to create feature flag' }, { status: 500 });
    }

    return NextResponse.json(flag);
  } catch (error) {
    console.error('Error in POST /api/admin/feature-flags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
