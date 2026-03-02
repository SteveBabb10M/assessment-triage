import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Mapping 'email' from your form to your 'username' system
    const username = email; 

    // Create the payload for the triage tool
    const payload = {
      username: username,
      role: 'staff', 
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) 
    };

    // Encode to Base64
    const token = btoa(JSON.stringify(payload));

    // Set the cookie properly for Vercel production
    const cookieStore = cookies();
    cookieStore.set('auth-token', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}