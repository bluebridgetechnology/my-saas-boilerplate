'use client';

import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { resetPassword } from '@/app/(login)/actions';
import { ActionState } from '@/lib/auth/middleware';
import { toast } from 'sonner';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { supabase } from '@/lib/auth/supabase-client';

export function ResetPasswordContent() {
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [accessToken, setAccessToken] = useState<string>('');
  
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    resetPassword,
    { error: '' }
  );

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle hash fragment tokens from Supabase
  useEffect(() => {
    if (typeof window === 'undefined' || !mounted) {
      console.log('Skipping hash check - window undefined or not mounted');
      return;
    }

    const handleHashChange = async () => {
      console.log('=== PASSWORD RESET DEBUG ===');
      console.log('Full URL:', window.location.href);
      console.log('Hash fragment:', window.location.hash);
      console.log('Hash length:', window.location.hash.length);
      
      let token: string | null = null;
      let refreshToken: string | null = null;
      let type: string | null = null;

      // First, check hash fragment (PKCE flow)
      const hash = window.location.hash.substring(1);
      if (hash) {
        const hashParams = new URLSearchParams(hash);
        token = hashParams.get('access_token');
        refreshToken = hashParams.get('refresh_token');
        type = hashParams.get('type');
        console.log('Tokens from hash:', { token: !!token, type, refreshToken: !!refreshToken });
      }

      // If no hash tokens, check query parameters (server-side verify flow)
      if (!token) {
        const searchParams = new URLSearchParams(window.location.search);
        token = searchParams.get('access_token');
        refreshToken = searchParams.get('refresh_token');
        type = searchParams.get('type');
        console.log('Tokens from query:', { token: !!token, type, refreshToken: !!refreshToken });
      }

      // If still no tokens, show error
      if (!token || !type) {
        console.log('No valid tokens found');
        setIsValidToken(false);
        return;
      }

      console.log('Parsed tokens:', { 
        accessToken: token ? `${token.substring(0, 20)}...` : null, 
        type, 
        refreshToken: refreshToken ? 'present' : 'missing' 
      });

      if (token && type === 'recovery') {
        // Store the access token to pass to the server action
        setAccessToken(token);
        console.log('Valid recovery token found, setting session...');
        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

        // Set the session - don't await, just fire and forget
        // The auth context will handle the session state changes
        supabase.auth.setSession({
          access_token: token,
          refresh_token: refreshToken || ''
        }).then(({ data, error }) => {
          console.log('✅ Session setup completed:', { hasData: !!data, hasError: !!error });
          if (error) {
            console.error('Session error:', error);
          }
        }).catch(err => {
          console.error('Exception setting session:', err);
        });

        // Immediately show the form since we have a valid token
        // The session will be established in the background
        console.log('✅ Showing password reset form');
        setIsValidToken(true);
        setSessionReady(true);
      } else {
        console.log('Invalid token - token:', !!token, 'type:', type);
        setIsValidToken(false);
      }
    };

    handleHashChange();
  }, [mounted]);

  // Show toast notifications
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (state.error) {
      toast.error(state.error);
    }
    if (state.success) {
      toast.success(state.success);
    }
  }, [state]);

  if (!mounted) {
    return null;
  }

  // Loading state while checking token
  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Verifying reset link...
                </h1>
                <p className="text-gray-600">
                  Please wait while we verify your password reset link.
                </p>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Invalid token state
  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Lock className="h-6 w-6 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Invalid Reset Link
                </h1>
                <p className="text-gray-600 mb-6">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
                <Link
                  href="/forgot-password"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Request New Reset Link
                </Link>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Success state - password has been reset
  if (state.success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Password Reset Successful
                </h1>
                <p className="text-gray-600 mb-6">
                  Your password has been updated successfully. You can now sign in with your new password.
                </p>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Reset password form
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Reset Your Password
              </h1>
              <p className="text-gray-600">
                Enter your new password below
              </p>
            </div>

            <form action={formAction} className="space-y-6">
              {/* Hidden field to pass access token to server action */}
              <input type="hidden" name="accessToken" value={accessToken} />
              
              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  disabled={pending || !sessionReady}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  {pending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </div>

              <div className="text-center">
                <Link
                  href="/sign-in"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Back to sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
