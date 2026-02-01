'use client';

import { useParams } from 'next/navigation';
import { getSubmissionById } from '../../../../data/submissions';
import { getGroupFullName } from '../../../../data/demo';

export default function SubmissionReport() {
  const params = useParams();
  const submissionId = params.id;
  
  const sub = getSubmissionById(submissionId);
  
  if (!sub) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="card">
          <p>Submission not found</p>
          <a href="/dashboard" className="btn btn-primary mt-4">Back to Dashboard</a>
        </div>
      </div>
    );
  }

  const flagColor = sub.priorityFlag || 'gray';

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      {/* Back link */}
      <a href="/dashboard" style={{ color: '#64748b', fontSize: '0.875rem' }}>← Back to Dashboard</a>
      
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Submission Report</h1>
          <p className="page-subtitle">
            {sub.student?.name} • {sub.groupFullName}
          </p>
        </div>
        <button onClick={() => window.print()} className="btn btn-secondary no-print">
          🖨️ Print Report
        </button>
      </div>

      {/* Meta info */}
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Unit</div>
            <div style={{ fontWeight: 600 }}>Unit {sub.assignment?.unitNumber}: {sub.assignment?.unitTitle}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Assignment</div>
            <div style={{ fontWeight: 600 }}>{sub.assignment?.name}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Submitted</div>
            <div style={{ fontWeight: 600 }}>
              {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
              }) : 'Unknown'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>File</div>
            <div style={{ fontWeight: 600 }}>{sub.fileName}</div>
          </div>
        </div>
      </div>

      {/* Overall Assessment */}
      <div className="card" style={{ borderLeft: `4px solid var(--color-${flagColor})` }}>
        <h2 className="card-title" style={{ marginBottom: '1.5rem' }}>Overall Assessment</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--color-gray-bg)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>ORIGINALITY</div>
            <div style={{ 
              fontSize: '3rem', 
              fontWeight: 700,
              color: sub.originalityScore < 80 ? 'var(--color-red)' : sub.originalityScore < 90 ? 'var(--color-yellow)' : 'var(--color-green)'
            }}>
              {sub.originalityScore}%
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <span className={`badge badge-${sub.originalityScore < 80 ? 'red' : sub.originalityScore < 90 ? 'yellow' : 'green'}`}>
                {sub.originalityScore < 80 ? '🔴 Below threshold' : sub.originalityScore < 90 ? '🟡 Monitor' : '🟢 Good'}
              </span>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--color-gray-bg)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>ESTIMATED GRADE</div>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 700,
              color: sub.gradeEstimate === 'Fail' ? 'var(--color-red)' : 
                     sub.gradeEstimate === 'Pass' ? 'var(--color-yellow)' : 'var(--color-green)'
            }}>
              {sub.gradeEstimate}
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <span className={`badge badge-${sub.gradeEstimate === 'Fail' ? 'red' : sub.gradeEstimate === 'Pass' ? 'yellow' : 'green'}`}>
                {sub.gradeEstimate === 'Fail' ? 'P criteria not met' : 
                 sub.gradeEstimate === 'Pass' ? 'M criteria not met' :
                 sub.gradeEstimate === 'Merit' ? 'D criteria not met' : 'All criteria met'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Originality Analysis */}
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '1rem' }}>Originality Analysis</h2>
        
        {sub.likelyAITool && (
          <div style={{ marginBottom: '1rem' }}>
            <span style={{ color: '#64748b' }}>Likely AI Tool: </span>
            <span className="badge badge-yellow">{sub.likelyAITool}</span>
          </div>
        )}

        {/* Red Flags */}
        {sub.flags && sub.flags.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-red)' }}>
              🚩 Red Flags Identified
            </h3>
            {sub.flags.map((flag, i) => (
              <div 
                key={i}
                style={{ 
                  padding: '1rem',
                  background: flag.severity === 'high' ? 'var(--color-red-bg)' : 
                              flag.severity === 'medium' ? 'var(--color-yellow-bg)' : 'var(--color-gray-bg)',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  borderLeft: `3px solid ${flag.severity === 'high' ? 'var(--color-red)' : 
                                          flag.severity === 'medium' ? 'var(--color-yellow)' : 'var(--color-gray)'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <strong style={{ textTransform: 'capitalize' }}>{flag.type?.replace(/_/g, ' ')}</strong>
                  <span className={`badge badge-${flag.severity === 'high' ? 'red' : flag.severity === 'medium' ? 'yellow' : 'gray'}`}>
                    {flag.severity}
                  </span>
                </div>
                <div style={{ color: '#475569' }}>{flag.message}</div>
              </div>
            ))}
          </div>
        )}

        {/* Authentic Elements */}
        {sub.authenticElements && sub.authenticElements.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-green)' }}>
              ✓ Authentic Elements Detected
            </h3>
            <ul style={{ paddingLeft: '1.5rem', color: '#475569' }}>
              {sub.authenticElements.map((elem, i) => (
                <li key={i} style={{ marginBottom: '0.375rem' }}>{elem}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Criteria Assessment */}
      {sub.criteriaResults && Object.keys(sub.criteriaResults).length > 0 && (
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1rem' }}>Criteria Assessment</h2>
          
          <p style={{ marginBottom: '1rem', color: '#64748b' }}>
            Assignment covers: {sub.assignment?.criteria?.join(', ')}
          </p>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Criteria</th>
                  <th style={{ width: '120px' }}>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(sub.criteriaResults).map(([crit, status]) => (
                  <tr key={crit}>
                    <td><strong>{crit}</strong></td>
                    <td>
                      <span className={`badge badge-${status === 'met' ? 'green' : status === 'partial' ? 'yellow' : 'red'}`}>
                        {status === 'met' ? '✓ Met' : status === 'partial' ? '⚠ Partial' : '✗ Not Met'}
                      </span>
                    </td>
                    <td style={{ color: '#64748b' }}>
                      {status === 'met' ? 'Criterion fully evidenced' :
                       status === 'partial' ? 'Some evidence, needs development' :
                       'Not evidenced in submission'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--color-gray-bg)', borderRadius: '8px' }}>
            <strong>Grade Calculation:</strong>
            <div style={{ color: '#475569', marginTop: '0.5rem' }}>
              {sub.gradeEstimate === 'Fail' && 'One or more Pass criteria not met → Grade limited to Fail'}
              {sub.gradeEstimate === 'Pass' && 'All Pass criteria met, but Merit criteria not fully met → Grade limited to Pass'}
              {sub.gradeEstimate === 'Merit' && 'All Pass and Merit criteria met, but Distinction criteria not fully met → Grade limited to Merit'}
              {sub.gradeEstimate === 'Distinction' && 'All criteria at all levels met → Distinction achieved'}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {sub.recommendations && sub.recommendations.length > 0 && (
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1rem' }}>💡 Recommendations</h2>
          <ol style={{ paddingLeft: '1.5rem', color: '#475569' }}>
            {sub.recommendations.map((rec, i) => (
              <li key={i} style={{ marginBottom: '0.5rem' }}>{rec}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Questions for Student */}
      {sub.questionsForStudent && sub.questionsForStudent.length > 0 && (
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1rem' }}>❓ Questions for the Student</h2>
          <ol style={{ paddingLeft: '1.5rem', color: '#475569' }}>
            {sub.questionsForStudent.map((q, i) => (
              <li key={i} style={{ marginBottom: '0.5rem' }}>{q}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Document Stats */}
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '1rem' }}>📊 Document Statistics</h2>
        <div className="stats-grid">
          <div style={{ padding: '1rem', background: 'var(--color-gray-bg)', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Word Count</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{sub.wordCount?.toLocaleString() || '—'}</div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {sub.summary && (
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1rem' }}>Summary</h2>
          <p style={{ color: '#475569', lineHeight: 1.6 }}>{sub.summary}</p>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
        <p>Report generated: {new Date().toLocaleString('en-GB')}</p>
        <p style={{ marginTop: '0.25rem' }}>
          This report provides indicators only. Always use professional judgment and follow your institution's academic integrity policies.
        </p>
      </div>

      {/* Actions */}
      <div className="no-print" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
        <a href={`/dashboard/student/${sub.studentId}`} className="btn btn-secondary">
          View Student Profile
        </a>
        <a href="/dashboard" className="btn btn-primary">
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
