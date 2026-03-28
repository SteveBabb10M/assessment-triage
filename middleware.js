import { NextResponse } from 'next/server';

// Routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/login', '/api/debug'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // ── Maintenance mode: set MAINTENANCE_MODE=true in Vercel env vars ──
  if (process.env.MAINTENANCE_MODE === 'true') {
    // Allow static files through so the maintenance page renders cleanly
    if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
      return NextResponse.next();
    }
    // API routes return JSON 503
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'Assessment Triage is temporarily offline for maintenance. Please try again later.' },
        { status: 503 }
      );
    }
    // All other routes show an HTML maintenance page
    return new NextResponse(
      `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Maintenance — Assessment Triage</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
       font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;color:#334155}
  .card{text-align:center;padding:3rem;max-width:480px}
  h1{font-size:1.5rem;margin-bottom:.5rem}
  p{color:#64748b;line-height:1.6}
  .icon{font-size:2.5rem;margin-bottom:1rem}
</style></head>
<body><div class="card">
  <div class="icon">🔧</div>
  <h1>Temporarily Offline</h1>
  <p>Assessment Triage is undergoing maintenance and will be back shortly. No submissions are being processed during this time.</p>
</div></body></html>`,
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
  
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
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    
    // Check expiry
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Add user info to headers for downstream use
    const response = NextResponse.next();
    response.headers.set('x-user-email', decoded.email);
    response.headers.set('x-user-name', decoded.name);
    response.headers.set('x-user-role', decoded.role);
    
    return response;
  } catch (e) {
    // Invalid token - redirect to login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
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
