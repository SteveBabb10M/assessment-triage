'use client';

import { useState, useCallback } from 'react';
import { TEACHERS, GROUPS, STUDENTS, getGroupFullName } from '../../data/demo';
import { getAllAssignments } from '../../data/units';
import { addSubmission, updateSubmission } from '../../data/submissions';

export default function Setup() {
  const [activeTab, setActiveTab] = useState('upload');
  
  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      <div className="page-header">
        <h1 className="page-title">Setup & Testing</h1>
        <p className="page-subtitle">Configure the system and test submissions</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button 
          className={`btn ${activeTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('upload')}
        >
          📤 Test Upload
        </button>
        <button 
          className={`btn ${activeTab === 'data' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('data')}
        >
          📋 View Data
        </button>
        <button 
          className={`btn ${activeTab === 'teams' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('teams')}
        >
          🔗 Teams Setup
        </button>
      </div>

      {activeTab === 'upload' && <TestUpload />}
      {activeTab === 'data' && <ViewData />}
      {activeTab === 'teams' && <TeamsSetup />}
    </div>
  );
}

function TestUpload() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [studentId, setStudentId] = useState('student1');
  const [assignmentId, setAssignmentId] = useState('unit1-ab');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const assignments = getAllAssignments();

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = async (selectedFile) => {
    setError(null);
    setFile(selectedFile);
    setResult(null);

    if (selectedFile.name.endsWith('.docx')) {
      try {
        const mammoth = (await import('mammoth')).default;
        const arrayBuffer = await selectedFile.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setExtractedText(result.value);
      } catch (err) {
        setError('Failed to extract text from document.');
      }
    } else if (selectedFile.name.endsWith('.txt')) {
      const text = await selectedFile.text();
      setExtractedText(text);
    } else {
      setError('Please upload a .docx or .txt file');
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!extractedText || !studentId || !assignmentId) return;
    
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // Create initial submission
      const newSub = addSubmission({
        studentId,
        assignmentId,
        fileName: file?.name || 'uploaded_file.docx',
        status: 'processing'
      });

      // Call analysis API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: newSub.id,
          text: extractedText,
          assignmentId,
          studentId
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Update submission with results
      const updated = updateSubmission(newSub.id, {
        ...data,
        status: 'complete'
      });

      setResult(updated);
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '1rem' }}>Test Submission Upload</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          Upload a student document to test the analysis system.
        </p>

        {/* File Drop Zone */}
        <div
          className={`drop-zone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".docx,.txt"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
          <p style={{ fontSize: '1.1rem', color: '#475569', marginBottom: '0.5rem' }}>
            {file ? file.name : 'Drop a .docx or .txt file here, or click to browse'}
          </p>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            Supported formats: Microsoft Word (.docx), Plain Text (.txt)
          </p>
        </div>

        {file && extractedText && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--color-green-bg)', borderRadius: '8px', border: '1px solid var(--color-green-border)' }}>
            <p style={{ color: 'var(--color-green)', fontWeight: 500 }}>
              ✓ Extracted {extractedText.split(/\s+/).length.toLocaleString()} words from "{file.name}"
            </p>
          </div>
        )}

        {/* Student & Assignment Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
          <div className="form-group">
            <label className="label">Student</label>
            <select className="select" value={studentId} onChange={e => setStudentId(e.target.value)}>
              {STUDENTS.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({getGroupFullName(s.groupId)})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="label">Assignment</label>
            <select className="select" value={assignmentId} onChange={e => setAssignmentId(e.target.value)}>
              {assignments.map(a => (
                <option key={a.id} value={a.id}>
                  Unit {a.unitNumber}: {a.unitTitle} — {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Analyze Button */}
        <div style={{ marginTop: '1.5rem' }}>
          <button 
            className="btn btn-primary"
            onClick={handleAnalyze}
            disabled={!extractedText || isAnalyzing}
          >
            {isAnalyzing ? '⏳ Analyzing...' : '🔍 Analyze Submission'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--color-red-bg)', borderRadius: '8px', border: '1px solid var(--color-red-border)' }}>
            <p style={{ color: 'var(--color-red)' }}>⚠️ {error}</p>
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="card" style={{ borderLeft: `4px solid var(--color-${result.priorityFlag || 'gray'})` }}>
          <h2 className="card-title" style={{ marginBottom: '1rem' }}>✓ Analysis Complete</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--color-gray-bg)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Originality</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: result.originalityScore < 80 ? 'var(--color-red)' : 'var(--color-green)' }}>
                {result.originalityScore}%
              </div>
            </div>
            <div style={{ padding: '1rem', background: 'var(--color-gray-bg)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Grade</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: result.gradeEstimate === 'Fail' ? 'var(--color-red)' : 'var(--color-green)' }}>
                {result.gradeEstimate}
              </div>
            </div>
            <div style={{ padding: '1rem', background: 'var(--color-gray-bg)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Priority</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                {result.priorityFlag === 'red' ? '🔴' : result.priorityFlag === 'yellow' ? '🟡' : '🟢'}
              </div>
            </div>
          </div>

          {result.summary && (
            <p style={{ color: '#475569', marginBottom: '1rem' }}>{result.summary}</p>
          )}

          <a href={`/dashboard/submission/${result.id}`} className="btn btn-primary">
            View Full Report
          </a>
        </div>
      )}
    </div>
  );
}

