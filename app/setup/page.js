'use client';

import { useState } from 'react';
import { useAuth } from '../../lib/AuthContext';
import { COHORTS, getStudentsByCohort } from '../../data/staff';
import { UNITS, getAdHocUnit } from '../../data/units';

export default function SetupPage() {
  const { user, loading: authLoading } = useAuth();
  const [selectedCohort, setSelectedCohort] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);

  const studentsForCohort = selectedCohort ? getStudentsByCohort(selectedCohort) : [];
  const cohort = COHORTS.find(c => c.id === selectedCohort);

  // Build assignment list for selected cohort:
  // - For BTEC cohorts: units matching cohort.course + Ad Hoc
  // - For T Level cohorts: T Level units matching cohort.course + Ad Hoc
  // - Ad Hoc always appears at the bottom
  const courseUnits = cohort
    ? Object.values(UNITS).filter(u => u.course === cohort.course && !u.isExam && !u.isAdHoc)
    : [];
  const regularAssignments = courseUnits.flatMap(u =>
    u.assignments.map(a => ({ ...a, unitNumber: u.number, unitTitle: u.title, isAdHoc: false }))
  );
  const adHocUnit = getAdHocUnit();
  const adHocAssignment = cohort
    ? [{ ...adHocUnit.assignments[0], unitNumber: adHocUnit.number, unitTitle: adHocUnit.title, isAdHoc: true }]
    : [];
  const assignments = [...regularAssignments, ...adHocAssignment];

  // Detect file type for display
  const isPdf = file?.name?.toLowerCase().endsWith('.pdf');
  const isDocx = file?.name?.toLowerCase().endsWith('.docx');

  async function handleSubmit() {
    if (!selectedStudent || !selectedAssignment || !file) {
      alert('Please select a student, assignment, and upload a file.');
      return;
    }

    // Validate file type
    if (!isPdf && !isDocx) {
      alert('Please upload a .docx or .pdf file.');
      return;
    }

    setStatus('analyzing');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('studentId', selectedStudent);
      formData.append('assignmentId', selectedAssignment);

      const response = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await response.json();

      if (data.success) {
        setResult(data);
        setStatus('complete');
      } else {
        setResult({ error: data.error || 'Analysis failed' });
        setStatus('error');
      }
    } catch (err) {
      setResult({ error: err.message });
      setStatus('error');
    }
  }

  function resetForm() {
    setSelectedCohort('');
    setSelectedStudent('');
    setSelectedAssignment('');
    setFile(null);
    setStatus('idle');
    setResult(null);
  }

  if (authLoading) {
    return (
      <div className="container" style={{ paddingTop: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Please sign in to upload submissions.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>📤 Upload Student Work</h1>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
        Upload a student document for AI-powered originality and grade analysis
      </p>

      {/* User Info */}
      <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
        <p style={{ margin: 0, fontSize: '0.875rem' }}>
          <strong>Uploading as:</strong> {user.name} ({user.email})
        </p>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: '#0369a1' }}>
          This submission will appear in your dashboard after analysis.
        </p>
      </div>

      {/* Upload Form */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Select Student & Assignment</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Cohort */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Cohort</label>
            <select className="filter-select" style={{ width: '100%' }} value={selectedCohort}
              onChange={e => { setSelectedCohort(e.target.value); setSelectedStudent(''); setSelectedAssignment(''); }}>
              <option value="">Select cohort...</option>
              {COHORTS.map(c => <option key={c.id} value={c.id}>{c.name} — {c.qualification} ({c.year})</option>)}
            </select>
          </div>

          {/* Student */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Student</label>
            <select className="filter-select" style={{ width: '100%' }} value={selectedStudent}
              onChange={e => setSelectedStudent(e.target.value)} disabled={!selectedCohort}>
              <option value="">Select student...</option>
              {studentsForCohort.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Assignment */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Assignment</label>
            <select className="filter-select" style={{ width: '100%' }} value={selectedAssignment}
              onChange={e => setSelectedAssignment(e.target.value)} disabled={!selectedCohort}>
              <option value="">Select assignment...</option>
              {assignments.map(a => (
                <option key={a.id} value={a.id}>
                  {a.isAdHoc ? '🔍 Ad Hoc — Originality Check Only' : `Unit ${a.unitNumber}: ${a.unitTitle} — ${a.name}`}
                </option>
              ))}
            </select>
          </div>

          {/* File */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Student Work (.docx or .pdf)</label>
            <input type="file" accept=".docx,.pdf" onChange={e => setFile(e.target.files?.[0] || null)}
              style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', width: '100%' }} />
            {/* File type indicator */}
            {file && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: isPdf ? '#fef3c7' : '#dbeafe',
                  color: isPdf ? '#92400e' : '#1e40af',
                  border: `1px solid ${isPdf ? '#fde68a' : '#bfdbfe'}`,
                }}>
                  {isPdf ? 'PDF' : 'DOCX'}
                </span>
                <span style={{ color: '#64748b' }}>
                  {isPdf
                    ? 'Content analysis only — document forensics not available for PDF files'
                    : 'Full analysis — document forensics + content analysis'}
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary" onClick={handleSubmit}
              disabled={status === 'analyzing'} style={{ flex: 1 }}>
              {status === 'analyzing' ? '⏳ Analysing...' : '🔍 Analyse Submission'}
            </button>
            {status !== 'idle' && (
              <button className="btn" onClick={resetForm} style={{ backgroundColor: '#f1f5f9' }}>
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {status === 'complete' && result && (
          <div style={{ marginTop: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>✓</span>
              <strong style={{ color: '#166534' }}>Analysis complete!</strong>
              {result.fileType === 'pdf' && (
                <span style={{
                  display: 'inline-block',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #fde68a',
                }}>
                  PDF — content analysis only
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#166534', marginBottom: '0.75rem' }}>
              <p style={{ margin: '0.25rem 0' }}><strong>Student:</strong> {result.student}</p>
              <p style={{ margin: '0.25rem 0' }}><strong>Assignment:</strong> {result.assignment}</p>
              <p style={{ margin: '0.25rem 0' }}>
                <strong>Originality:</strong>{' '}
                <span className={`badge badge-${result.originalityScore >= 90 ? 'green' : result.originalityScore >= 80 ? 'yellow' : 'red'}`}>
                  {result.originalityScore}%
                </span>
              </p>
              {result.gradeEstimate && (
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Grade Estimate:</strong>{' '}
                  <span className={`grade-${result.gradeEstimate?.toLowerCase()}`}>{result.gradeEstimate}</span>
                </p>
              )}
            </div>
            <a href={`/dashboard/submission/${result.submissionId}`} className="btn btn-primary">
              View Full Report →
            </a>
          </div>
        )}

        {status === 'error' && result && (
          <div style={{ marginTop: '1.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem' }}>
            <strong style={{ color: '#dc2626' }}>✗ Error:</strong>{' '}
            <span style={{ color: '#b91c1c' }}>{result.error}</span>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="card" style={{ marginTop: '1.5rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#92400e' }}>💡 Tips</h4>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#78350f' }}>
          <li><strong>.docx files</strong> receive full analysis — document forensics (formatting metadata) + AI content analysis</li>
          <li><strong>.pdf files</strong> receive content and visual analysis only — no document forensics are possible for PDFs</li>
          <li>Analysis typically takes 10–30 seconds (PDFs may take slightly longer)</li>
          <li>Results are saved to your dashboard automatically</li>
          <li>Ad Hoc submissions run originality analysis only — no criteria marking</li>
          <li>The AI provides indicators only — always use professional judgment</li>
        </ul>
      </div>
    </div>
  );
}
