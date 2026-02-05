'use client';

import { useState, useEffect } from 'react';
import { getAllSubmissions, getSubmissionsByTeacher, getTriageCounts, getAtRiskStudents, markReviewed } from '../../data/submissions';
import { TEACHERS, COHORTS, getCohortsByTeacher, getCohortShortName } from '../../data/staff';
import { UNITS } from '../../data/units';

export default function Dashboard() {
  const [currentTeacher, setCurrentTeacher] = useState(TEACHERS[0]);
  const [viewMode, setViewMode] = useState('teacher');
  const [filterCohort, setFilterCohort] = useState('all');
  const [filterUnit, setFilterUnit] = useState('all');
  const [submissions, setSubmissions] = useState([]);
  const [expandedSections, setExpandedSections] = useState({ red: true, yellow: false, green: false });

  useEffect(() => {
    // Check URL for department view
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'department' && currentTeacher.isHoD) {
      setViewMode('department');
    }
  }, []);

  useEffect(() => { loadSubmissions(); }, [currentTeacher, viewMode]);

  function loadSubmissions() {
    const subs = (viewMode === 'department' && currentTeacher.isHoD)
      ? getAllSubmissions()
      : getSubmissionsByTeacher(currentTeacher.id);
    setSubmissions(subs);
  }

  function handleTeacherChange(e) {
    const teacher = TEACHERS.find(t => t.id === e.target.value);
    if (teacher) {
      setCurrentTeacher(teacher);
      setViewMode('teacher');
      setFilterCohort('all');
      setFilterUnit('all');
    }
  }

  function toggleSection(section) {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }

  // Filter
  let filtered = submissions;
  if (filterCohort !== 'all') filtered = filtered.filter(s => s.cohort?.id === filterCohort);
  if (filterUnit !== 'all') filtered = filtered.filter(s => s.unit?.id === filterUnit);

  const counts = getTriageCounts(filtered);
  const atRiskStudents = getAtRiskStudents(filtered);
  const availableCohorts = viewMode === 'department' ? COHORTS : getCohortsByTeacher(currentTeacher.id);

  const redSubs = filtered.filter(s => s.priorityFlag === 'red' && s.status === 'complete');
  const yellowSubs = filtered.filter(s => s.priorityFlag === 'yellow' && s.status === 'complete');
  const greenSubs = filtered.filter(s => s.priorityFlag === 'green' && s.status === 'complete');
  const pendingSubs = filtered.filter(s => s.status === 'pending' || s.status === 'processing');

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {viewMode === 'department' ? '🏫 Department Overview' : `📋 ${currentTeacher.name}'s Dashboard`}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            {viewMode === 'department' ? 'All cohorts and submissions' : `Showing submissions for your assigned units`}
          </p>
        </div>
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          <select className="filter-select" value={currentTeacher.id} onChange={handleTeacherChange}>
            {TEACHERS.map(t => (
              <option key={t.id} value={t.id}>{t.name}{t.isHoD ? ' (HoD)' : ''}</option>
            ))}
          </select>
          {currentTeacher.isHoD && (
            <button className={`btn btn-sm ${viewMode === 'department' ? 'btn-primary' : ''}`}
              onClick={() => setViewMode(viewMode === 'department' ? 'teacher' : 'department')}>
              {viewMode === 'department' ? '👤 My View' : '🏫 Department'}
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-number" style={{ color: 'var(--color-red)' }}>{counts.red}</div><div className="stat-label">🔴 Review</div></div>
        <div className="stat-card"><div className="stat-number" style={{ color: 'var(--color-yellow)' }}>{counts.yellow}</div><div className="stat-label">🟡 Check</div></div>
        <div className="stat-card"><div className="stat-number" style={{ color: 'var(--color-green)' }}>{counts.green}</div><div className="stat-label">🟢 On Track</div></div>
        <div className="stat-card"><div className="stat-number" style={{ color: 'var(--color-gray)' }}>{counts.pending}</div><div className="stat-label">⏳ Pending</div></div>
        <div className="stat-card"><div className="stat-number">{counts.total}</div><div className="stat-label">Total</div></div>
      </div>

      {/* At Risk */}
      {atRiskStudents.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid var(--color-red)', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--color-red)', marginBottom: '0.75rem' }}>⚠️ At Risk Students ({atRiskStudents.length})</h3>
          {atRiskStudents.map((ar, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: i < atRiskStudents.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div>
                <a href={`/dashboard/student/${ar.student.id}`} style={{ fontWeight: 600 }}>{ar.student.name}</a>
                <span style={{ color: '#64748b', fontSize: '0.8125rem', marginLeft: '0.5rem' }}>{ar.cohort?.name}</span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>{ar.reasons.join(' • ')}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="filters no-print">
        <select className="filter-select" value={filterCohort} onChange={e => setFilterCohort(e.target.value)}>
          <option value="all">All Cohorts</option>
          {availableCohorts.map(c => <option key={c.id} value={c.id}>{getCohortShortName(c.id)}</option>)}
        </select>
        <select className="filter-select" value={filterUnit} onChange={e => setFilterUnit(e.target.value)}>
          <option value="all">All Units</option>
          {Object.values(UNITS).map(u => <option key={u.id} value={u.id}>Unit {u.number}: {u.title}</option>)}
        </select>
      </div>

      {/* RAG Sections */}
      {[
        { key: 'red', label: '🔴 Review — Priority Attention', subs: redSubs, color: 'var(--color-red)' },
        { key: 'yellow', label: '🟡 Check — Quick Review', subs: yellowSubs, color: 'var(--color-yellow)' },
        { key: 'green', label: '🟢 On Track — Mark with Confidence', subs: greenSubs, color: 'var(--color-green)' },
      ].map(section => (
        <div key={section.key} className="card" style={{ borderLeft: `4px solid ${section.color}` }}>
          <div className="section-header" onClick={() => toggleSection(section.key)}>
            <h3>{section.label} <span className="section-count">({section.subs.length})</span></h3>
            <span>{expandedSections[section.key] ? '▼' : '▶'}</span>
          </div>
          {expandedSections[section.key] && (
            section.subs.length > 0 ? (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th><th>Cohort</th><th>Unit / Assignment</th>
                      <th>Originality</th><th>Grade Est.</th><th>Co-taught</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.subs.map(sub => (
                      <tr key={sub.id} className="clickable" onClick={() => window.location.href = `/dashboard/submission/${sub.id}`}>
                        <td style={{ fontWeight: 500 }}>{sub.student?.name || 'Unknown'}</td>
                        <td>{sub.cohortName}</td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{sub.unitTitle}</div>
                          <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>{sub.assignmentName}</div>
                        </td>
                        <td>
                          <span className={`badge badge-${sub.originalityScore >= 90 ? 'green' : sub.originalityScore >= 80 ? 'yellow' : 'red'}`}>
                            {sub.originalityScore}%
                          </span>
                        </td>
                        <td><span className={`grade-${sub.gradeEstimate?.toLowerCase()}`}>{sub.gradeEstimate}</span></td>
                        <td>{sub.coTeachers?.length > 1 && <span className="co-teach-badge">👥 Co-taught</span>}</td>
                        <td><span className="btn btn-sm">View →</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state"><p>No submissions in this category</p></div>
            )
          )}
        </div>
      ))}

      {/* Pending */}
      {pendingSubs.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid var(--color-gray)' }}>
          <h3>⏳ Pending Analysis ({pendingSubs.length})</h3>
          <div className="table-wrapper" style={{ marginTop: '0.75rem' }}>
            <table>
              <thead><tr><th>Student</th><th>Cohort</th><th>Assignment</th><th>Submitted</th></tr></thead>
              <tbody>
                {pendingSubs.map(sub => (
                  <tr key={sub.id}>
                    <td>{sub.student?.name}</td>
                    <td>{sub.cohortName}</td>
                    <td>{sub.unitTitle} — {sub.assignmentName}</td>
                    <td style={{ color: '#64748b', fontSize: '0.8125rem' }}>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="disclaimer" style={{ marginTop: '1.5rem' }}>
        <strong>⚠️ Important:</strong> This system provides indicators to help prioritise marking. It is not definitive proof of academic misconduct.
        Always use professional judgment and follow your institution's academic integrity policies.
      </div>
    </div>
  );
}
