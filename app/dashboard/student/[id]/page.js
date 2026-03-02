'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getStudentById, getCohortById, getCohortShortName } from '../../../../data/staff';

export default function StudentProfile() {
  const params = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const student = getStudentById(params.id);

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const res = await fetch(`/api/students/${params.id}/submissions`);
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data.submissions || []);
        }
      } catch (err) {
        console.error('Failed to fetch student submissions:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSubmissions();
  }, [params.id]);

  if (!student) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="card"><p>Student not found</p><a href="/dashboard" className="btn btn-primary mt-4">Back to Dashboard</a></div>
      </div>
    );
  }

  const cohort = getCohortById(student.cohortId);
  const hasAtRisk = submissions.some(s => s.status === 'complete' && ((s.originalityScore != null && s.originalityScore < 80) || s.gradeEstimate === 'Fail'));

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem', maxWidth: '900px' }}>
      <a href="/dashboard" style={{ color: '#64748b', fontSize: '0.875rem' }}>← Back to Dashboard</a>

      {/* Student header */}
      <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{student.name}</h1>
          {hasAtRisk && <span className="badge badge-red">⚠️ At Risk</span>}
        </div>
        <p style={{ color: '#64748b' }}>{getCohortShortName(student.cohortId)}</p>
      </div>

      {/* Summary stats */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-number">{loading ? '…' : submissions.length}</div>
          <div className="stat-label">Submissions</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: 'var(--color-red)' }}>
            {loading ? '…' : submissions.filter(s => s.priorityFlag === 'red').length}
          </div>
          <div className="stat-label">🔴 Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: 'var(--color-yellow)' }}>
            {loading ? '…' : submissions.filter(s => s.priorityFlag === 'yellow').length}
          </div>
          <div className="stat-label">🟡 Check</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: 'var(--color-green)' }}>
            {loading ? '…' : submissions.filter(s => s.priorityFlag === 'green').length}
          </div>
          <div className="stat-label">🟢 On Track</div>
        </div>
      </div>

      {/* Submissions table */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Submission History</h3>
        {loading ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '1rem' }}>Loading submissions...</p>
        ) : submissions.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Unit / Assignment</th><th>Status</th><th>Originality</th><th>Grade Est.</th><th>Submitted</th><th></th></tr>
              </thead>
              <tbody>
                {submissions.map(sub => (
                  <tr key={sub.id} className="clickable" onClick={() => window.location.href = `/dashboard/submission/${sub.id}`}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{sub.unitTitle}</div>
                      <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                        {sub.isAdHoc && <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.125rem 0.375rem', borderRadius: '4px', fontSize: '0.6875rem', marginRight: '0.375rem' }}>Ad hoc</span>}
                        {sub.assignmentName}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${sub.priorityFlag || 'gray'}`}>
                        {{ red: '🔴 Review', yellow: '🟡 Check', green: '🟢 On Track' }[sub.priorityFlag] || '⏳ Pending'}
                      </span>
                    </td>
                    <td>{sub.originalityScore != null ? `${sub.originalityScore}%` : '—'}</td>
                    <td><span className={`grade-${sub.gradeEstimate?.toLowerCase()}`}>{sub.gradeEstimate || '—'}</span></td>
                    <td style={{ fontSize: '0.8125rem', color: '#64748b' }}>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                    <td><span className="btn btn-sm">View →</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p>No submissions yet for this student</p>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <a href="/dashboard" className="btn btn-primary">Back to Dashboard</a>
      </div>
    </div>
  );
}
