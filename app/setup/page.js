'use client';

import { useState } from 'react';
import { TEACHERS, COHORTS, STUDENTS, getStudentsByCohort } from '../../data/staff';
import { UNITS, getAllAssignments } from '../../data/units';

export default function SetupPage() {
  const [selectedCohort, setSelectedCohort] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);

  const studentsForCohort = selectedCohort ? getStudentsByCohort(selectedCohort) : [];
  const cohort = COHORTS.find(c => c.id === selectedCohort);
  const courseUnits = cohort ? Object.values(UNITS).filter(u => u.course === cohort.course && !u.isExam) : [];
  const assignments = courseUnits.flatMap(u => u.assignments.map(a => ({ ...a, unitNumber: u.number, unitTitle: u.title })));

  async function handleSubmit() {
    if (!selectedStudent || !selectedAssignment || !file) {
      alert('Please select a student, assignment, and upload a file.');
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

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>⚙️ Setup & Test Upload</h1>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Upload a student document to test the AI analysis</p>

      {/* System Info */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>System Data</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
          <div><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{TEACHERS.length}</div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>Teachers</div></div>
          <div><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{COHORTS.length}</div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>Cohorts</div></div>
          <div><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{STUDENTS.length}</div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>Students</div></div>
          <div><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{Object.values(UNITS).filter(u => !u.isExam).length}</div><div style={{ fontSize: '0.75rem', color: '#64748b' }}>Units</div></div>
        </div>
      </div>

      {/* Test Upload */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Test Upload</h3>

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
              {assignments.map(a => <option key={a.id} value={a.id}>Unit {a.unitNumber}: {a.unitTitle} — {a.name}</option>)}
            </select>
          </div>

          {/* File */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Student Work (.docx)</label>
            <input type="file" accept=".docx" onChange={e => setFile(e.target.files?.[0] || null)}
              style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', width: '100%' }} />
          </div>

          <button className="btn btn-primary" onClick={handleSubmit}
            disabled={status === 'analyzing'} style={{ alignSelf: 'flex-start' }}>
            {status === 'analyzing' ? '⏳ Analysing...' : '🔍 Analyse Submission'}
          </button>
        </div>

        {/* Results */}
        {status === 'complete' && result && (
          <div style={{ marginTop: '1.5rem', background: 'var(--color-green-bg)', border: '1px solid var(--color-green-border)', borderRadius: '8px', padding: '1rem' }}>
            <strong>✓ Analysis complete!</strong>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              <a href={`/dashboard/submission/${result.submissionId}`}>View full report →</a>
            </p>
          </div>
        )}

        {status === 'error' && result && (
          <div style={{ marginTop: '1.5rem', background: 'var(--color-red-bg)', border: '1px solid var(--color-red-border)', borderRadius: '8px', padding: '1rem' }}>
            <strong>✗ Error:</strong> {result.error}
          </div>
        )}
      </div>
    </div>
  );
}
