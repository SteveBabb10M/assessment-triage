'use client';

import { useParams } from 'next/navigation';
import { getSubmissionById } from '../../../../data/submissions';
import { getCohortShortName } from '../../../../data/staff';

export default function SubmissionReport() {
  const params = useParams();
  const sub = getSubmissionById(params.id);

  if (!sub) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="card"><p>Submission not found</p><a href="/dashboard" className="btn btn-primary mt-4">Back to Dashboard</a></div>
      </div>
    );
  }

  const flagBadge = { red: 'badge-red', yellow: 'badge-yellow', green: 'badge-green' }[sub.priorityFlag] || 'badge-gray';
  const flagLabel = { red: '🔴 Review', yellow: '🟡 Check', green: '🟢 On Track' }[sub.priorityFlag] || '⏳ Pending';

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem', maxWidth: '900px' }}>
      <a href="/dashboard" style={{ color: '#64748b', fontSize: '0.875rem' }}>← Back to Dashboard</a>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Submission Report</h1>
          <p style={{ color: '#64748b' }}>
            <a href={`/dashboard/student/${sub.studentId}`} style={{ fontWeight: 600 }}>{sub.student?.name}</a>
            {' • '}{sub.cohortName} • {sub.unitTitle}
          </p>
        </div>
        <span className={`badge ${flagBadge}`} style={{ fontSize: '0.875rem', padding: '0.375rem 1rem' }}>{flagLabel}</span>
      </div>

      {/* Co-teaching notice */}
      {sub.coTeachers?.length > 1 && (
        <div style={{ background: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <strong>👥 Co-taught unit:</strong> This submission is visible to {sub.coTeachers.map(t => t.name).join(' and ')}. Coordinate before taking action.
        </div>
      )}

      {/* Summary Card */}
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Originality</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: sub.originalityScore >= 90 ? 'var(--color-green)' : sub.originalityScore >= 80 ? 'var(--color-yellow)' : 'var(--color-red)' }}>
              {sub.originalityScore != null ? `${sub.originalityScore}%` : '—'}
            </div>
            {sub.originalityVerdict && <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>{sub.originalityVerdict}</div>}
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Grade Estimate</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }} className={`grade-${sub.gradeEstimate?.toLowerCase()}`}>
              {sub.gradeEstimate || '—'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Word Count</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{sub.wordCount?.toLocaleString() || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Likely AI Tool</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{sub.likelyAITool || 'None detected'}</div>
            {sub.confidenceLevel && <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Confidence: {sub.confidenceLevel}</div>}
          </div>
        </div>
        <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1rem', fontSize: '0.875rem' }}>
          <strong>Summary:</strong> {sub.summary}
        </div>
      </div>

      {/* Criteria Results */}
      {sub.criteriaResults && Object.keys(sub.criteriaResults).length > 0 && (
        <div className="card report-section">
          <h3>Criteria Assessment — {sub.assignmentName}</h3>
          <div className="criteria-grid" style={{ gap: '0.5rem' }}>
            {Object.entries(sub.criteriaResults).map(([criterion, status]) => (
              <div key={criterion} className={`criteria-chip criteria-${status === 'met' ? 'met' : status === 'partial' ? 'partial' : 'not-met'}`}
                style={{ padding: '0.375rem 0.75rem' }}>
                <strong>{criterion}</strong>: {status === 'met' ? '✓ Met' : status === 'partial' ? '◐ Partial' : '✗ Not met'}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flags / Concerns */}
      {sub.flags?.length > 0 && (
        <div className="card report-section">
          <h3>🚩 Concerns Identified</h3>
          {sub.flags.map((flag, i) => (
            <div key={i} className={`evidence-card evidence-${flag.severity}`}>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem', textTransform: 'capitalize' }}>{flag.type.replace(/_/g, ' ')}</div>
              <div>{flag.message}</div>
            </div>
          ))}
        </div>
      )}

      {/* Authentic Elements */}
      {sub.authenticElements?.length > 0 && (
        <div className="card report-section">
          <h3>✓ Authentic Elements</h3>
          {sub.authenticElements.map((elem, i) => (
            <div key={i} className="evidence-card evidence-positive">{elem}</div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {sub.recommendations?.length > 0 && (
        <div className="card report-section">
          <h3>📋 Recommendations</h3>
          {sub.recommendations.map((rec, i) => (
            <div key={i} style={{ padding: '0.5rem 0', borderBottom: i < sub.recommendations.length - 1 ? '1px solid #f1f5f9' : 'none', fontSize: '0.875rem' }}>
              {rec}
            </div>
          ))}
        </div>
      )}

      {/* Questions for Student */}
      {sub.questionsForStudent?.length > 0 && (
        <div className="card report-section">
          <h3>❓ Suggested Questions for Student</h3>
          {sub.questionsForStudent.map((q, i) => (
            <div key={i} style={{ padding: '0.5rem 0', borderBottom: i < sub.questionsForStudent.length - 1 ? '1px solid #f1f5f9' : 'none', fontSize: '0.875rem', fontStyle: 'italic' }}>
              "{q}"
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="disclaimer">
        <strong>⚠️ Important:</strong> This report is generated by AI analysis and provides indicators only. It is not definitive proof of academic misconduct.
        Always use professional judgment and follow your institution's academic integrity policies.
      </div>

      {/* Actions */}
      <div className="no-print" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
        <a href={`/dashboard/student/${sub.studentId}`} className="btn">View Student Profile</a>
        <a href="/dashboard" className="btn btn-primary">Back to Dashboard</a>
      </div>
    </div>
  );
}
