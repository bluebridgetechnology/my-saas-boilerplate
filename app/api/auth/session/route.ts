import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { access_token, refresh_token } = await request.json();
    
    if (!access_token) {
      return NextResponse.json({ error: 'Missing access token' }, { status: 400 });
    }

    const cookieStore = await cookies();
    
    // Set Supabase auth cookies
    // These are the default cookie names that Supabase uses
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    };

    // Store the tokens in cookies that match Supabase's expected format
    cookieStore.set('sb-access-token', access_token, cookieOptions);
    
    if (refresh_token) {
      cookieStore.set('sb-refresh-token', refresh_token, cookieOptions);
    }

    // Also set the auth token cookie that Supabase SSR expects
    const authData = JSON.stringify({
      access_token,
      refresh_token,
      expires_in: 3600,
      token_type: 'bearer',
      user: null
    });
    
    cookieStore.set(
      `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`,
      authData,
      cookieOptions
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session sync error:', error);
    return NextResponse.json({ error: 'Failed to sync session' }, { status: 500 });
  }
}

