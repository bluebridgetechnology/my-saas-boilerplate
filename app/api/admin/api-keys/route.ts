import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/database';
import { randomBytes } from 'crypto';

function generateApiKey(): string {
  const prefix = 'rs_live_';
  const randomPart = randomBytes(16).toString('hex');
  return prefix + randomPart;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build the query with user information
    let query = supabaseAdmin
      .from('api_keys')
      .select(`
        *,
        user:users!api_keys_user_id_fkey (
          id,
          email,
          name
        )
      `)
      .order('created_at', { ascending: false });

    // Filter by user if specified
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Get total count for pagination
    const { count } = await supabaseAdmin
      .from('api_keys')
      .select('*', { count: 'exact', head: true });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: apiKeys, error } = await query;

    if (error) {
      console.error('Error fetching API keys:', error);
      return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
    }

    // Transform the data to match the frontend interface
    const transformedKeys = apiKeys?.map(key => ({
      id: key.id,
      user_id: key.user_id,
      user_email: key.user?.email || 'Unknown',
      key_name: key.key_name,
      api_key: key.api_key,
      is_active: key.is_active,
      rate_limit_per_hour: key.rate_limit_per_hour,
      usage_count: key.usage_count,
      last_used: key.last_used,
      expires_at: key.expires_at,
      created_at: key.created_at,
      updated_at: key.updated_at
    })) || [];

    return NextResponse.json({
      apiKeys: transformedKeys,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in GET /api/admin/api-keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, key_name, rate_limit_per_hour, expires_at } = body;

    const apiKey = generateApiKey();

    // If no user_id is provided, we need a valid user ID from the database
    // For now, let's require user_id to be provided
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const { data: key, error } = await supabaseAdmin
      .from('api_keys')
      .insert({
        user_id,
        key_name,
        api_key: apiKey,
        is_active: true,
        rate_limit_per_hour: rate_limit_per_hour || 1000,
        usage_count: 0,
        expires_at
      })
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
      console.error('Error creating API key:', error);
      return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
    }

    return NextResponse.json(key);
  } catch (error) {
    console.error('Error in POST /api/admin/api-keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
