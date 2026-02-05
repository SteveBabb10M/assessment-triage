'use client';

import { useState, useEffect } from 'react';
import { getAllSubmissions, getSubmissionsByStudent, getSubmissionStats } from '../../data/submissions';
import { students, cohort, teachers } from '../../data/demo';
import { units, getAllAssignments, getActiveAssignments, getUpcomingAssignments } from '../../data/units';

export default function Dashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [expandedSections, setExpandedSections] = useState({ RED: true, AMBER: true, GREEN: false });
  const [filterUnit, setFilterUnit] = useState('all');

  useEffect(() => {
    loadSubmissions();
    // Refresh every 30 seconds
    const interval = setInterval(loadSubmissions, 30000);
    return () => clearInterval(interval);
  }, []);

  function loadSubmissions() {
    setSubmissions(getAllSubmissions());
  }

  // Filter
  let filteredSubmissions = submissions;
  if (filterUnit !== 'all') {
    filteredSubmissions = filteredSubmissions.filter(s => {
      const a = s.assignmentId || '';
      return a.startsWith(filterUnit);
    });
  }

  // Separate by RAG
  const redSubs = filteredSubmissions.filter(s => s.rag === 'RED' && s.status === 'complete');
  const amberSubs = filteredSubmissions.filter(s => s.rag === 'AMBER' && s.status === 'complete');
  const greenSubs = filteredSubmissions.filter(s => s.rag === 'GREEN' && s.status === 'complete');
  const pendingSubs = filteredSubmissions.filter(s => s.status === 'pending' || s.status === 'analysing');

  const stats = getSubmissionStats();

  // Upcoming assignments
  const upcoming = getUpcomingAssignments();

  // Coursework units for filter
  const courseworkUnits = Object.values(units).filter(u => u.type === 'coursework');

  function toggleSection(section) {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }

  return (
    <div className="container">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Assessment Triage</h1>
        <p className="page-subtitle">{cohort.name}: {cohort.programme} — {cohort.academicYear}</p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Submissions</div>
        </div>
        <div className="stat-card">
          <div className="stat-number rag-red">{stats.byRAG.RED}</div>
          <div className="stat-label">🔴 Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-number rag-amber">{stats.byRAG.AMBER}</div>
          <div className="stat-label">🟡 Check</div>
        </div>
        <div className="stat-card">
          <div className="stat-number rag-green">{stats.byRAG.GREEN}</div>
          <div className="stat-label">🟢 On Track</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#64748b' }}>{stats.pending}</div>
          <div className="stat-label">⏳ Pending</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Filter:</span>
        <select value={filterUnit} onChange={e => setFilterUnit(e.target.value)}>
          <option value="all">All Units</option>
          {courseworkUnits.map(u => (
            <option key={u.id} value={u.id}>Unit {u.number}: {u.title}</option>
          ))}
        </select>
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
          {filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Upcoming Assignments */}
      {upcoming.length > 0 && (
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>📅 Upcoming Deadlines</h2>
          {upcoming.map(a => {
            const dueDate = new Date(a.handIn);
            const daysLeft = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
            return (
              <div key={a.id} className="calendar-row">
                <span>Unit {a.unitNumber} - {a.title}</span>
                <span>{dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                <span className={daysLeft <= 3 ? 'calendar-overdue' : daysLeft <= 7 ? 'calendar-upcoming' : 'calendar-future'}>
                  {daysLeft <= 0 ? 'Overdue' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                </span>
                <span className="badge badge-gray">{a.assessor}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Pending */}
      {pendingSubs.length > 0 && (
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.75rem' }}>⏳ Processing ({pendingSubs.length})</h2>
          {pendingSubs.map(s => (
            <div key={s.id} className="submission-row">
              <div className="submission-info">
                <div className="submission-name">{s.studentName}</div>
                <div className="submission-meta">{s.assignmentId} • {s.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RED - Review */}
      <TriageSection
        title="Review"
        emoji="🔴"
        rag="RED"
        submissions={redSubs}
        expanded={expandedSections.RED}
        onToggle={() => toggleSection('RED')}
        bgClass="bg-rag-red"
      />

      {/* AMBER - Check */}
      <TriageSection
        title="Check"
        emoji="🟡"
        rag="AMBER"
        submissions={amberSubs}
        expanded={expandedSections.AMBER}
        onToggle={() => toggleSection('AMBER')}
        bgClass="bg-rag-amber"
      />

      {/* GREEN - On Track */}
      <TriageSection
        title="On Track"
        emoji="🟢"
        rag="GREEN"
        submissions={greenSubs}
        expanded={expandedSections.GREEN}
        onToggle={() => toggleSection('GREEN')}
        bgClass="bg-rag-green"
      />

      {/* Student List */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>👥 Students ({students.length})</h2>
        <div className="student-grid">
          {students.map(student => {
            const studentSubs = submissions.filter(s => s.studentId === student.id);
            const hasRed = studentSubs.some(s => s.rag === 'RED');
            const hasAmber = studentSubs.some(s => s.rag === 'AMBER');
            return (
              <a
                key={student.id}
                href={`/dashboard/student/${student.id}`}
                className="card"
                style={{ textDecoration: 'none', color: 'inherit', marginBottom: 0, padding: '1rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{student.displayName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {studentSubs.length} submission{studentSubs.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div>
                    {hasRed && <span className="badge badge-red">At Risk</span>}
                    {!hasRed && hasAmber && <span className="badge badge-amber">Check</span>}
                    {!hasRed && !hasAmber && studentSubs.length > 0 && <span className="badge badge-green">OK</span>}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TriageSection({ title, emoji, rag, submissions, expanded, onToggle, bgClass }) {
  if (submissions.length === 0) return null;

  return (
    <div className="triage-section">
      <div className={`triage-header ${bgClass}`} onClick={onToggle}>
        <h2>{emoji} {title}</h2>
        <span className="triage-count">
          {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
          {expanded ? ' ▾' : ' ▸'}
        </span>
      </div>
      {expanded && (
        <div className="triage-body">
          {submissions.map(sub => (
            <div key={sub.id} className="submission-row">
              <div className="submission-info">
                <div className="submission-name">{sub.studentName}</div>
                <div className="submission-meta">
                  {sub.analysis?.assignmentTitle || sub.assignmentId}
                  {sub.originalityScore !== undefined && ` • Originality: ${sub.originalityScore}%`}
                  {sub.estimatedGrade && ` • Est. Grade: ${sub.estimatedGrade}`}
                </div>
                {sub.analysis?.overallSummary && (
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                    {sub.analysis.overallSummary}
                  </div>
                )}
              </div>
              <div className="submission-actions">
                <span className={`badge badge-${rag === 'RED' ? 'red' : rag === 'AMBER' ? 'amber' : 'green'}`}>
                  {sub.estimatedGrade || 'Pending'}
                </span>
                <a href={`/dashboard/submission/${sub.id}`} className="btn btn-sm btn-primary">
                  View Report
                </a>
                <a href={`/dashboard/student/${sub.studentId}`} className="btn btn-sm btn-secondary">
                  Profile
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
