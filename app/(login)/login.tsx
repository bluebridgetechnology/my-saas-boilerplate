'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { signIn, signUp, forgotPassword } from './actions';
import { ActionState } from '@/lib/auth/middleware';
import { toast } from 'sonner';

function SubmitButton({ mode }: { mode: 'signin' | 'signup' }) {
  const { pending } = useFormStatus();
  
  return (
    <Button
      type="submit"
      className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin mr-2 h-5 w-5" />
          {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
        </>
      ) : (
        <>
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </>
      )}
    </Button>
  );
}

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const redirectAttempted = useRef(false);
  const [state, formAction] = useFormState<ActionState, FormData>(
    mode === 'signin' ? signIn : signUp,
    { error: '' }
  );

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show toast notifications
  useEffect(() => {
    if (typeof window === 'undefined') return; // Only run on client
    
    if (state.error) {
      toast.error(state.error);
    }
    if (state.success) {
      toast.success(state.success);
    }
  }, [state.error, state.success]);

  // Handle redirects after successful sign in
  useEffect(() => {
    if (typeof window === 'undefined') return; // Only run on client
    
    if (state.success && !redirectAttempted.current) {
      redirectAttempted.current = true;
      
      const redirectUrl = state.redirect || (mode === 'signin' ? '/dashboard' : null);
      
      if (redirectUrl) {
        console.log('Redirecting to:', redirectUrl);
        
        // Use window.location.href for immediate redirect
        window.location.href = redirectUrl;
      }
    }
  }, [state.success, state.redirect, mode]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex">
        {/* Left Column - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="h-20 w-20 bg-white/20 rounded-lg animate-pulse"></div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="h-8 bg-white/20 rounded mb-4 animate-pulse"></div>
              <div className="h-6 bg-white/20 rounded mb-2 animate-pulse"></div>
              <div className="h-6 bg-white/20 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="h-16 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="h-8 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="hidden lg:block mb-6">
                <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex">
      {/* Left Column - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img 
                  src="/logo_dark.png" 
                  alt="ResizeSuite" 
                  className="h-20 w-auto"
                />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Professional Image Tools
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Resize, compress, and optimize images instantly. 
              <br />
              100% private, no server uploads required.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">500K+</div>
              <div className="text-blue-200">Images Processed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">50K+</div>
              <div className="text-blue-200">Happy Users</div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-green-400/20 rounded-full blur-lg"></div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img 
                  src="/logo.png" 
                  alt="ResizeSuite" 
                  className="h-16 w-auto"
                />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {mode === 'signin' ? 'Welcome back' : 'Join ResizeSuite'}
            </h1>
            <p className="text-gray-600">
              {mode === 'signin' 
                ? 'Sign in to access your account and continue editing' 
                : 'Create your account to start resizing images like a pro'}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="hidden lg:block mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {mode === 'signin' ? 'Welcome back' : 'Create Account'}
              </h2>
              <p className="text-gray-600">
                {mode === 'signin' 
                  ? 'Sign in to your account' 
                  : 'Get started with ResizeSuite'}
              </p>
            </div>

            <form className="space-y-6" action={formAction}>
              <input type="hidden" name="redirect" value={redirect || ''} />
              <input type="hidden" name="priceId" value={priceId || ''} />
              <input type="hidden" name="inviteId" value={inviteId || ''} />
              
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    defaultValue={state.email}
                    required
                    maxLength={50}
                    className="pl-10 h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    defaultValue={state.password}
                    required
                    minLength={8}
                    maxLength={100}
                    className="pl-10 pr-10 h-12 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="text-xs text-gray-500">
                    Password must be at least 8 characters long
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <SubmitButton mode={mode} />

              {/* Forgot Password */}
              {mode === 'signin' && (
                <div className="text-center">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
              )}
            </form>

            {/* Divider */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    {mode === 'signin' ? 'New to ResizeSuite?' : 'Already have an account?'}
                  </span>
                </div>
              </div>

              {/* Switch Mode Button */}
              <div className="mt-6">
                <Link
                  href={`${mode === 'signin' ? '/sign-up' : '/sign-in'}${
                    redirect ? `?redirect=${redirect}` : ''
                  }${priceId ? `&priceId=${priceId}` : ''}`}
                  className="w-full flex justify-center items-center py-3 px-6 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold bg-white hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
                >
                  {mode === 'signin' ? 'Create an account' : 'Sign in to existing account'}
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-500">
            By {mode === 'signin' ? 'signing in' : 'creating an account'}, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
