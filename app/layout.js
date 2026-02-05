import './globals.css';

export const metadata = {
  title: 'Assessment Triage',
  description: 'AI-powered assessment triage for BTEC Business',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <div className="nav-inner">
            <a href="/dashboard" className="nav-brand">📊 Assessment Triage</a>
            <div className="nav-links">
              <a href="/dashboard" className="nav-link">Dashboard</a>
              <a href="/setup" className="nav-link">Setup / Test</a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
