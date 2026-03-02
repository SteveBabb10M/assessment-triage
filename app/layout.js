import './globals.css';
import { AuthProvider } from '../lib/AuthContext';
import UserHeader from '../components/UserHeader';

export const metadata = {
  title: 'Assessment Triage',
  description: 'AI-powered assessment triage for BTEC educators',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <nav className="nav">
            <div className="nav-content">
              <a href="/dashboard" className="nav-brand">📊 Assessment Triage</a>
              <div className="nav-links">
                <a href="/dashboard" className="nav-link">Dashboard</a>
                <a href="/setup" className="nav-link">Upload</a>
                <UserHeader />
              </div>
            </div>
          </nav>
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
