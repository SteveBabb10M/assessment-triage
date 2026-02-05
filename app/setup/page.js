'use client';

import { useState } from 'react';
import { students, getStudentDropdownOptions, cohort } from '../../data/demo';
import { units, getAssignmentDropdownOptions } from '../../data/units';

export default function SetupPage() {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const studentOptions = getStudentDropdownOptions();
  const assignmentOptions = getAssignmentDropdownOptions();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file || !selectedStudent || !selectedAssignment) {
      setError('Please select a student, assignment, and upload a file.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const student = students.find(s => s.id === selectedStudent);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('studentId', selectedStudent);
    formData.append('studentName', student ? student.displayName : selectedStudent);
    formData.append('assignmentId', selectedAssignment);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err) {
      setError('Request failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <h1 className="page-title">Setup & Test Upload</h1>
      <p className="page-subtitle" style={{ marginBottom: '1.5rem' }}>
        {cohort.name} • Test the analysis system by uploading a student submission
      </p>

      {/* Upload form */}
      <div className="card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>📤 Test Upload</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Student</label>
              <select
                value={selectedStudent}
                onChange={e => setSelectedStudent(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">Select student...</option>
                {studentOptions.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Assignment</label>
              <select
                value={selectedAssignment}
                onChange={e => setSelectedAssignment(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="">Select assignment...</option>
                {assignmentOptions.map(a => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Upload .docx file</label>
              <input
                type="file"
                accept=".docx"
                onChange={e => setFile(e.target.files[0])}
                style={{ width: '100%' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? '⏳ Analysing... (this may take 30-60 seconds)' : '🔍 Analyse Submission'}
            </button>
          </div>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="card bg-rag-red">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="card bg-rag-green">
          <h3 style={{ marginBottom: '0.5rem' }}>✅ Analysis Complete</h3>
          <p>Submission ID: {result.submissionId}</p>
          <p>RAG: {result.analysis?.rag} • Grade: {result.analysis?.estimatedGrade} • Originality: {result.analysis?.originalityScore}%</p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <a href={`/dashboard/submission/${result.submissionId}`} className="btn btn-primary">View Full Report</a>
            <a href="/dashboard" className="btn btn-secondary">Back to Dashboard</a>
          </div>
        </div>
      )}

      {/* Configuration info */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>⚙️ System Configuration</h2>
        <div style={{ fontSize: '0.875rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem' }}>
            <span style={{ color: '#64748b' }}>Cohort:</span>
            <span>{cohort.name}</span>
            <span style={{ color: '#64748b' }}>Programme:</span>
            <span>{cohort.programme}</span>
            <span style={{ color: '#64748b' }}>Students:</span>
            <span>{students.length}</span>
            <span style={{ color: '#64748b' }}>Units:</span>
            <span>{Object.values(units).filter(u => u.type === 'coursework').length} coursework + {Object.values(units).filter(u => u.type === 'exam').length} exam</span>
            <span style={{ color: '#64748b' }}>Assignments:</span>
            <span>{assignmentOptions.length} (coursework)</span>
            <span style={{ color: '#64748b' }}>API:</span>
            <span>{typeof window !== 'undefined' ? '—' : 'Server-side only'}</span>
          </div>
        </div>
      </div>

      {/* Webhook info */}
      <div className="card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>🔗 Webhook Endpoint</h2>
        <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>For Power Automate integration:</p>
        <code style={{ display: 'block', background: '#f1f5f9', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '0.85rem', wordBreak: 'break-all' }}>
          POST https://assessment-triage.vercel.app/api/webhook
        </code>
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
          Health check: GET the same URL to verify the endpoint is running.
        </p>
      </div>
    </div>
  );
}
