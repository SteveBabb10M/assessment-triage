import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth';

// Force dynamic rendering (uses cookies)
export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }
  
  return NextResponse.json({ 
    user: {
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
}
