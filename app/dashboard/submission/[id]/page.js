'use client';

import { useParams } from 'next/navigation';
import { getSubmission } from '../../../../data/submissions';

export default function SubmissionReport() {
  const params = useParams();
  const sub = getSubmission(params.id);

  if (!sub) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="card">
          <p>Submission not found</p>
          <a href="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Dashboard</a>
        </div>
      </div>
    );
  }

  const analysis = sub.analysis;
  const ragColors = { RED: '#dc2626', AMBER: '#f59e0b', GREEN: '#16a34a' };
  const ragEmoji = { RED: '🔴', AMBER: '🟡', GREEN: '🟢' };

  return (
    <div className="container" style={{ maxWidth: '900px', paddingBottom: '3rem' }}>
      <a href="/dashboard" style={{ color: '#64748b', fontSize: '0.875rem' }}>← Back to Dashboard</a>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Submission Report</h1>
          <p className="page-subtitle">{sub.studentName}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '2rem' }}>{ragEmoji[sub.rag] || '⏳'}</span>
          <button onClick={() => window.print()} className="btn btn-secondary btn-sm no-print">🖨️ Print</button>
        </div>
      </div>

      {/* Overview card */}
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Assignment</div>
            <div style={{ fontWeight: 600 }}>{analysis?.assignmentTitle || sub.assignmentId}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Unit</div>
            <div style={{ fontWeight: 600 }}>Unit {analysis?.unitNumber}: {analysis?.unitTitle}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Submitted</div>
            <div style={{ fontWeight: 600 }}>
              {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Word Count</div>
            <div style={{ fontWeight: 600 }}>{analysis?.wordCount || '—'}</div>
          </div>
        </div>
      </div>

      {/* RAG + Grade summary */}
      <div className="stats-row">
        <div className="stat-card" style={{ borderTop: `4px solid ${ragColors[sub.rag] || '#94a3b8'}` }}>
          <div className="stat-number" style={{ color: ragColors[sub.rag] }}>{sub.rag || '—'}</div>
          <div className="stat-label">RAG Status</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{sub.originalityScore !== undefined ? `${sub.originalityScore}%` : '—'}</div>
          <div className="stat-label">Originality Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: sub.estimatedGrade === 'Fail' ? '#dc2626' : sub.estimatedGrade === 'Distinction' ? '#16a34a' : '#1e293b' }}>
            {sub.estimatedGrade || '—'}
          </div>
          <div className="stat-label">Estimated Grade</div>
        </div>
      </div>

      {/* Overall summary */}
      {analysis?.overallSummary && (
        <div className="card">
          <div className="report-section">
            <h3>📝 Overall Summary</h3>
            <p>{analysis.overallSummary}</p>
          </div>
          {analysis.keyStrengths && analysis.keyStrengths.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <strong style={{ color: '#16a34a' }}>Strengths:</strong>
              <ul style={{ marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                {analysis.keyStrengths.map((s, i) => <li key={i} style={{ fontSize: '0.9rem' }}>{s}</li>)}
              </ul>
            </div>
          )}
          {analysis.keyWeaknesses && analysis.keyWeaknesses.length > 0 && (
            <div style={{ marginTop: '0.75rem' }}>
              <strong style={{ color: '#dc2626' }}>Weaknesses:</strong>
              <ul style={{ marginTop: '0.25rem', paddingLeft: '1.25rem' }}>
                {analysis.keyWeaknesses.map((w, i) => <li key={i} style={{ fontSize: '0.9rem' }}>{w}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Originality Flags */}
      {analysis?.originalityFlags && analysis.originalityFlags.length > 0 && (
        <div className="card">
          <div className="report-section">
            <h3>🚩 Originality Flags ({analysis.originalityFlags.length})</h3>
            {analysis.originalityFlags.map((flag, i) => (
              <div key={i} className={`flag-item flag-${flag.severity}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <strong style={{ fontSize: '0.9rem' }}>
                    {flag.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </strong>
                  <span className={`badge badge-${flag.severity === 'high' ? 'red' : flag.severity === 'medium' ? 'amber' : 'gray'}`}>
                    {flag.severity}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>{flag.description}</p>
                {flag.evidence && (
                  <p style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                    "{flag.evidence}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Criteria Assessment */}
      {analysis?.criteriaAssessment && (
        <div className="card">
          <div className="report-section">
            <h3>📋 Criteria Assessment</h3>
            {Object.entries(analysis.criteriaAssessment).map(([criterionId, assessment]) => {
              const criterionDef = analysis.criteria?.[criterionId];
              return (
                <div key={criterionId} style={{ padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', flex: 1 }}>
                      <span style={{ fontWeight: 700, minWidth: '35px' }}>{criterionId}</span>
                      <span style={{ fontSize: '0.9rem' }}>{criterionDef?.text || ''}</span>
                    </div>
                    <span className={`badge ${assessment.met ? 'badge-green' : 'badge-red'}`} style={{ marginLeft: '0.5rem' }}>
                      {assessment.met ? '✓ Met' : '✗ Not Met'}
                    </span>
                  </div>
                  {assessment.evidence && (
                    <div style={{ marginLeft: '2.75rem', fontSize: '0.85rem' }}>
                      <strong style={{ color: '#16a34a' }}>Evidence: </strong>{assessment.evidence}
                    </div>
                  )}
                  {assessment.gaps && (
                    <div style={{ marginLeft: '2.75rem', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      <strong style={{ color: '#dc2626' }}>Gaps: </strong>{assessment.gaps}
                    </div>
                  )}
                  {assessment.feedback && (
                    <div style={{ marginLeft: '2.75rem', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      <strong style={{ color: '#2563eb' }}>Feedback: </strong>{assessment.feedback}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Technical Details */}
      {analysis?.technicalDetails && (
        <details className="card" style={{ cursor: 'pointer' }}>
          <summary style={{ fontWeight: 600, fontSize: '0.95rem' }}>🔧 Technical Details</summary>
          <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
            {Object.entries(analysis.technicalDetails).map(([key, value]) => (
              <div key={key} style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '0.375rem' }}>
                <span style={{ color: '#64748b' }}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}: </span>
                <strong>{String(value).replace(/_/g, ' ')}</strong>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* No analysis yet */}
      {!analysis && (
        <div className="card" style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>
          <p style={{ fontSize: '1.25rem' }}>⏳</p>
          <p>Analysis {sub.status === 'error' ? 'failed' : 'in progress'}...</p>
          {sub.error && <p style={{ color: '#dc2626', marginTop: '0.5rem' }}>{sub.error}</p>}
        </div>
      )}
    </div>
  );
}
