'use client';

import { useParams } from 'next/navigation';
import { getSubmissionById, markReviewed } from '../../../../data/submissions';
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
  const analysis = sub.detailedOriginalityAnalysis;

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem', maxWidth: '900px' }}>
      {/* Back link */}
      <a href="/dashboard" style={{ color: '#64748b', fontSize: '0.875rem' }}>← Back to Dashboard</a>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Submission Report
          </h1>
          <p style={{ color: '#64748b' }}>
            {sub.student?.name} • {sub.groupFullName}
          </p>
        </div>
        <button onClick={() => window.print()} className="btn btn-secondary no-print">
          🖨️ Print
        </button>
      </div>

      {/* Submission Info */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unit</div>
            <div style={{ fontWeight: 600 }}>Unit {sub.assignment?.unitNumber}: {sub.assignment?.unitTitle}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assignment</div>
            <div style={{ fontWeight: 600 }}>{sub.assignment?.name}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submitted</div>
            <div style={{ fontWeight: 600 }}>
              {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              }) : 'Unknown'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Word Count</div>
            <div style={{ fontWeight: 600 }}>{sub.wordCount?.toLocaleString() || '—'}</div>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="card" style={{ 
        borderLeft: `4px solid var(--color-${flagColor})`,
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {flagColor === 'red' ? '🔴' : flagColor === 'yellow' ? '🟡' : '🟢'}
          Executive Summary
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ textAlign: 'center', padding: '1.25rem', background: '#f8fafc', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Originality</div>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: 700,
              color: sub.originalityScore < 80 ? 'var(--color-red)' : sub.originalityScore < 90 ? 'var(--color-yellow)' : 'var(--color-green)'
            }}>
              {sub.originalityScore}%
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
              {sub.originalityVerdict || (sub.originalityScore < 80 ? 'High concern' : sub.originalityScore < 90 ? 'Moderate concern' : 'Appears authentic')}
            </div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1.25rem', background: '#f8fafc', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Grade Estimate</div>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 700,
              color: sub.gradeEstimate === 'Fail' ? 'var(--color-red)' : 
                     sub.gradeEstimate === 'Pass' ? 'var(--color-yellow)' : 'var(--color-green)'
            }}>
              {sub.gradeEstimate}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
              {sub.gradeEstimate === 'Fail' ? 'P criteria not met' : 
               sub.gradeEstimate === 'Pass' ? 'P met, M not met' :
               sub.gradeEstimate === 'Merit' ? 'P+M met, D not met' : 'All criteria met'}
            </div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1.25rem', background: '#f8fafc', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Likely Tool</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>
              {sub.likelyAITool || 'Unknown'}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
              {sub.confidenceLevel || 'Medium'} confidence
            </div>
          </div>
        </div>

        {sub.summary && (
          <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '1rem' }}>
            {sub.summary}
          </p>
        )}
      </div>

      {/* Detailed Originality Analysis */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
          🔍 Detailed Originality Analysis
        </h2>

        {analysis?.summary && (
          <p style={{ color: '#475569', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {analysis.summary}
          </p>
        )}

        {/* Key Evidence */}
        {analysis?.keyEvidence && analysis.keyEvidence.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-red)' }}>
              🚩 Key Evidence of Concern
            </h3>
            
            {analysis.keyEvidence.map((evidence, i) => (
              <div 
                key={i}
                style={{ 
                  marginBottom: '1rem',
                  padding: '1rem',
                  background: evidence.severity === 'High' ? '#fef2f2' : evidence.severity === 'Medium' ? '#fefce8' : '#f8fafc',
                  borderRadius: '8px',
                  borderLeft: `3px solid ${evidence.severity === 'High' ? 'var(--color-red)' : evidence.severity === 'Medium' ? 'var(--color-yellow)' : '#94a3b8'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <strong style={{ color: '#1e293b' }}>{evidence.type}</strong>
                  <span className={`badge badge-${evidence.severity === 'High' ? 'red' : evidence.severity === 'Medium' ? 'yellow' : 'gray'}`}>
                    {evidence.severity} severity
                  </span>
                </div>
                
                <p style={{ color: '#475569', marginBottom: '0.75rem' }}>
                  {evidence.description}
                </p>
                
                {evidence.examples && evidence.examples.length > 0 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.375rem', textTransform: 'uppercase' }}>Examples from submission:</div>
                    {evidence.examples.map((example, j) => (
                      <div key={j} style={{ 
                        padding: '0.625rem 0.875rem',
                        background: 'white',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        color: '#475569',
                        fontStyle: 'italic',
                        marginBottom: '0.375rem',
                        borderLeft: '2px solid #e2e8f0'
                      }}>
                        "{example}"
                      </div>
                    ))}
                  </div>
                )}
                
                {evidence.whyItMatters && (
                  <div style={{ fontSize: '0.875rem', color: '#64748b', fontStyle: 'italic' }}>
                    <strong>Why this matters:</strong> {evidence.whyItMatters}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Authentic Elements */}
        {analysis?.authenticElements && analysis.authenticElements.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-green)' }}>
              ✓ Authentic Elements Detected
            </h3>
            
            {analysis.authenticElements.map((elem, i) => (
              <div 
                key={i}
                style={{ 
                  marginBottom: '0.75rem',
                  padding: '1rem',
                  background: '#f0fdf4',
                  borderRadius: '8px',
                  borderLeft: '3px solid var(--color-green)'
                }}
              >
                <strong style={{ color: '#166534' }}>{elem.type}</strong>
                <p style={{ color: '#475569', marginTop: '0.375rem', marginBottom: elem.example ? '0.5rem' : 0 }}>
                  {elem.description}
                </p>
                {elem.example && (
                  <div style={{ 
                    padding: '0.5rem 0.75rem',
                    background: 'white',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    color: '#475569',
                    fontStyle: 'italic'
                  }}>
                    "{elem.example}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Fallback for old format flags */}
        {!analysis && sub.flags && sub.flags.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-red)' }}>
              🚩 Flags Identified
            </h3>
            {sub.flags.map((flag, i) => (
              <div key={i} style={{ 
                padding: '1rem',
                background: flag.severity === 'high' ? '#fef2f2' : '#fefce8',
                borderRadius: '8px',
                marginBottom: '0.5rem',
                borderLeft: `3px solid ${flag.severity === 'high' ? 'var(--color-red)' : 'var(--color-yellow)'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{flag.type?.replace(/_/g, ' ')}</strong>
                  <span className={`badge badge-${flag.severity === 'high' ? 'red' : 'yellow'}`}>{flag.severity}</span>
                </div>
                <p style={{ color: '#475569', marginTop: '0.25rem' }}>{flag.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section-by-Section Analysis */}
      {sub.sectionAnalysis && sub.sectionAnalysis.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
            📑 Section-by-Section Analysis
          </h2>
          
          {sub.sectionAnalysis.map((section, i) => (
            <div 
              key={i}
              style={{ 
                padding: '1rem',
                background: section.originalityAssessment === 'Likely AI' ? '#fef2f2' : 
                           section.originalityAssessment === 'Mixed' ? '#fefce8' : '#f8fafc',
                borderRadius: '8px',
                marginBottom: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong>{section.sectionTitle}</strong>
                <span className={`badge badge-${
                  section.originalityAssessment === 'Likely AI' ? 'red' : 
                  section.originalityAssessment === 'Mixed' ? 'yellow' : 'green'
                }`}>
                  {section.originalityAssessment}
                </span>
              </div>
              
              {section.concerns && section.concerns.length > 0 && (
                <div style={{ marginBottom: '0.5rem' }}>
                  {section.concerns.map((concern, j) => (
                    <div key={j} style={{ fontSize: '0.875rem', color: 'var(--color-red)', marginBottom: '0.25rem' }}>
                      ⚠️ {concern}
                    </div>
                  ))}
                </div>
              )}
              
              {section.positives && section.positives.length > 0 && (
                <div>
                  {section.positives.map((positive, j) => (
                    <div key={j} style={{ fontSize: '0.875rem', color: 'var(--color-green)', marginBottom: '0.25rem' }}>
                      ✓ {positive}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Criteria Assessment */}
      {sub.criteriaAssessment && Object.keys(sub.criteriaAssessment).length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            📋 Criteria Assessment
          </h2>
          <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.875rem' }}>
            Assignment covers: {sub.assignment?.criteria?.join(', ')}
          </p>

          {Object.entries(sub.criteriaAssessment).map(([criterion, assessment]) => (
            <div 
              key={criterion}
              style={{ 
                padding: '1rem',
                background: assessment.status === 'Met' ? '#f0fdf4' : 
                           assessment.status === 'Partially Met' ? '#fefce8' : '#fef2f2',
                borderRadius: '8px',
                marginBottom: '0.75rem',
                borderLeft: `3px solid ${
                  assessment.status === 'Met' ? 'var(--color-green)' : 
                  assessment.status === 'Partially Met' ? 'var(--color-yellow)' : 'var(--color-red)'
                }`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <strong style={{ fontSize: '1.1rem' }}>{criterion}</strong>
                <span className={`badge badge-${
                  assessment.status === 'Met' ? 'green' : 
                  assessment.status === 'Partially Met' ? 'yellow' : 'red'
                }`}>
                  {assessment.status === 'Met' ? '✓ Met' : assessment.status === 'Partially Met' ? '⚠ Partial' : '✗ Not Met'}
                </span>
              </div>
              
              {assessment.evidence && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Evidence:</span>
                  <p style={{ color: '#475569', fontSize: '0.875rem' }}>{assessment.evidence}</p>
                </div>
              )}
              
              {assessment.gaps && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Gaps:</span>
                  <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{assessment.gaps}</p>
                </div>
              )}
              
              {assessment.quote && (
                <div style={{ 
                  padding: '0.625rem 0.875rem',
                  background: 'white',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: '#475569',
                  fontStyle: 'italic',
                  borderLeft: '2px solid #e2e8f0'
                }}>
                  "{assessment.quote}"
                </div>
              )}
            </div>
          ))}

          {sub.gradeJustification && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              background: '#f8fafc', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Grade Justification:</strong>
              <p style={{ color: '#475569' }}>{sub.gradeJustification}</p>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      {sub.recommendations && sub.recommendations.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
            💡 Recommendations
          </h2>
          
          {sub.recommendations.map((rec, i) => (
            <div 
              key={i}
              style={{ 
                display: 'flex',
                gap: '1rem',
                padding: '1rem',
                background: rec.priority === 'High' ? '#fef2f2' : rec.priority === 'Medium' ? '#fefce8' : '#f8fafc',
                borderRadius: '8px',
                marginBottom: '0.75rem'
              }}
            >
              <div style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                background: rec.priority === 'High' ? 'var(--color-red)' : rec.priority === 'Medium' ? 'var(--color-yellow)' : '#94a3b8',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.75rem',
                flexShrink: 0
              }}>
                {i + 1}
              </div>
              <div>
                <strong style={{ color: '#1e293b' }}>{rec.action}</strong>
                {rec.reason && (
                  <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {rec.reason}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Questions for Student */}
      {sub.questionsForStudent && sub.questionsForStudent.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
            ❓ Suggested Questions for Student Discussion
          </h2>
          
          {sub.questionsForStudent.map((q, i) => (
            <div 
              key={i}
              style={{ 
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: '8px',
                marginBottom: '0.75rem'
              }}
            >
              <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                {i + 1}. "{q.question}"
              </div>
              
              {q.purpose && (
                <div style={{ fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                  <span style={{ color: '#94a3b8' }}>Purpose: </span>
                  <span style={{ color: '#475569' }}>{q.purpose}</span>
                </div>
              )}
              
              {q.expectedResponse && (
                <div style={{ fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>Expected response: </span>
                  <span style={{ color: '#475569' }}>{q.expectedResponse}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Local Analysis (Technical Details) */}
      {sub.localAnalysis && (
        <details style={{ marginBottom: '1.5rem' }}>
          <summary className="card" style={{ cursor: 'pointer', listStyle: 'none' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📊 Technical Analysis Details
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>(click to expand)</span>
            </h2>
          </summary>
          <div className="card" style={{ marginTop: '-1rem', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Word Count</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{sub.localAnalysis.wordCount?.toLocaleString()}</div>
              </div>
              <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Paragraphs</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{sub.localAnalysis.structure?.paragraphCount}</div>
              </div>
              <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Avg Sentence</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{sub.localAnalysis.structure?.avgSentenceLength} words</div>
              </div>
              <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Uniformity</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{sub.localAnalysis.structure?.uniformityScore}%</div>
              </div>
            </div>

            {sub.localAnalysis.foundPhrases?.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>AI Indicator Phrases Detected:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {sub.localAnalysis.foundPhrases.map((p, i) => (
                    <span key={i} className={`badge badge-${p.weight >= 3 ? 'red' : p.weight >= 2 ? 'yellow' : 'gray'}`}>
                      "{p.text}" ×{p.count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {sub.localAnalysis.copyPasteErrors?.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-red)' }}>Copy-Paste Errors:</h4>
                {sub.localAnalysis.copyPasteErrors.map((err, i) => (
                  <div key={i} style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    • <strong>{err.type}:</strong> "{err.found}"
                  </div>
                ))}
              </div>
            )}
          </div>
        </details>
      )}

      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        padding: '1.5rem', 
        background: 'white',
        borderRadius: '12px',
        color: '#94a3b8', 
        fontSize: '0.875rem',
        marginBottom: '1rem'
      }}>
        <p>Report generated: {new Date().toLocaleString('en-GB')}</p>
        <p style={{ marginTop: '0.5rem', maxWidth: '600px', margin: '0.5rem auto 0' }}>
          This report provides indicators for investigation only. It is not definitive proof of academic misconduct. 
          Always use professional judgment and follow your institution's academic integrity policies.
        </p>
      </div>

      {/* Actions */}
      <div className="no-print" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
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
