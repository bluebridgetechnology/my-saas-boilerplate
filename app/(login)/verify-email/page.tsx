'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, Suspense } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { resendVerification } from '../actions';
import { ActionState } from '@/lib/auth/middleware';
import { toast } from 'sonner';

function ResendButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button
      type="submit"
      variant="outline"
      className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400"
      disabled={pending}
    >
      {pending ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Resend Email
        </>
      )}
    </Button>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';
  const [resendState, resendAction] = useFormState<ActionState, FormData>(
    resendVerification,
    { error: '' }
  );
  const [isResending, setIsResending] = useState(false);

  // Show toast notifications
  useEffect(() => {
    if (resendState.error) {
      toast.error(resendState.error);
      setIsResending(false);
    }
    if (resendState.success) {
      toast.success(resendState.success);
      setIsResending(false);
    }
  }, [resendState.error, resendState.success]);

  const handleResendEmail = () => {
    setIsResending(true);
    const formData = new FormData();
    formData.append('email', email);
    resendAction(formData);
  };

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
              Almost There!
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              We've sent a verification link to your email.
              <br />
              Click it to activate your account.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">100%</div>
              <div className="text-blue-200">Private & Secure</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">Instant</div>
              <div className="text-blue-200">Image Processing</div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-green-400/20 rounded-full blur-lg"></div>
      </div>

      {/* Right Column - Verification */}
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
              Check Your Email
            </h1>
            <p className="text-gray-600">
              We've sent a verification link to your email address
            </p>
          </div>

          {/* Verification Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="hidden lg:block mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verify Your Email
              </h2>
              <p className="text-gray-600">
                Complete your account setup
              </p>
            </div>

            {/* Email Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-green-100 rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-blue-600" />
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-4 mb-8">
              <p className="text-gray-600 leading-relaxed">
                We've sent a verification link to{' '}
                <span className="font-semibold text-gray-900">{email}</span>
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Next Steps:
                    </p>
                    <ol className="text-sm text-blue-800 space-y-1">
                      <li>1. Check your email inbox (and spam folder)</li>
                      <li>2. Click the verification link in the email</li>
                      <li>3. Return here to sign in to your account</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                variant="outline"
                className="w-full h-12 border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="animate-spin mr-2 h-5 w-5" />
                    Resending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              <Link href="/sign-in">
                <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Go to Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p className="mb-2">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                resend it
              </button>
            </p>
            <p>
              Need help?{' '}
              <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
