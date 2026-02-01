import './globals.css';

export const metadata = {
  title: 'Assessment Triage',
  description: 'AI-powered assessment triage for educators',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <div className="nav-content">
            <a href="/dashboard" className="nav-brand">
              📊 Assessment Triage
            </a>
            <div className="nav-links">
              <a href="/dashboard" className="nav-link">Dashboard</a>
              <a href="/dashboard?view=department" className="nav-link">Department</a>
              <a href="/setup" className="nav-link">Setup</a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
