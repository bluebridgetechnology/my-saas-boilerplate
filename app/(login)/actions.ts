'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { createServerClient } from '@/lib/auth/supabase';
import { DatabaseService } from '@/lib/supabase/database';
import { ActivityType } from '@/lib/types/activity';
import {
  validatedAction,
  validatedActionWithUser
} from '@/lib/auth/middleware';

async function logActivity(
  userId: string,
  type: ActivityType,
  ipAddress?: string
) {
  await DatabaseService.logActivity(userId, type, ipAddress);
}

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;
  const supabase = await createServerClient();

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('Email not confirmed')) {
      return {
        error: 'Please check your email and click the verification link before signing in.',
        email,
        password
      };
    }
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  if (!authData.user) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  // Get or create user in our custom users table
  let user = await DatabaseService.getUser(authData.user.id);
  if (!user) {
    user = await DatabaseService.createUser({
      id: authData.user.id,
      email: authData.user.email!,
      name: authData.user.user_metadata?.name || null,
    });
  }

  await logActivity(authData.user.id, ActivityType.SIGN_IN);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ user, priceId });
  }

  // Return success instead of redirecting - let client handle navigation
  console.log('Sign in successful, returning redirect:', '/dashboard');
  return {
    success: 'Sign in successful! Redirecting...',
    redirect: '/dashboard'
  };
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional()
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password, name } = data;
  const supabase = await createServerClient();

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || email.split('@')[0]
      }
    }
  });

  if (error) {
    return {
      error: error.message || 'Failed to create account. Please try again.',
      email,
      password
    };
  }

  if (!authData.user) {
    return {
      error: 'Failed to create account. Please try again.',
      email,
      password
    };
  }

  // Create user in our custom users table
  const newUser = await DatabaseService.createUser({
    id: authData.user.id,
    email: authData.user.email!,
    name: name || authData.user.user_metadata?.name || null,
  });

  await logActivity(authData.user.id, ActivityType.SIGN_UP);

  // Check if email confirmation is required
  if (authData.user.email_confirmed_at === null) {
    // Redirect to verification page instead of showing toast
    redirect(`/verify-email?email=${encodeURIComponent(email)}`);
  }

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    return createCheckoutSession({ user: newUser, priceId });
  }

  redirect('/dashboard');
});

export async function signOut() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    await logActivity(user.id, ActivityType.SIGN_OUT);
  }

  await supabase.auth.signOut();
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    if (currentPassword === newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password must be different from the current password.'
      };
    }

    if (confirmPassword !== newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password and confirmation password do not match.'
      };
    }

    const supabase = await createServerClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: error.message
      };
    }

    await logActivity(user.id, ActivityType.UPDATE_PASSWORD);

    return {
      success: 'Password updated successfully.'
    };
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100)
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    // Verify password by attempting to sign in
    const supabase = await createServerClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password
    });

    if (signInError) {
      return {
        password,
        error: 'Incorrect password. Account deletion failed.'
      };
    }

    await logActivity(user.id, ActivityType.DELETE_ACCOUNT);

    // Delete user from Supabase Auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      return {
        password,
        error: 'Failed to delete account. Please try again.'
      };
    }

    redirect('/sign-in');
  }
);

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address')
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;

    const supabase = await createServerClient();
    const { error } = await supabase.auth.updateUser({
      email,
      data: { name }
    });

    if (error) {
      return {
        name,
        email,
        error: error.message
      };
    }

    await Promise.all([
      DatabaseService.updateUser(user.id, { name, email }),
      logActivity(user.id, ActivityType.UPDATE_ACCOUNT)
    ]);

    return { name, success: 'Account updated successfully.' };
  }
);

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const forgotPassword = validatedAction(forgotPasswordSchema, async (data) => {
  const { email } = data;
  const supabase = await createServerClient();

  // Configure Supabase to NOT redirect through auth callback
  // The email will contain a direct link to reset-password with tokens in hash
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.BASE_URL}/reset-password`,
  });

  if (error) {
    return {
      error: error.message,
      email
    };
  }

  return {
    success: 'Password reset email sent! Please check your inbox.',
    email
  };
});

const resetPasswordSchema = z.object({
  password: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100),
  accessToken: z.string().optional()
});

export const resetPassword = validatedAction(resetPasswordSchema, async (data) => {
  const { password, confirmPassword, accessToken } = data;

  if (password !== confirmPassword) {
    return {
      error: 'Passwords do not match.',
      password,
      confirmPassword
    };
  }

  // If access token is provided, use it directly (for password reset flow)
  if (accessToken) {
    console.log('Using provided access token for password reset');
    
    try {
      // Call Supabase API directly with the access token in the header
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          },
          body: JSON.stringify({ password })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error('Reset password - API error:', result);
        return {
          error: result.msg || result.message || 'Failed to update password. Please try again.',
          password,
          confirmPassword
        };
      }

      console.log('Reset password - success');
      return {
        success: 'Password updated successfully! You can now sign in with your new password.'
      };
    } catch (error) {
      console.error('Reset password - exception:', error);
      return {
        error: 'An error occurred while updating your password. Please try again.',
        password,
        confirmPassword
      };
    }
  }

  // Fallback to regular session-based auth (for logged-in users changing password)
  const supabase = await createServerClient();
  
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    console.error('Reset password - no user session:', userError);
    return {
      error: 'Session expired. Please request a new password reset link.',
      password,
      confirmPassword
    };
  }

  console.log('Reset password - user found:', userData.user.email);
  
  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    console.error('Reset password - update error:', error);
    return {
      error: error.message,
      password,
      confirmPassword
    };
  }

  console.log('Reset password - success');
  return {
    success: 'Password updated successfully! You can now sign in with your new password.'
  };
});

const resendVerificationSchema = z.object({
  email: z.string().email()
});

export const resendVerification = validatedAction(resendVerificationSchema, async (data) => {
  const { email } = data;
  const supabase = await createServerClient();

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
    options: {
      emailRedirectTo: `${process.env.BASE_URL}/auth/callback?type=signup`
    }
  });

  if (error) {
    return {
      error: error.message,
      email
    };
  }

  return {
    success: 'Verification email sent! Please check your inbox.',
    email
  };
});
