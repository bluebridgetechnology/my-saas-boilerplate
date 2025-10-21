import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/auth/supabase';

const protectedRoutes = '/dashboard';
const adminRoutes = '/admin';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = pathname.startsWith(protectedRoutes);
  const isAdminRoute = pathname.startsWith(adminRoutes);

  // Skip middleware for auth-related pages
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up') || pathname.startsWith('/verify-email') || pathname.startsWith('/auth') || pathname.startsWith('/reset-password') || pathname.startsWith('/forgot-password')) {
    return NextResponse.next();
  }

  // IMPORTANT: Skip auth checks for public pages (all tool pages, home, etc.)
  // Only run auth checks for protected routes
  if (!isProtectedRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  // Only create Supabase client if we actually need authentication
  try {
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (isProtectedRoute && (!user || error)) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    // Check if user is authenticated but email is not confirmed
    if (isProtectedRoute && user && !user.email_confirmed_at) {
      return NextResponse.redirect(new URL('/verify-email', request.url));
    }

    // Admin route protection
    if (isAdminRoute) {
      if (!user || error) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }

      // Check if user is admin
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (userError || !userData?.is_admin) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      } catch (error) {
        console.error('Admin check error:', error);
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // If Supabase isn't configured or there's an error, allow public access
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon.png|sw.js|manifest.json).*)'],
  runtime: 'nodejs'
};
