import { Metadata } from 'next';
import { ForgotPasswordContent } from './forgot-password-content';

export const metadata: Metadata = {
  title: 'Forgot Password - ResizeSuite',
  description: 'Reset your ResizeSuite password securely. Enter your email address to receive password reset instructions.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordContent />;
}
