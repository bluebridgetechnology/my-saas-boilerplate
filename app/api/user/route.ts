import { getUser } from '@/lib/auth/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getUser();
  return Response.json(user);
}
