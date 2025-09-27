import { getUser } from '@/lib/auth/supabase';

export async function GET() {
  const user = await getUser();
  return Response.json(user);
}
