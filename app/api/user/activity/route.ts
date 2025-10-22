import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/supabase';
import { DatabaseService } from '@/lib/supabase/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const activities = await DatabaseService.getActivityLogs(user.id);
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
