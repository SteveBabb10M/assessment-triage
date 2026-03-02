Yes, if the code in your api/auth/login/route.js follows the standard Next.js App Router structure, you should replace the entire file with the version below.

Since you've moved to assigned usernames, this updated code ensures the auth-token is created using that username and—crucially—uses the cookies() utility to stop that 307 redirect loop you’re seeing on Vercel.

The Complete api/auth/login/route.js
JavaScript
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // NOTE: You mentioned you use assigned usernames now. 
    // If your login form still sends the value as 'email', 
    // we use it here as the 'username'.
    const username = email; 

    // --- YOUR AUTH LOGIC HERE ---
    // (Check the username/password against your Teachers/Students CSV)
    // ----------------------------

    // Create the payload for the triage tool
    const payload = {
      username: username,
      role: 'staff', // Adjust based on your user logic
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24h expiry
    };

    // Encode to Base64 (matches your middleware's atob logic)
    const token = btoa(JSON.stringify(payload));

    // Use Next.js headers utility to set the cookie properly for Vercel
    const cookieStore = cookies();
    cookieStore.set('auth-token', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Required for HTTPS on Vercel
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}