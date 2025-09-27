'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { createServerClient } from '@/lib/auth/supabase';
import { DatabaseService } from '@/lib/supabase/database';
import {
  validatedAction,
  validatedActionWithUser
} from '@/lib/auth/middleware';

// Activity types
export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
}

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

  redirect('/dashboard');
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
    return {
      success: 'Account created! Please check your email to verify your account before signing in.',
      email,
      password
    };
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
  confirmPassword: z.string().min(8).max(100)
});

export const resetPassword = validatedAction(resetPasswordSchema, async (data) => {
  const { password, confirmPassword } = data;

  if (password !== confirmPassword) {
    return {
      error: 'Passwords do not match.',
      password,
      confirmPassword
    };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    return {
      error: error.message,
      password,
      confirmPassword
    };
  }

  return {
    success: 'Password updated successfully! You can now sign in with your new password.'
  };
});
