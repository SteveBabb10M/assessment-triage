'use client';

import { useParams } from 'next/navigation';
import { getSubmissionById } from '../../../../data/submissions';

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
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem', maxWidth: '950px' }}>
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

      {/* Summary Metrics Table */}
      {sub.summaryMetrics ? (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 600 }}>📊 Summary</h3>
          <table style={{ width: '100%', fontSize: '0.875rem' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.5rem 0', fontWeight: 500, width: '40%' }}>Overall Originality</td>
                <td style={{ padding: '0.5rem 0', color: 'var(--color-red)', fontWeight: 600 }}>{sub.summaryMetrics.overallOriginality}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.5rem 0', fontWeight: 500 }}>AI Content Likelihood</td>
                <td style={{ padding: '0.5rem 0' }}>{sub.summaryMetrics.aiContentLikelihood}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.5rem 0', fontWeight: 500 }}>Probable AI Tool</td>
                <td style={{ padding: '0.5rem 0' }}>{sub.summaryMetrics.probableAITool}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.5rem 0', fontWeight: 500 }}>Student Understanding Demonstrated</td>
                <td style={{ padding: '0.5rem 0' }}>{sub.summaryMetrics.studentUnderstanding}</td>
              </tr>
              <tr>
                <td style={{ padding: '0.5rem 0', fontWeight: 500 }}>Academic Integrity Concern</td>
                <td style={{ padding: '0.5rem 0', color: 'var(--color-red)', fontWeight: 600 }}>{sub.summaryMetrics.academicIntegrityConcern}</td>
              </tr>
            </tbody>
          </table>
          <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '1rem', marginTop: '1rem', fontSize: '0.875rem' }}>
            {sub.summary}
          </div>
        </div>
      ) : (
        /* Fallback for simpler format submissions */
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
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }} className={`grade-${sub.gradeEstimate?.toLowerCase()}`}>{sub.gradeEstimate || '—'}</div>
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
      )}

      {/* Likely AI Tool Reasoning */}
      {sub.likelyAIToolReasoning && (
        <div className="card report-section">
          <h3>🤖 Likely AI Tool: {sub.likelyAITool}</h3>
          <p style={{ fontSize: '0.875rem', color: '#475569' }}>{sub.likelyAIToolReasoning}</p>
        </div>
      )}

      {/* Section-by-Section Analysis */}
      {sub.sectionAnalysis?.length > 0 && (
        <div className="card report-section">
          <h3>📄 Section-by-Section Analysis</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Section</th>
                  <th style={{ width: '15%' }}>Writing Quality</th>
                  <th style={{ width: '20%' }}>Likely Source</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {sub.sectionAnalysis.map((section, i) => (
                  <tr key={i} style={{ background: section.likelySource.toLowerCase().includes('ai') ? 'var(--color-red-bg)' : 'transparent' }}>
                    <td style={{ fontWeight: 500 }}>{section.section}</td>
                    <td>{section.quality}</td>
                    <td>
                      <span style={{ 
                        padding: '0.125rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.75rem',
                        background: section.likelySource.toLowerCase().includes('ai') ? 'var(--color-red)' : 
                                   section.likelySource.toLowerCase().includes('student') ? 'var(--color-green)' : 'var(--color-gray)',
                        color: 'white'
                      }}>
                        {section.likelySource}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: '#475569' }}>{section.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Phrase Analysis */}
      {sub.aiPhraseAnalysis?.length > 0 && (
        <div className="card report-section">
          <h3>🔍 AI Indicator Phrases Detected</h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.75rem' }}>
            ChatGPT-signature phrases appearing multiple times:
          </p>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Phrase</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Occurrences</th>
                  <th>Significance</th>
                </tr>
              </thead>
              <tbody>
                {sub.aiPhraseAnalysis.map((item, i) => (
                  <tr key={i}>
                    <td><code style={{ background: '#fef3c7', padding: '0.125rem 0.375rem', borderRadius: '4px', fontSize: '0.8125rem' }}>"{item.phrase}"</code></td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: item.occurrences >= 4 ? 'var(--color-red)' : 'var(--color-yellow)' }}>{item.occurrences}</td>
                    <td style={{ fontSize: '0.8125rem', color: '#475569' }}>{item.significance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vocabulary Inconsistencies */}
      {sub.vocabularyFlags?.length > 0 && (
        <div className="card report-section">
          <h3>📚 Vocabulary Inconsistencies</h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.75rem' }}>
            The following phrases are significantly beyond expected BTEC Level 3 vocabulary. A mid-to-low ability student would not naturally produce these:
          </p>
          {sub.vocabularyFlags.map((item, i) => (
            <div key={i} className="evidence-card evidence-high" style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', marginBottom: '0.5rem', color: '#1e293b' }}>
                {item.quote}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#dc2626' }}>
                ⚠️ {item.concern}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Copy-Paste Errors — MAJOR FLAG */}
      {sub.copyPasteErrors?.length > 0 && (
        <div className="card report-section" style={{ borderLeft: '4px solid var(--color-red)', background: 'var(--color-red-bg)' }}>
          <h3 style={{ color: 'var(--color-red)' }}>🚨 Copy-Paste Error Detected (Strong Evidence)</h3>
          {sub.copyPasteErrors.map((item, i) => (
            <div key={i} style={{ marginBottom: '1rem' }}>
              <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', marginBottom: '0.5rem', padding: '0.75rem', background: 'white', borderRadius: '6px', border: '1px solid var(--color-red-border)' }}>
                {item.text}
              </div>
              <div style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                <strong>Location:</strong> {item.location}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                {item.significance}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Additional Concerns */}
      {sub.additionalConcerns?.length > 0 && (
        <div className="card report-section">
          <h3>⚠️ Additional Concerns</h3>
          <ol style={{ paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
            {sub.additionalConcerns.map((concern, i) => (
              <li key={i} style={{ marginBottom: '0.5rem', color: '#475569' }}>{concern}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Authentic Elements */}
      {sub.authenticElements?.length > 0 && (
        <div className="card report-section">
          <h3>✓ Authentic Elements Identified</h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.75rem' }}>
            Evidence suggesting some genuine student work:
          </p>
          {sub.authenticElements.map((elem, i) => (
            <div key={i} className="evidence-card evidence-positive">{elem}</div>
          ))}
        </div>
      )}

      {/* Criteria Results */}
      {sub.criteriaResults && Object.keys(sub.criteriaResults).length > 0 && (
        <div className="card report-section">
          <h3>📋 Criteria Assessment — {sub.assignmentName}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem' }}>Grade Estimate:</span>
            <span className={`grade-${sub.gradeEstimate?.toLowerCase()}`} style={{ fontSize: '1.25rem' }}>{sub.gradeEstimate}</span>
          </div>
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

      {/* Recommendations */}
      {sub.recommendations?.length > 0 && (
        <div className="card report-section" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <h3>📋 Recommendations</h3>
          <ol style={{ paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
            {sub.recommendations.map((rec, i) => (
              <li key={i} style={{ marginBottom: '0.75rem', color: '#1e293b' }}>{rec}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Questions for Student */}
      {sub.questionsForStudent?.length > 0 && (
        <div className="card report-section" style={{ borderLeft: '4px solid #7c3aed' }}>
          <h3>❓ Suggested Questions for Student Conversation</h3>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.75rem' }}>
            Use these to assess understanding and verify authorship:
          </p>
          <ol style={{ paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
            {sub.questionsForStudent.map((q, i) => (
              <li key={i} style={{ marginBottom: '0.5rem', fontStyle: 'italic', color: '#1e293b' }}>"{q}"</li>
            ))}
          </ol>
        </div>
      )}

      {/* Legacy flags display for older format */}
      {sub.flags?.length > 0 && !sub.sectionAnalysis && (
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

      {/* Disclaimer */}
      <div className="disclaimer" style={{ marginTop: '1.5rem' }}>
        <strong>⚠️ Important:</strong> This report is generated by AI analysis and provides indicators only. It is not definitive proof of academic misconduct.
        Always use professional judgment and follow your institution's academic integrity policies.
      </div>

      {/* Actions */}
      <div className="no-print" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
        <button className="btn" onClick={() => window.print()}>🖨️ Print Report</button>
        <a href={`/dashboard/student/${sub.studentId}`} className="btn">View Student Profile</a>
        <a href="/dashboard" className="btn btn-primary">Back to Dashboard</a>
      </div>
    </div>
  );
}