function ViewData() {
  return (
    <div>
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '1rem' }}>Teachers ({TEACHERS.length})</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Initials</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {TEACHERS.map(t => (
                <tr key={t.id}>
                  <td><code>{t.id}</code></td>
                  <td>{t.name}</td>
                  <td>{t.initials}</td>
                  <td>{t.isHoD ? <span className="badge badge-green">HoD</span> : 'Teacher'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '1rem' }}>Groups ({GROUPS.length})</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Course</th>
                <th>Teacher</th>
              </tr>
            </thead>
            <tbody>
              {GROUPS.map(g => (
                <tr key={g.id}>
                  <td><code>{g.id}</code></td>
                  <td>{g.name}</td>
                  <td>{g.course === 'foundation' ? 'Foundation Diploma' : 'Extended Diploma'}</td>
                  <td>{TEACHERS.find(t => t.id === g.teacherId)?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '1rem' }}>Students ({STUDENTS.length})</h2>
        <p style={{ color: '#64748b', marginBottom: '1rem' }}>
          Showing first 20 of {STUDENTS.length} students
        </p>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Group</th>
              </tr>
            </thead>
            <tbody>
              {STUDENTS.slice(0, 20).map(s => (
                <tr key={s.id}>
                  <td><code>{s.id}</code></td>
                  <td>{s.name}</td>
                  <td>{getGroupFullName(s.groupId)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TeamsSetup() {
  return (
    <div>
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '1rem' }}>🔗 Microsoft Teams Integration</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          Follow these steps to connect student submissions from Teams.
        </p>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Step 1: Create Microsoft Form</h3>
          <ol style={{ paddingLeft: '1.5rem', color: '#475569' }}>
            <li>Go to forms.office.com</li>
            <li>Create a new form titled "Submit Your Assignment"</li>
            <li>Add fields:
              <ul style={{ marginTop: '0.5rem' }}>
                <li><strong>Student Name</strong> (dropdown with student list)</li>
                <li><strong>Group</strong> (dropdown with group list)</li>
                <li><strong>Assignment</strong> (dropdown with assignment list)</li>
                <li><strong>Upload Work</strong> (file upload, .docx only)</li>
              </ul>
            </li>
          </ol>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Step 2: Create Power Automate Flow</h3>
          <ol style={{ paddingLeft: '1.5rem', color: '#475569' }}>
            <li>Go to flow.microsoft.com</li>
            <li>Create new automated flow</li>
            <li>Trigger: "When a new response is submitted" (Microsoft Forms)</li>
            <li>Action: "Get response details"</li>
            <li>Action: "Get file content" (from SharePoint)</li>
            <li>Action: HTTP POST to your webhook endpoint</li>
          </ol>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Step 3: Configure Webhook</h3>
          <div style={{ padding: '1rem', background: '#1e293b', borderRadius: '8px', color: '#e2e8f0', fontFamily: 'monospace', fontSize: '0.875rem' }}>
            <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>POST endpoint:</div>
            <div>{typeof window !== 'undefined' ? window.location.origin : 'https://your-app.vercel.app'}/api/webhook</div>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Step 4: Add Form to Teams</h3>
          <ol style={{ paddingLeft: '1.5rem', color: '#475569' }}>
            <li>In Teams, go to your class channel</li>
            <li>Click + to add a tab</li>
            <li>Select "Forms"</li>
            <li>Choose your submission form</li>
            <li>Students can now submit directly from Teams</li>
          </ol>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '1rem' }}>📝 Webhook Payload Format</h2>
        <p style={{ color: '#64748b', marginBottom: '1rem' }}>
          Power Automate should send this JSON to your webhook:
        </p>
        <pre style={{ 
          padding: '1rem', 
          background: '#1e293b', 
          borderRadius: '8px', 
          color: '#e2e8f0', 
          fontSize: '0.875rem',
          overflow: 'auto'
        }}>
{`{
  "studentName": "Student 1",
  "studentId": "student1",
  "assignmentId": "unit1-ab",
  "fileName": "submission.docx",
  "fileContent": "<base64 encoded file>",
  "fileUrl": "https://sharepoint.com/..."
}`}
        </pre>
      </div>
    </div>
  );
}
