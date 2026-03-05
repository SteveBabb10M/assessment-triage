'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

// ─── Report Template ────────────────────────────────────────
// This component IS the report template. Every section renders
// regardless of content. Empty sections show "No findings" or
// similar — they never disappear. The template is the constant,
// the content is the variable.

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

  // ── Resolve data source ──
  // v3+ reports use sub.report (structured). Older reports fall back to raw fields.
  const report = sub.report || null;
  const hasStructuredReport = !!report;

  // If we have a structured report, read from it. Otherwise fall back to raw fields.
  const triage = report?.triage || {};
  const forensics = report?.forensics || {};
  const originality = report?.originality || sub.originalityAssessment || {};
  const criteria = report?.criteriaAssessment || null;
  const questions = report?.verificationQuestions || sub.questionsForStudent || [];
  const meta = report?.metadata || {};

  // Triage badge
  const priorityFlag = triage.priorityFlag || sub.priorityFlag || 'yellow';
  const flagBadge = { red: 'badge-red', yellow: 'badge-yellow', green: 'badge-green' }[priorityFlag] || 'badge-gray';
  const flagLabel = { red: '🔴 REVIEW', yellow: '🟡 CHECK', green: '🟢 ON TRACK' }[priorityFlag] || '⏳ Pending';

  // Scores
  const originalityScore = triage.originalityScore ?? sub.originalityScore ?? null;
  const docIntegrity = forensics.integrity || null;
  const aiLikelihood = triage.aiLikelihood || originality.confidence || '—';
  const probableTool = triage.probableTool || originality.tool || sub.likelyAITool || 'None detected';

  // File type detection
  const isPdfSubmission = forensics.fileType === 'pdf' || sub.fileType === 'pdf' || docIntegrity === 'Not applicable';

  // Verdict colour
  const verdictText = originality.verdict || originality.overallVerdict || '';
  const verdictColour = verdictText.includes('Largely Authentic') ? 'var(--color-green)' :
    verdictText.includes('Some Concerns') ? 'var(--color-yellow)' : 'var(--color-red)';

  // Grade colour
  const gradeColour = (grade) => {
    if (!grade) return '#64748b';
    const g = grade.toLowerCase();
    if (g.includes('distinction')) return '#7c3aed';
    if (g.includes('merit')) return '#f59e0b';
    if (g.includes('pass')) return '#22c55e';
    if (g.includes('referral') || g.includes('fail')) return '#ef4444';
    // T Level band grades
    if (g.includes('band 3-4') || g.includes('strong')) return '#7c3aed';
    if (g.includes('band 2-3') || g.includes('competent')) return '#f59e0b';
    if (g.includes('band 1-2') || g.includes('developing')) return '#f97316';
    if (g.includes('band 1') || g.includes('limited')) return '#ef4444';
    if (g.includes('below band')) return '#dc2626';
    return '#64748b';
  };

  // Criteria grade badge
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

  // Empty state helper
  const emptyNote = (text) => (
    <p style={{ fontSize: '0.8125rem', color: '#94a3b8', fontStyle: 'italic', margin: '0.25rem 0' }}>{text}</p>
  );

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem', maxWidth: '950px' }}>
      <a href="/dashboard" style={{ color: '#64748b', fontSize: '0.875rem' }}>← Back to Dashboard</a>

      {/* ═══════════════════════════════════════════════════════════
           SECTION 1: REPORT HEADER
           ═══════════════════════════════════════════════════════════ */}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {sub.student?.name || meta.studentName || 'Unknown Student'}
          </h1>
          <p style={{ color: '#64748b' }}>
            {sub.cohortName || meta.cohortId || ''} &bull; {sub.unitTitle || meta.unitTitle || ''}
            {(sub.assignmentName || meta.assignmentName) && !sub.isAdHoc && <> &bull; {sub.assignmentName || meta.assignmentName}</>}
          </p>
          {(sub.wordCount || meta.wordCount) && (
            <p style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>
              {(sub.wordCount || meta.wordCount).toLocaleString()} words
              {sub.submittedAt && <> &bull; Submitted {new Date(sub.submittedAt).toLocaleDateString('en-GB')}</>}
              {isPdfSubmission && (
                <span style={{
                  display: 'inline-block',
                  marginLeft: '0.5rem',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #fde68a',
                  verticalAlign: 'middle',
                }}>PDF submission</span>
              )}
            </p>
          )}
        </div>
        <span className={`badge ${flagBadge}`} style={{ fontSize: '0.875rem', padding: '0.375rem 1rem' }}>{flagLabel}</span>
      </div>

      {sub.isAdHoc && (
        <div style={{ background: '#fef3c7', border: '1px solid #fde047', borderRadius: '8px', padding: '0.625rem 1rem', marginBottom: '1rem', fontSize: '0.8125rem' }}>
          <strong>📝 Ad hoc submission</strong> — Originality analysis only. No marking guide available for criteria assessment.
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
           SECTION 2: TRIAGE SUMMARY
           Always renders. Shows scores and key indicators.
           ═══════════════════════════════════════════════════════════ */}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Originality</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: originalityScore >= 80 ? 'var(--color-green)' : originalityScore >= 60 ? 'var(--color-yellow)' : 'var(--color-red)' }}>
            {originalityScore != null ? `${originalityScore}%` : '—'}
          </div>
        </div>
        <div style={{ background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>AI Likelihood</div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{aiLikelihood}</div>
        </div>
        <div style={{ background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Probable Tool</div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>{probableTool}</div>
        </div>
        <div style={{ background: 'white', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${docIntegrity === 'Consistent' ? '#86efac' : docIntegrity === 'Atypical' ? '#fca5a5' : isPdfSubmission ? '#cbd5e1' : '#e2e8f0'}` }}>
          <div style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Document Integrity</div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: docIntegrity === 'Consistent' ? 'var(--color-green)' : docIntegrity === 'Atypical' ? 'var(--color-red)' : docIntegrity === 'Some concerns' ? '#92400e' : '#64748b' }}>
            {docIntegrity || 'Not assessed'}
            {isPdfSubmission && <span style={{ fontSize: '0.6875rem', fontWeight: 400, marginLeft: '0.25rem' }}>(PDF)</span>}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
           SECTION 3: ORIGINALITY ASSESSMENT
           Always renders. Every subsection present.
           ═══════════════════════════════════════════════════════════ */}

      <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Originality Assessment</h2>

        {/* 3a: Verdict */}
        <div style={{ background: 'white', border: `2px solid ${verdictColour}`, borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: verdictColour, marginBottom: '0.5rem' }}>
            {verdictText || 'Assessment pending'}
          </div>
          <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0 }}>
            {originality.summary || originality.overallVerdict || 'No summary available.'}
          </p>
        </div>

        {/* 3b: AI Tool Reasoning */}
        <div className="card" style={{ marginBottom: '0.75rem', padding: '0.875rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            🤖 AI Tool Analysis: {probableTool}
          </h4>
          {(originality.toolReasoning || originality.likelyAIToolReasoning)
            ? <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0 }}>{originality.toolReasoning || originality.likelyAIToolReasoning}</p>
            : emptyNote('No specific AI tool identified.')
          }
        </div>

        {/* 3c: Humanizer Detection Markers */}
        <div className="card" style={{ marginBottom: '0.75rem', padding: '0.875rem', borderLeft: '4px solid #f59e0b' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>🔍 Humanizer Detection Markers</h4>
          {(originality.humanizerMarkers?.length > 0)
            ? originality.humanizerMarkers.map((m, i) => (
              <div key={i} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: i < originality.humanizerMarkers.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.25rem' }}>{m.marker}</div>
                <div style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '0.25rem' }}>{m.evidence}</div>
                <div style={{ fontSize: '0.75rem', color: '#92400e', fontStyle: 'italic' }}>{m.significance}</div>
              </div>
            ))
            : emptyNote('No humanizer markers detected.')
          }
        </div>

        {/* 3d: Direct AI Generation Markers */}
        <div className="card" style={{ marginBottom: '0.75rem', padding: '0.875rem', borderLeft: '4px solid var(--color-red)' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-red)' }}>🚨 Direct AI Generation Markers</h4>
          {(originality.directAIMarkers?.length > 0)
            ? originality.directAIMarkers.map((m, i) => (
              <div key={i} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: i < originality.directAIMarkers.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.25rem' }}>{m.marker}</div>
                <div style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '0.25rem' }}>{m.evidence}</div>
                <div style={{ fontSize: '0.75rem', color: '#dc2626', fontStyle: 'italic' }}>{m.significance}</div>
              </div>
            ))
            : emptyNote('No direct AI generation markers detected.')
          }
        </div>

        {/* 3e: Authentic Student Indicators */}
        <div className="card" style={{ marginBottom: '0.75rem', padding: '0.875rem', borderLeft: '4px solid var(--color-green)' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>✓ Authentic Student Indicators</h4>
          {(originality.authenticIndicators?.length > 0)
            ? originality.authenticIndicators.map((ind, i) => (
              <div key={i} style={{ fontSize: '0.8125rem', color: '#374151', marginBottom: '0.375rem', paddingLeft: '0.75rem', borderLeft: '2px solid #86efac' }}>{ind}</div>
            ))
            : emptyNote('No clear authentic indicators identified.')
          }
        </div>

        {/* 3f: Vocabulary Inconsistencies */}
        <div className="card" style={{ marginBottom: '0.75rem', padding: '0.875rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>📚 Vocabulary Inconsistencies</h4>
          {(originality.vocabularyFlags?.length > 0)
            ? originality.vocabularyFlags.map((item, i) => (
              <div key={i} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: '#fefce8', borderRadius: '6px' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>&ldquo;{item.quote}&rdquo;</div>
                <div style={{ fontSize: '0.75rem', color: '#dc2626' }}>⚠️ {item.concern}</div>
              </div>
            ))
            : emptyNote('No vocabulary inconsistencies flagged.')
          }
        </div>

        {/* 3g: Copy-Paste Indicators */}
        <div className="card" style={{ marginBottom: '0.75rem', padding: '0.875rem', background: originality.copyPasteIndicators?.length > 0 ? '#fef2f2' : 'white', borderLeft: `4px solid ${originality.copyPasteIndicators?.length > 0 ? 'var(--color-red)' : '#e2e8f0'}` }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: originality.copyPasteIndicators?.length > 0 ? 'var(--color-red)' : '#374151', marginBottom: '0.5rem' }}>🚨 Copy-Paste Indicators</h4>
          {(originality.copyPasteIndicators?.length > 0)
            ? originality.copyPasteIndicators.map((item, i) => (
              <div key={i} style={{ marginBottom: '0.5rem' }}>
                <div style={{ fontStyle: 'italic', fontSize: '0.8125rem', padding: '0.5rem', background: 'white', borderRadius: '4px', marginBottom: '0.25rem' }}>{item.text}</div>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}><strong>Location:</strong> {item.location} — {item.significance}</div>
              </div>
            ))
            : emptyNote('No copy-paste indicators detected.')
          }
        </div>

        {/* 3h: Research Quality */}
        <div style={{ fontSize: '0.8125rem', color: '#475569', background: 'white', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '0.75rem' }}>
          <strong>📖 Research Quality:</strong> {originality.researchQualityNotes || 'No observations.'}
        </div>

        {/* 3i: Document Integrity Context */}
        {(() => {
          const context = forensics.context;
          const integrity = forensics.integrity;
          if (!context) return (
            <div style={{ fontSize: '0.8125rem', color: '#475569', background: 'white', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <strong>🔬 Document Integrity:</strong> Not assessed — no .docx file available for forensic analysis.
            </div>
          );
          if (isPdfSubmission) return (
            <div style={{ fontSize: '0.8125rem', color: '#475569', background: '#f8fafc', padding: '0.875rem', borderRadius: '8px', border: '1px solid #cbd5e1', borderLeft: '4px solid #94a3b8' }}>
              <strong style={{ color: '#64748b' }}>🔬 Document Integrity: Not applicable</strong>
              <span style={{
                display: 'inline-block',
                marginLeft: '0.5rem',
                padding: '0.125rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                backgroundColor: '#fef3c7',
                color: '#92400e',
                border: '1px solid #fde68a',
                verticalAlign: 'middle',
              }}>PDF</span>
              <p style={{ margin: '0.5rem 0 0 0', lineHeight: '1.6' }}>{context}</p>
            </div>
          );
          const borderColour = integrity === 'Atypical' ? '#ef4444' : integrity === 'Some concerns' ? '#f59e0b' : '#22c55e';
          const bgColour = integrity === 'Atypical' ? '#fef2f2' : integrity === 'Some concerns' ? '#fff7ed' : '#f0fdf4';
          return (
            <div style={{ fontSize: '0.8125rem', color: '#374151', background: bgColour, padding: '0.875rem', borderRadius: '8px', border: `1px solid ${borderColour}`, borderLeft: `4px solid ${borderColour}` }}>
              <strong style={{ color: borderColour }}>🔬 Document Integrity: {integrity}</strong>
              <p style={{ margin: '0.5rem 0 0 0', lineHeight: '1.6' }}>{context}</p>
            </div>
          );
        })()}
      </div>

      {/* ═══════════════════════════════════════════════════════════
           SECTION 4: CRITERIA ASSESSMENT
           Always renders for standard submissions (not ad hoc).
           ═══════════════════════════════════════════════════════════ */}

      {!sub.isAdHoc && (
        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Criteria Assessment</h2>

          {/* Overview */}
          {(criteria?.overview || (sub.holisticAssessment?.documentOverview)) && (
            <p style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '1rem' }}>
              {criteria?.overview || sub.holisticAssessment?.documentOverview}
            </p>
          )}

          {/* Overall grade */}
          {(() => {
            const grade = criteria?.overallGrade || sub.holisticAssessment?.overallGrade || sub.gradeEstimate;
            const justification = criteria?.gradeJustification || sub.holisticAssessment?.gradeJustification || '';
            return (
              <div style={{ background: 'white', border: `2px solid ${gradeColour(grade)}`, borderRadius: '8px', padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Overall Provisional Grade</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: gradeColour(grade) }}>{grade || 'Not assessed'}</div>
                </div>
                {justification && <p style={{ fontSize: '0.8125rem', color: '#475569', maxWidth: '60%', margin: 0, textAlign: 'right' }}>{justification}</p>}
              </div>
            );
          })()}

          {/* Conditional note */}
          {(criteria?.conditionalNote || sub.holisticAssessment?.conditionalNote) && (
            <div style={{ background: '#fef3c7', border: '1px solid #fde047', borderRadius: '8px', padding: '0.625rem 1rem', marginBottom: '1rem', fontSize: '0.8125rem' }}>
              <strong>⚠️ Conditional:</strong> {criteria?.conditionalNote || sub.holisticAssessment?.conditionalNote}
            </div>
          )}

          {/* Criteria table / Grid assessments */}
          {(() => {
            // T Level: render grid assessments
            const gridAssessments = criteria?.gridAssessments || sub.holisticAssessment?.gridAssessments || [];
            if (gridAssessments.length > 0) {
              const totalMark = criteria?.totalEstimatedMark ?? sub.holisticAssessment?.totalEstimatedMark ?? '?';
              const maxMarks = criteria?.maxMarks ?? sub.holisticAssessment?.maxMarks ?? '?';
              return (
                <div className="card" style={{ marginBottom: '1rem', padding: '0' }}>
                  <div className="table-wrapper">
                    <table style={{ fontSize: '0.8125rem' }}>
                      <thead>
                        <tr>
                          <th>Marking Grid</th>
                          <th style={{ width: '80px', textAlign: 'center' }}>Band</th>
                          <th style={{ width: '100px', textAlign: 'center' }}>Mark</th>
                          <th>Justification</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gridAssessments.map((ga, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 600, color: '#1e293b' }}>{ga.gridName}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                backgroundColor: '#e0f2fe',
                                color: '#0369a1',
                              }}>Band {ga.bestFitBand}</span>
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.9375rem', color: '#0d9488' }}>
                              {ga.estimatedMark} / {ga.maxMarks}
                            </td>
                            <td style={{ color: '#475569', fontSize: '0.8rem' }}>{ga.justification || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ backgroundColor: '#f1f5f9' }}>
                          <td style={{ fontWeight: 700 }}>Total</td>
                          <td></td>
                          <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '1rem', color: '#0d9488' }}>
                            {totalMark} / {maxMarks}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              );
            }

            // BTEC: render criteria table
            const assessments = criteria?.criteria || sub.holisticAssessment?.criteriaAssessments || [];
            if (assessments.length === 0) return emptyNote('No criteria assessments available.');
            return (
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
                      {assessments.map((ca, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 700, fontSize: '0.875rem' }}>{ca.criterion}</td>
                          <td style={{ color: '#374151' }}>{ca.evidencePresent || ca.evidence || '—'}</td>
                          <td style={{ color: '#dc2626' }}>{ca.gaps || '—'}</td>
                          <td>{criteriaGradeBadge(ca.provisionalGrade || ca.grade)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
           SECTION 5: VERIFICATION QUESTIONS
           Always renders.
           ═══════════════════════════════════════════════════════════ */}

      <div className="card" style={{ marginBottom: '1rem', borderLeft: '4px solid #7c3aed' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>❓ Verification Questions</h3>
        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
          Specific to this submission. For use at teacher&apos;s discretion.
        </p>
        {questions.length > 0
          ? (
            <ol style={{ paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
              {questions.map((q, i) => (
                <li key={i} style={{ marginBottom: '0.5rem', fontStyle: 'italic', color: '#1e293b' }}>&ldquo;{q}&rdquo;</li>
              ))}
            </ol>
          )
          : emptyNote('No verification questions generated.')
        }
      </div>

      {/* ═══════════════════════════════════════════════════════════
           SECTION 6: DISCLAIMER
           Always renders.
           ═══════════════════════════════════════════════════════════ */}

      <div className="disclaimer" style={{ marginTop: '1.5rem' }}>
        <strong>⚠️ Important:</strong> This report is generated by automated analysis and provides indicators only. It is not definitive proof of academic misconduct or a final grade.
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
