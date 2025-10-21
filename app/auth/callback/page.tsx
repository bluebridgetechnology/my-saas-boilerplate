import { createServerClient } from '@/lib/auth/supabase';
import { redirect } from 'next/navigation';

export default async function AuthCallback({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string; type?: string; token?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createServerClient();

  if (params.error) {
    redirect('/sign-in?error=' + encodeURIComponent(params.error));
  }

  // Handle password reset flow
  if (params.type === 'recovery') {
    // Redirect to reset password page - the tokens will be in the hash fragment
    redirect('/reset-password');
  }

  if (params.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
    
    if (error) {
      redirect('/sign-in?error=' + encodeURIComponent(error.message));
    }

    // Check if this is an email verification
    if (params.type === 'signup' && data.user && !data.user.email_confirmed_at) {
      redirect('/verify-email?email=' + encodeURIComponent(data.user.email || ''));
    }

    // If user is verified, redirect to dashboard
    if (data.user && data.user.email_confirmed_at) {
      redirect('/dashboard');
    }
  }

  redirect('/sign-in');
}
