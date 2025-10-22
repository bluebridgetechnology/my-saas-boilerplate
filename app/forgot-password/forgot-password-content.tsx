'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { forgotPassword } from '@/app/(login)/actions';
import { ActionState } from '@/lib/auth/middleware';
import { toast } from 'sonner';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button
      type="submit"
      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin mr-2 h-5 w-5" />
          Sending Reset Link...
        </>
      ) : (
        <>
          <Mail className="mr-2 h-5 w-5" />
          Send Reset Link
        </>
      )}
    </Button>
  );
}

export function ForgotPasswordContent() {
  const [mounted, setMounted] = useState(false);
  const [state, formAction] = useFormState<ActionState, FormData>(
    forgotPassword,
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
  }, [state]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="flex items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Forgot your password?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form className="mt-8 space-y-6" action={formAction}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="sr-only">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="pl-10"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>
            </div>

            <div>
              <SubmitButton />
            </div>

            <div className="text-center">
              <Link
                href="/sign-in"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </form>

          {state.success && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Check your email!</strong> We've sent you a link to reset your password. 
                If you don't see it in your inbox, check your spam folder.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
