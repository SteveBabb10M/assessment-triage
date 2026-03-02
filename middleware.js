import { NextResponse } from 'next/server';

// Routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/login', '/api/debug'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Allow static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }
  
  // Check for auth token
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    // Redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
// Verify token (basic check)
  try {
    // 1. Handle potential JWT structure (header.payload.signature)
    // AI-generated tokens often follow this standard.
    const base64Payload = token.includes('.') ? token.split('.')[1] : token;
    
    // 2. Use atob() for Edge Runtime compatibility
    // This replaces the Buffer.from() which was causing your deployment error.
    const decoded = JSON.parse(atob(base64Payload));
    
    // 3. Expiry check (Unix timestamp in seconds)
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // 4. Injecting identity into headers
    // This allows your /dashboard pages to know who is logged in without re-parsing.
    const response = NextResponse.next();
    response.headers.set('x-user-email', decoded.email || 'unknown');
    response.headers.set('x-user-name', decoded.name || 'Student');
    response.headers.set('x-user-role', decoded.role || 'user');
    
    return response;
  } catch (e) {
    // If the AI gives them a malformed string, this catch-all 
    // simply treats it as an invalid login.
    console.error("Auth bypass attempt or malformed token detected.");
    return NextResponse.redirect(new URL('/login', request.url));
  }

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
