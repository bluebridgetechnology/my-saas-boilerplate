import { NextResponse } from 'next/server';
import { getCurrentUserProAccess } from '@/lib/auth/pro-access';

export async function GET() {
  try {
    const userAccess = await getCurrentUserProAccess();
    
    return NextResponse.json({
      hasProAccess: userAccess.hasProAccess,
      isAdmin: userAccess.isAdmin,
      planName: userAccess.planName,
      subscriptionStatus: userAccess.subscriptionStatus,
    });
  } catch (error) {
    console.error('Error checking user pro access:', error);
    return NextResponse.json({ 
      hasProAccess: false,
      isAdmin: false,
      planName: null,
      subscriptionStatus: null,
    });
  }
}
