import { NextRequest, NextResponse } from 'next/server';
import { createCustomerPortalSession } from '@/lib/payments/stripe';
import { getUser } from '@/lib/auth/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const portalSession = await createCustomerPortalSession(user);
    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
