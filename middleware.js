import { NextResponse } from 'next/server';

// Routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/login', '/api/debug'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // 1. Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // 2. Allow static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }
  
  // 3. Check for auth token
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // 4. Verify token (Basic check for Edge Runtime)
  try {
    // Standardizing the payload extraction (handles JWT or simple base64)
    const base64Payload = token.includes('.') ? token.split('.')[1] : token;
    const decoded = JSON.parse(atob(base64Payload));
    
    // Check expiry
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Pass user info to headers
    const response = NextResponse.next();
    response.headers.set('x-user-email', decoded.email || '');
    response.headers.set('x-user-name', decoded.name || '');
    response.headers.set('x-user-role', decoded.role || '');
    
    return response;
  } catch (e) {
    // If decoding fails, back to login they go
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// This config must be outside the middleware function
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