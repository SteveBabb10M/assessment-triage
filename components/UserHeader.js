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
      <span style={{ color: '#334155' }}>
        {user.name}
        {user.role === 'sysadmin' && (
          <span style={{ 
            marginLeft: '0.5rem',
            backgroundColor: '#dbeafe',
            color: '#1d4ed8',
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
          backgroundColor: 'transparent',
          border: '1px solid #e2e8f0',
          color: '#64748b',
          padding: '0.375rem 0.75rem',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.8125rem',
          transition: 'all 0.15s'
        }}
        onMouseOver={(e) => {
          e.target.style.borderColor = '#cbd5e1';
          e.target.style.color = '#475569';
        }}
        onMouseOut={(e) => {
          e.target.style.borderColor = '#e2e8f0';
          e.target.style.color = '#64748b';
        }}
      >
        Sign out
      </button>
    </div>
  );
}
