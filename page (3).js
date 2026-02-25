'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { getTriageCounts, getAtRiskStudents, getUnmatchedSubmissions, getUploaderStats } from '../../data/submissions';
import { COHORTS, getCohortShortName } from '../../data/staff';
import { UNITS } from '../../data/units';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [filterCohort, setFilterCohort] = useState('all');
  const [filterUnit, setFilterUnit] = useState('all');
  const [submissions, setSubmissions] = useState([]);
  const [uploaderStats, setUploaderStats] = useState({});
  const [expandedSections, setExpandedSections] = useState({ red: true, yellow: false, green: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubmissions();
    }
  }, [user]);

  async function loadSubmissions() {
    setLoading(true);
    try {
      // Fetch submissions from API (filtered by user on server)
      const res = await fetch('/api/submissions');
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
        if (data.uploaderStats) {
          setUploaderStats(data.uploaderStats);
        }
      }
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  }

  function toggleSection(section) {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }

  if (authLoading || loading) {
    return (
      <div className="container" style={{ paddingTop: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Please sign in to continue.</p>
      </div>
    );
  }

  // Filter submissions
  let filtered = submissions;
  if (filterCohort !== 'all') filtered = filtered.filter(s => s.cohort?.id === filterCohort);
  if (filterUnit !== 'all') filtered = filtered.filter(s => s.unit?.id === filterUnit);

  const counts = getTriageCounts(filtered);
  const atRiskStudents = getAtRiskStudents(filtered);

  const redSubs = filtered.filter(s => s.priorityFlag === 'red' && s.status === 'complete');
  const yellowSubs = filtered.filter(s => s.priorityFlag === 'yellow' && s.status === 'complete');
  const greenSubs = filtered.filter(s => s.priorityFlag === 'green' && s.status === 'complete');
  const pendingSubs = filtered.filter(s => s.status === 'pending' || s.status === 'processing');

  const isSysadmin = user.role === 'sysadmin';

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {isSysadmin ? '🏫 All Submissions' : `📋 My Uploads`}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {isSysadmin 
              ? 'Viewing all submissions across all teachers' 
              : 'Showing submissions you have uploaded'}
          </p>
        </div>
      </div>

      {/* Sysadmin: Uploader Stats */}
      {isSysadmin && Object.keys(uploaderStats).length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>📊 Uploads by Teacher</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Total</th>
                  <th>🔴 Review</th>
                  <th>🟡 Check</th>
                  <th>🟢 On Track</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(uploaderStats).map(([email, stats]) => (
                  <tr key={email}>
                    <td style={{ fontWeight: 500 }}>{email}</td>
                    <td>{stats.total}</td>
                    <td style={{ color: 'var(--color-red)' }}>{stats.red}</td>
                    <td style={{ color: 'var(--color-yellow)' }}>{stats.yellow}</td>
                    <td style={{ color: 'var(--color-green)' }}>{stats.green}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-number" style={{ color: 'var(--color-red)' }}>{counts.red}</div><div className="stat-label">🔴 Review</div></div>
        <div className="stat-card"><div className="stat-number" style={{ color: 'var(--color-yellow)' }}>{counts.yellow}</div><div className="stat-label">🟡 Check</div></div>
        <div className="stat-card"><div className="stat-number" style={{ color: 'var(--color-green)' }}>{counts.green}</div><div className="stat-label">🟢 On Track</div></div>
        <div className="stat-card"><div className="stat-number" style={{ color: 'var(--color-gray)' }}>{counts.pending}</div><div className="stat-label">⏳ Pending</div></div>
        <div className="stat-card"><div className="stat-number">{counts.total}</div><div className="stat-label">Total</div></div>
      </div>

      {/* At Risk */}
      {atRiskStudents.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid var(--color-red)', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--color-red)', marginBottom: '0.75rem' }}>⚠️ At Risk Students ({atRiskStudents.length})</h3>
          {atRiskStudents.map((ar, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: i < atRiskStudents.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div>
                <a href={`/dashboard/student/${ar.student.id}`} style={{ fontWeight: 600 }}>{ar.student.name}</a>
                <span style={{ color: '#64748b', fontSize: '0.8125rem', marginLeft: '0.5rem' }}>{ar.cohort?.name}</span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>{ar.reasons.join(' • ')}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="filters no-print">
        <select className="filter-select" value={filterCohort} onChange={e => setFilterCohort(e.target.value)}>
          <option value="all">All Cohorts</option>
          {COHORTS.map(c => <option key={c.id} value={c.id}>{getCohortShortName(c.id)}</option>)}
        </select>
        <select className="filter-select" value={filterUnit} onChange={e => setFilterUnit(e.target.value)}>
          <option value="all">All Units</option>
          {Object.values(UNITS).map(u => <option key={u.id} value={u.id}>Unit {u.number}: {u.title}</option>)}
        </select>
      </div>

      {/* Empty State */}
      {submissions.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📤</div>
          <h3 style={{ marginBottom: '0.5rem' }}>No submissions yet</h3>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>
            Upload student work to get started with AI-powered analysis
          </p>
          <a href="/setup" className="btn btn-primary">Upload First Submission →</a>
        </div>
      )}

      {/* RAG Sections */}
      {submissions.length > 0 && [
        { key: 'red', label: '🔴 Review — Priority Attention', subs: redSubs, color: 'var(--color-red)' },
        { key: 'yellow', label: '🟡 Check — Quick Review', subs: yellowSubs, color: 'var(--color-yellow)' },
        { key: 'green', label: '🟢 On Track — Mark with Confidence', subs: greenSubs, color: 'var(--color-green)' },
      ].map(section => (
        <div key={section.key} className="card" style={{ borderLeft: `4px solid ${section.color}` }}>
          <div className="section-header" onClick={() => toggleSection(section.key)}>
            <h3>{section.label} <span className="section-count">({section.subs.length})</span></h3>
            <span>{expandedSections[section.key] ? '▼' : '▶'}</span>
          </div>
          {expandedSections[section.key] && (
            section.subs.length > 0 ? (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Cohort</th>
                      <th>Unit / Assignment</th>
                      <th>Originality</th>
                      <th>Grade Est.</th>
                      {isSysadmin && <th>Uploaded By</th>}
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.subs.map(sub => (
                      <tr key={sub.id} className="clickable" onClick={() => window.location.href = `/dashboard/submission/${sub.id}`}>
                        <td style={{ fontWeight: 500 }}>{sub.student?.name || 'Unknown'}</td>
                        <td>{sub.cohortName}</td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{sub.unitTitle}</div>
                          <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                            {sub.isAdHoc && <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.125rem 0.375rem', borderRadius: '4px', fontSize: '0.6875rem', marginRight: '0.375rem' }}>Ad hoc</span>}
                            {sub.assignmentName}
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${sub.originalityScore >= 90 ? 'green' : sub.originalityScore >= 80 ? 'yellow' : 'red'}`}>
                            {sub.originalityScore}%
                          </span>
                        </td>
                        <td>
                          {sub.isAdHoc 
                            ? <span style={{ color: '#64748b', fontSize: '0.8125rem' }}>N/A</span>
                            : <span className={`grade-${sub.gradeEstimate?.toLowerCase()}`}>{sub.gradeEstimate}</span>
                          }
                        </td>
                        {isSysadmin && (
                          <td style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                            {sub.uploadedBy?.split('@')[0] || '—'}
                          </td>
                        )}
                        <td><span className="btn btn-sm">View →</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state"><p>No submissions in this category</p></div>
            )
          )}
        </div>
      ))}

      {/* Pending */}
      {pendingSubs.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid var(--color-gray)' }}>
          <h3>⏳ Pending Analysis ({pendingSubs.length})</h3>
          <div className="table-wrapper" style={{ marginTop: '0.75rem' }}>
            <table>
              <thead><tr><th>Student</th><th>Cohort</th><th>Assignment</th><th>Submitted</th></tr></thead>
              <tbody>
                {pendingSubs.map(sub => (
                  <tr key={sub.id}>
                    <td>{sub.student?.name}</td>
                    <td>{sub.cohortName}</td>
                    <td>{sub.unitTitle} — {sub.assignmentName}</td>
                    <td style={{ color: '#64748b', fontSize: '0.8125rem' }}>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="disclaimer" style={{ marginTop: '1.5rem' }}>
        <strong>⚠️ Important:</strong> This system provides indicators to help prioritise marking. It is not definitive proof of academic misconduct.
        Always use professional judgment and follow your institution's academic integrity policies.
      </div>
    </div>
  );
}
