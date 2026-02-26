import { NextResponse } from 'next/server';

// TEMPORARY DEBUG ENDPOINT - REMOVE AFTER TESTING
export async function GET() {
  const usersEnv = process.env.AUTH_USERS || 'NOT SET';
  
  // Parse users (same logic as auth.js)
  let parsed = [];
  if (usersEnv && usersEnv !== 'NOT SET') {
    parsed = usersEnv.split(',').map(userStr => {
      const parts = userStr.split(':');
      return {
        username: parts[0],
        passwordLength: parts[1]?.length,
        name: parts[2],
        role: parts[3]
      };
    });
  }
  
  return NextResponse.json({
    envLength: usersEnv.length,
    userCount: parsed.length,
    users: parsed.map(u => ({
      username: u.username,
      passwordLength: u.passwordLength,
      name: u.name,
      role: u.role
    }))
  });
}
