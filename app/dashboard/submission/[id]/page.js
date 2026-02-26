'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function SubmissionReport() {
  const params = useParams();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSubmission() {
      try {
        const res = await fetch(`/api/submissions/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setSub(data.submission);
        } else if (res.status === 404) {
          setError('not_found');
        } else if (res.status === 401) {
          setError('unauthorized');
        } else {
          setError('server_error');
        }
      } catch (err) {
        console.error('Failed to fetch submission:', err);
        setError('network_error');
      } finally {
        setLoading(false);
      }
    }
    fetchSubmission();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading submission report...</p>
      </div>
    );
  }

  if (error || !sub) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="card">
          <p>{error === 'unauthorized' ? 'Please log in to view this submission' : 'Submission not found'}</p>
          <a href="/dashboard" className="btn btn-primary mt-4">Back to Dashboard</a>
        </div>
      </div>
    );
  }

  const isV2 = sub.reportVersion === 2;
  const oa = sub.originalityAssessment || {};
  const ha = sub.holisticAssessment || {};
  const flagBadge = { red: 'badge-red', yellow: 'badge-yellow', green: 'badge-green' }[sub.priorityFlag] || 'badge-gray';
  const flagLabel = { red: '🔴 REVIEW', yellow: '🟡 CHECK', green: '🟢 ON TRACK' }[sub.priorityFlag] || '⏳ Pending';

  // Verdict colour
  const verdictColour = oa.overallVerdict?.includes('Largely Authentic') ? 'var(--color-green)' :
    oa.overallVerdict?.includes('Some Concerns') ? 'var(--color-yellow)' :
    'var(--color-red)';

  // Grade colour helper
  const gradeColour = (grade) => {
    if (!grade) return '#64748b';
    const g = grade.toLowerCase();
    if (g.includes('distinction')) return '#7c3aed';
    if (g.includes('merit')) return '#f59e0b';
    if (g.includes('pass')) return '#22c55e';
    if (g.includes('referral') || g.includes('fail')) return '#ef4444';
    return '#64748b';
  };

  // Provisional grade badge for criteria
  const criteriaGradeBadge = (grade) => {
    const colours = {
      'Met': { bg: '#dcfce7', text: '#166534', label: '✓ Met' },
      'Partially met': { bg: '#fef3c7', text: '#92400e', label: '◐ Partially met' },
      'Not yet met': { bg: '#fee2e2', text: '#991b1b', label: '✗ Not yet met' },
      'Not evidenced': { bg: '#f1f5f9', text: '#475569', label: '— Not evidenced' },
    };
    const c = colours[grade] || colours['Not evidenced'];
    return <span style={{ background: c.bg, color: c.text, padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>{c.label}</span>;
  };

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem', maxWidth: '950px' }}>
      <a href="/dashboard" style={{ color: '#64748b', fontSize: '0.875rem' }}>← Back to Dashboard</a>

      {/* ═══ HEADER ═══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {sub.student?.name || 'Unknown Student'}
          </h1>
          <p style={{ color: '#64748b' }}>
            {sub.cohortName} &bull; {sub.unitTitle}
            {sub.assignmentName && !sub.isAdHoc && <> &bull; {sub.assignmentName}</>}
          </p>
          {sub.wordCount && <p style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>{sub.wordCount.toLocaleString()} words &bull; Submitted {new Date(sub.submittedAt).toLocaleDateString('en-GB')}</p>}
        </div>
        <span className={`badge ${flagBadge}`} style={{ fontSize: '0.875rem', padding: '0.375rem 1rem' }}>{flagLabel}</span>
      </div>

      {/* Resources used indicator */}
      {sub.resourcesUsed?.length > 0 && (
        <div style={{ background: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: '8px', padding: '0.625rem 1rem', marginBottom: '1rem', fontSize: '0.8125rem' }}>
          <strong>📚 Resources referenced:</strong> {sub.resourcesUsed.map(r => r.label).join(', ')} — analysis calibrated against teacher-provided guidance
        </div>
      )}

      {/* Ad hoc notice */}
      {sub.isAdHoc && (
        <div style={{ background: '#fef3c7', border: '1px solid #fde047', borderRadius: '8px', padding: '0.625rem 1rem', marginBottom: '1rem', fontSize: '0.8125rem' }}>
          <strong>📝 Ad hoc submission</strong> — Originality analysis only. No marking guide available for criteria assessment.
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
           PART A: ORIGINALITY ASSESSMENT
           ═══════════════════════════════════════════════════════════ */}

      <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Part A: Originality Assessment</h2>

        {/* Verdict banner */}
        {isV2 && oa.overallVerdict && (
          <div style={{ background: 'white', border: `2px solid ${verdictColour}`, borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: verdictColour, marginBottom: '0.5rem' }}>
              {oa.overallVerdict}
            </div>
            {oa.summary && <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0 }}>{oa.summary}</p>}
          </div>
        )}

        {/* Summary metrics */}
        {sub.summaryMetrics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Originality</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: sub.originalityScore >= 80 ? 'var(--color-green)' : sub.originalityScore >= 60 ? 'var(--color-yellow)' : 'var(--color-red)' }}>
                {sub.originalityScore != null ? `${sub.originalityScore}%` : '—'}
              </div>
            </div>
            <div style={{ background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>AI Likelihood</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{sub.summaryMetrics.aiContentLikelihood || '—'}</div>
            </div>
            <div style={{ background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Probable Tool</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{sub.summaryMetrics.probableAITool || 'None detected'}</div>
            </div>
            <div style={{ background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Integrity Concern</div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: sub.summaryMetrics.academicIntegrityConcern?.includes('Yes') ? 'var(--color-red)' : 'var(--color-green)' }}>
                {sub.summaryMetrics.academicIntegrityConcern || '—'}
              </div>
            </div>
          </div>
        )}

        {/* AI tool reasoning */}
        {isV2 && oa.likelyAIToolReasoning && (
          <div className="card" style={{ marginBottom: '0.75rem', padding: '0.875rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>🤖 AI Tool Analysis: {oa.likelyAITool || 'None detected'}</h4>
            <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0 }}>{oa.likelyAIToolReasoning}</p>
          </div>
        )}

        {/* Humanizer markers */}
        {isV2 && oa.humanizerMarkers?.length > 0 && (
          <div className="card" style={{ marginBottom: '0.75rem', padding: '0.875rem', borderLeft: '4px solid #f59e0b' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>🔍 Humanizer Detection Markers</h4>
            {oa.humanizerMarkers.map((m, i) => (
              <div key={i} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: i < oa.humanizerMarkers.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.25rem' }}>{m.marker}</div>
                <div style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '0.25rem' }}>{m.evidence}</div>
                <div style={{ fontSize: '0.75rem', color: '#92400e', fontStyle: 'italic' }}>{m.significance}</div>
              </div>
            ))}
          </div>
        )}

        {/* Direct AI markers */}
        {isV2 && oa.directAIMarkers?.length > 0 && (
          <div className="card" style={{ marginBottom: '0.75rem', padding: '0.875rem', borderLeft: '4px solid var(--color-red)' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-red)' }}>🚨 Direct AI Generation Markers</h4>
            {oa.directAIMarkers.map((m, i) => (
              <div key={i} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: i < oa.directAIMarkers.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.25rem' }}>{m.marker}</div>
                <div style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '0.25rem' }}>{m.evidence}</div>
                <div style={{ fontSize: '0.75rem', color: '#dc2626', fontStyle: 'italic' }}>{m.significance}</div>
              </div>
            ))}
          </div>
        )}

        {/* Authentic indicators */}
        {isV2 && oa.authenticIndicators?.length > 0 && (
          <div className="card" style={{ marginBottom: '0.75rem', padding: '0.875rem', borderLeft: '4px solid var(--color-green)' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>✓ Authentic Student Indicators</h4>
            {oa.authenticIndicators.map((ind, i) => (
              <div key={i} style={{ fontSize: '0.8125rem', color: '#374151', marginBottom: '0.375rem', paddingLeft: '0.75rem', borderLeft: '2px solid #86efac' }}>{ind}</div>
            ))}
          </div>
        )}

        {/* Vocabulary flags */}
        {oa.vocabularyFlags?.length > 0 && (
          <div className="card" style={{ marginBottom: '0.75rem', padding: '0.875rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>📚 Vocabulary Inconsistencies</h4>
            {oa.vocabularyFlags.map((item, i) => (
              <div key={i} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: '#fefce8', borderRadius: '6px' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>&ldquo;{item.quote}&rdquo;</div>
                <div style={{ fontSize: '0.75rem', color: '#dc2626' }}>⚠️ {item.concern}</div>
              </div>
            ))}
          </div>
        )}

        {/* Copy-paste indicators */}
        {oa.copyPasteIndicators?.length > 0 && (
          <div className="card" style={{ marginBottom: '0.75rem', padding: '0.875rem', background: '#fef2f2', borderLeft: '4px solid var(--color-red)' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-red)', marginBottom: '0.5rem' }}>🚨 Copy-Paste Indicators</h4>
            {oa.copyPasteIndicators.map((item, i) => (
              <div key={i} style={{ marginBottom: '0.5rem' }}>
                <div style={{ fontStyle: 'italic', fontSize: '0.8125rem', padding: '0.5rem', background: 'white', borderRadius: '4px', marginBottom: '0.25rem' }}>{item.text}</div>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}><strong>Location:</strong> {item.location} — {item.significance}</div>
              </div>
            ))}
          </div>
        )}

        {/* Research quality notes */}
        {isV2 && oa.researchQualityNotes && (
          <div style={{ fontSize: '0.8125rem', color: '#475569', background: 'white', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <strong>📖 Research Quality:</strong> {oa.researchQualityNotes}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
           PART B: HOLISTIC QUALITY ASSESSMENT
           ═══════════════════════════════════════════════════════════ */}

      {isV2 && ha.criteriaAssessments && !sub.isAdHoc && (
        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Part B: Holistic Quality Assessment</h2>

          {/* Assessment approach & overview */}
          {ha.assessmentApproach && (
            <p style={{ fontSize: '0.8125rem', color: '#64748b', fontStyle: 'italic', marginBottom: '0.75rem' }}>{ha.assessmentApproach}</p>
          )}
          {ha.documentOverview && (
            <p style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '1rem' }}>{ha.documentOverview}</p>
          )}

          {/* Overall grade banner */}
          <div style={{ background: 'white', border: `2px solid ${gradeColour(ha.overallGrade)}`, borderRadius: '8px', padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Overall Provisional Grade</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: gradeColour(ha.overallGrade) }}>{ha.overallGrade}</div>
            </div>
            {ha.gradeJustification && <p style={{ fontSize: '0.8125rem', color: '#475569', maxWidth: '60%', margin: 0, textAlign: 'right' }}>{ha.gradeJustification}</p>}
          </div>

          {/* Conditional note */}
          {ha.conditionalNote && (
            <div style={{ background: '#fef3c7', border: '1px solid #fde047', borderRadius: '8px', padding: '0.625rem 1rem', marginBottom: '1rem', fontSize: '0.8125rem' }}>
              <strong>⚠️ Conditional:</strong> {ha.conditionalNote}
            </div>
          )}

          {/* Criteria assessments table */}
          <div className="card" style={{ marginBottom: '1rem', padding: '0' }}>
            <div className="table-wrapper">
              <table style={{ fontSize: '0.8125rem' }}>
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>Criterion</th>
                    <th>Evidence Present</th>
                    <th>Gaps</th>
                    <th style={{ width: '120px' }}>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {ha.criteriaAssessments.map((ca, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700, fontSize: '0.875rem' }}>{ca.criterion}</td>
                      <td style={{ color: '#374151' }}>{ca.evidencePresent}</td>
                      <td style={{ color: '#dc2626' }}>{ca.gaps || '—'}</td>
                      <td>{criteriaGradeBadge(ca.provisionalGrade)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scaffolding alignment */}
          {ha.scaffoldingAlignment && (
            <div style={{ background: '#ede9fe', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.8125rem' }}>
              <strong>📐 Scaffolding Alignment:</strong> {ha.scaffoldingAlignment}
            </div>
          )}

          {/* What Went Well */}
          {ha.whatWentWell && (
            <div className="card" style={{ marginBottom: '1rem', padding: '1rem', borderLeft: '4px solid var(--color-green)' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.5rem', color: '#166534' }}>✅ What Went Well</h4>
              <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0, lineHeight: '1.6' }}>{ha.whatWentWell}</p>
            </div>
          )}

          {/* Even Better If */}
          {ha.evenBetterIf && (
            <div className="card" style={{ marginBottom: '1rem', padding: '1rem', borderLeft: '4px solid #f59e0b' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.5rem', color: '#92400e' }}>🔶 Even Better If</h4>
              <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0, lineHeight: '1.6' }}>{ha.evenBetterIf}</p>
            </div>
          )}

          {/* Priority Actions */}
          {ha.priorityActions?.length > 0 && (
            <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--color-primary)' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: '0.75rem' }}>📋 Priority Actions for Improvement</h4>
              <ol style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', margin: 0 }}>
                {ha.priorityActions.map((action, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem', color: '#1e293b', lineHeight: '1.5' }}>{action}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
           VERIFICATION & ACTIONS
           ═══════════════════════════════════════════════════════════ */}

      {/* Verification questions */}
      {sub.questionsForStudent?.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem', borderLeft: '4px solid #7c3aed' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>❓ Suggested Verification Questions</h3>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
            Use these in conversation with the student to assess understanding and verify authorship:
          </p>
          <ol style={{ paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
            {sub.questionsForStudent.map((q, i) => (
              <li key={i} style={{ marginBottom: '0.5rem', fontStyle: 'italic', color: '#1e293b' }}>&ldquo;{q}&rdquo;</li>
            ))}
          </ol>
        </div>
      )}

      {/* Teacher recommendations — only for v1, v2 has these in Part B */}
      {!isV2 && sub.recommendations?.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>📌 Recommended Actions</h3>
          <ol style={{ paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
            {sub.recommendations.map((rec, i) => (
              <li key={i} style={{ marginBottom: '0.5rem', color: '#1e293b' }}>{rec}</li>
            ))}
          </ol>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
           LEGACY REPORT SECTIONS (v1 backward compatibility)
           ═══════════════════════════════════════════════════════════ */}

      {!isV2 && sub.sectionAnalysis?.length > 0 && (
        <div className="card report-section">
          <h3>📄 Section-by-Section Analysis</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Section</th><th>Quality</th><th>Likely Source</th><th>Notes</th></tr></thead>
              <tbody>
                {sub.sectionAnalysis.map((section, i) => (
                  <tr key={i} style={{ background: section.likelySource?.toLowerCase().includes('ai') ? 'var(--color-red-bg)' : 'transparent' }}>
                    <td style={{ fontWeight: 500 }}>{section.section}</td>
                    <td>{section.quality}</td>
                    <td><span style={{ padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', background: section.likelySource?.toLowerCase().includes('ai') ? 'var(--color-red)' : 'var(--color-green)', color: 'white' }}>{section.likelySource}</span></td>
                    <td style={{ fontSize: '0.8125rem', color: '#475569' }}>{section.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isV2 && sub.authenticElements?.length > 0 && (
        <div className="card report-section">
          <h3>✓ Authentic Elements</h3>
          {sub.authenticElements.map((elem, i) => (
            <div key={i} className="evidence-card evidence-positive">{elem}</div>
          ))}
        </div>
      )}

      {!isV2 && sub.criteriaResults && Object.keys(sub.criteriaResults).length > 0 && !sub.isAdHoc && (
        <div className="card report-section">
          <h3>📋 Criteria Assessment</h3>
          <div className="criteria-grid" style={{ gap: '0.5rem' }}>
            {Object.entries(sub.criteriaResults).map(([criterion, status]) => (
              <div key={criterion} className={`criteria-chip criteria-${status === 'met' ? 'met' : status === 'partial' ? 'partial' : 'not-met'}`} style={{ padding: '0.375rem 0.75rem' }}>
                <strong>{criterion}</strong>: {status === 'met' ? '✓ Met' : status === 'partial' ? '◐ Partial' : '✗ Not met'}
              </div>
            ))}
          </div>
        </div>
      )}

      {!isV2 && sub.flags?.length > 0 && (
        <div className="card report-section">
          <h3>🚩 Concerns</h3>
          {sub.flags.map((flag, i) => (
            <div key={i} className={`evidence-card evidence-${flag.severity}`}>
              <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{flag.type.replace(/_/g, ' ')}</div>
              <div>{flag.message}</div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ DISCLAIMER ═══ */}
      <div className="disclaimer" style={{ marginTop: '1.5rem' }}>
        <strong>⚠️ Important:</strong> This report is generated by AI analysis and provides indicators only. It is not definitive proof of academic misconduct or a final grade.
        Always use professional judgement and follow your institution&apos;s academic integrity policies. Grades are provisional and subject to internal verification.
      </div>

      {/* ═══ ACTIONS ═══ */}
      <div className="no-print" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
        <button className="btn" onClick={() => window.print()}>🖨️ Print Report</button>
        <a href={`/dashboard/student/${sub.studentId}`} className="btn">View Student Profile</a>
        <a href="/dashboard" className="btn btn-primary">Back to Dashboard</a>
      </div>
    </div>
  );
}
