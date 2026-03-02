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
    // We use atob() because Buffer is not available in the Edge Runtime
    const decodedPayload = atob(token);
    const decoded = JSON.parse(decodedPayload);
    
    // Check expiry
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Add user info to headers for downstream use
    const response = NextResponse.next();
    
    // Use optional chaining or empty strings to prevent header errors if fields are missing
    response.headers.set('x-user-email', decoded.email || '');
    response.headers.set('x-user-name', decoded.name || '');
    response.headers.set('x-user-role', decoded.role || '');
    
    return response;
  } catch (e) {
    // If decoding fails, the token is malformed
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
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
