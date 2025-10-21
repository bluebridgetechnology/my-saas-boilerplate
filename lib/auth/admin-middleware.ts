import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/auth/supabase';

export async function adminMiddleware(request: NextRequest) {
  // Only apply to admin routes
  if (!request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  try {
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.is_admin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
}
