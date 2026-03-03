# Authentication Implementation for Assessment Triage

## Overview

This update adds multi-teacher login with uploader-based access control:
- **Teachers** see only submissions they personally uploaded
- **Sysadmin** sees all submissions with uploader stats

## Files to Add/Replace

### New Files (add these)
```
middleware.js                    # Route protection
lib/auth.js                      # Authentication helpers
lib/AuthContext.js               # Client-side auth state
components/UserHeader.js         # User info + logout button
app/login/page.js                # Login page
app/api/auth/login/route.js      # Login API
app/api/auth/logout/route.js     # Logout API
app/api/auth/me/route.js         # Current user API
app/api/submissions/route.js     # Submissions API (filtered by user)
```

### Files to Replace
```
app/layout.js                    # Updated with AuthProvider
app/dashboard/page.js            # Updated with user filtering
app/setup/page.js                # Updated with uploader info
app/api/analyze/route.js         # Updated to track uploader
data/submissions.js              # Updated with uploader tracking
.env.example                     # Updated with USERS config
```

## Environment Variables

Add to your Vercel project settings:

```
ANTHROPIC_API_KEY=sk-ant-xxxxx

USERS=admin@gateway.ac.uk:admin123:System Admin:sysadmin,steve.babb@gateway.ac.uk:steve:Steve Babb:teacher,simon.brown@gateway.ac.uk:simon:Simon Brown:teacher,amreen.shabir@gateway.ac.uk:amreen:Amreen Shabir:teacher
```

### User Format
```
email:password:display_name:role
```

Roles:
- `sysadmin` — Sees all submissions, uploader stats
- `teacher` — Sees only their own uploads

## Quick Setup

1. Copy all new files to your repo
2. Replace the modified files
3. Add USERS environment variable to Vercel
4. Deploy

## Default Test Accounts

If USERS env var is not set, these defaults work:
- admin@gateway.ac.uk / admin (sysadmin)
- steve.babb@gateway.ac.uk / steve (teacher)
- simon.brown@gateway.ac.uk / simon (teacher)

## How It Works

1. **Middleware** checks auth cookie on every request
2. **Login** validates credentials, sets HTTP-only cookie
3. **analyze API** tags each submission with uploader email
4. **Dashboard** filters submissions based on logged-in user
5. **Sysadmin** sees all submissions plus per-teacher stats

## Notes

- Session lasts 24 hours
- In-memory storage (submissions reset on server restart)
- For production, you'd want a database (Supabase, etc.)
- Passwords are stored in plain text in env var (fine for internal tool)
