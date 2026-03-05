'use client';

import { useAuth } from '../lib/AuthContext';

export default function UserHeader() {
  const { user, loading, logout } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        color: '#64748b',
        fontSize: '0.875rem'
      }}>
        <span>Loading...</span>
      </div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.75rem',
      fontSize: '0.875rem'
    }}>
      <span style={{ color: '#cbd5e1', fontWeight: 500 }}>
        {user.name}
        {user.role === 'sysadmin' && (
          <span style={{ 
            marginLeft: '0.5rem',
            backgroundColor: 'rgba(96,165,250,0.2)',
            color: '#93c5fd',
            padding: '0.125rem 0.5rem',
            borderRadius: '9999px',
            fontSize: '0.6875rem',
            fontWeight: 600
          }}>
            Admin
          </span>
        )}
      </span>
      <button
        onClick={logout}
        style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: 'white',
          padding: '0.375rem 0.75rem',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.8125rem',
          fontWeight: 500,
          transition: 'all 0.15s'
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
          e.target.style.borderColor = 'rgba(255,255,255,0.3)';
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
          e.target.style.borderColor = 'rgba(255,255,255,0.2)';
        }}
      >
        Sign out
      </button>
    </div>
  );
}
