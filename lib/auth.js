// Authentication helpers for Assessment Triage
// Simple JWT-like auth with environment-based user management

import { cookies } from 'next/headers';

// Parse users from environment variable
// Format: email:password:name:role (role is 'teacher' or 'sysadmin')
// Example: steve.babb@gateway.ac.uk:pass123:Steve Babb:teacher,admin@gateway.ac.uk:admin:System Admin:sysadmin
function getUsers() {
  const usersEnv = process.env.USERS || '';
  
  // Default users if none configured (for initial testing)
  if (!usersEnv) {
    return [
      { email: 'admin@gateway.ac.uk', password: 'admin', name: 'System Admin', role: 'sysadmin' },
      { email: 'steve.babb@gateway.ac.uk', password: 'steve', name: 'Steve Babb', role: 'teacher' },
      { email: 'simon.brown@gateway.ac.uk', password: 'simon', name: 'Simon Brown', role: 'teacher' },
    ];
  }
  
  return usersEnv.split(',').map(userStr => {
    const [email, password, name, role = 'teacher'] = userStr.split(':');
    return { email: email?.trim(), password, name, role };
  }).filter(u => u.email && u.password);
}

// Create a simple token (base64 encoded JSON with expiry)
function createToken(payload) {
  const tokenData = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hour expiry
    iat: Math.floor(Date.now() / 1000)
  };
  return Buffer.from(JSON.stringify(tokenData)).toString('base64');
}

// Verify and decode token
function verifyToken(token) {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    
    // Check expiry
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return null;
    }
    
    return decoded;
  } catch (e) {
    return null;
  }
}

// Authenticate user with email and password
export function authenticateUser(email, password) {
  const users = getUsers();
  const user = users.find(u => 
    u.email.toLowerCase() === email.toLowerCase() && 
    u.password === password
  );
  
  if (!user) {
    return null;
  }
  
  // Create token with user info (excluding password)
  const token = createToken({
    email: user.email,
    name: user.name,
    role: user.role
  });
  
  return { 
    token, 
    user: { 
      email: user.email, 
      name: user.name, 
      role: user.role 
    } 
  };
}

// Get current user from request cookies (for server components/API routes)
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

// Check if current user is sysadmin
export async function isSysadmin() {
  const user = await getCurrentUser();
  return user?.role === 'sysadmin';
}

// Get user from token string (for middleware)
export function getUserFromToken(token) {
  return verifyToken(token);
}

// Get all configured users (for admin purposes, excludes passwords)
export function getAllUsers() {
  return getUsers().map(u => ({
    email: u.email,
    name: u.name,
    role: u.role
  }));
}
