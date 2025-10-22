import { NextResponse } from 'next/server';
import { signOut } from '@/app/(login)/actions';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await signOut();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error signing out:', error);
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 });
  }
}
