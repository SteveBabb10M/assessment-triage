'use client';

import { useState, useEffect } from 'react';
import { 
  getAllSubmissions, 
  getSubmissionsByTeacher, 
  getTriageCounts, 
  getAtRiskStudents,
  markReviewed 
} from '../../data/submissions';
import { TEACHERS, GROUPS, getGroupFullName, getGroupsByTeacher } from '../../data/demo';
import { COURSES, getUnitsByCourse } from '../../data/units';

export default function Dashboard() {
  const [currentTeacher, setCurrentTeacher] = useState(TEACHERS[0]);
  const [viewMode, setViewMode] = useState('teacher'); // 'teacher' or 'department'
  const [filterGroup, setFilterGroup] = useState('all');
  const [filterUnit, setFilterUnit] = useState('all');
  const [submissions, setSubmissions] = useState([]);
  const [expandedSections, setExpandedSections] = useState({ red: true, yellow: false, green: false });

  useEffect(() => {
    loadSubmissions();
  }, [currentTeacher, viewMode]);

  function loadSubmissions() {
    let subs;
    if (viewMode === 'department' || currentTeacher.isHoD) {
      subs = getAllSubmissions();
    } else {
      subs = getSubmissionsByTeacher(currentTeacher.id);
    }
    setSubmissions(subs);
  }

  function handleMarkReviewed(submissionId) {
    markReviewed(submissionId);
    loadSubmissions();
  }

  function toggleSection(section) {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }

  // Filter submissions
  let filteredSubmissions = submissions;
  if (filterGroup !== 'all') {
    filteredSubmissions = filteredSubmissions.filter(s => s.group?.id === filterGroup);
  }
  if (filterUnit !== 'all') {
    filteredSubmissions = filteredSubmissions.filter(s => s.assignment?.unitId === filterUnit);
  }

  const counts = getTriageCounts(filteredSubmissions);
  const atRiskStudents = getAtRiskStudents(filteredSubmissions);

  // Separate by priority
  const redSubmissions = filteredSubmissions.filter(s => s.priorityFlag === 'red' && s.status === 'complete');
  const yellowSubmissions = filteredSubmissions.filter(s => s.priorityFlag === 'yellow' && s.status === 'complete');
  const greenSubmissions = filteredSubmissions.filter(s => s.priorityFlag === 'green' && s.status === 'complete');
  const pendingSubmissions = filteredSubmissions.filter(s => s.status === 'pending' || s.status === 'processing');

  // Get available groups for filter
  const availableGroups = viewMode === 'department' ? GROUPS : getGroupsByTeacher(currentTeacher.id);

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">
              {viewMode === 'department' ? 'Department Overview' : 'Triage Dashboard'}
            </h1>
            <p className="page-subtitle">
              {viewMode === 'department' 
                ? 'All groups and students'
                : `Viewing as ${currentTeacher.name}`
              }
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select 
              className="select" 
              style={{ width: 'auto' }}
              value={currentTeacher.id}
              onChange={(e) => setCurrentTeacher(TEACHERS.find(t => t.id === e.target.value))}
            >
              {TEACHERS.map(t => (
                <option key={t.id} value={t.id}>{t.name} {t.isHoD ? '(HoD)' : ''}</option>
              ))}
            </select>
            {currentTeacher.isHoD && (
              <button 
                className={`btn ${viewMode === 'department' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setViewMode(viewMode === 'department' ? 'teacher' : 'department')}
              >
                {viewMode === 'department' ? '👤 My Groups' : '🏢 Department'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-box red">
          <div className="stat-value red">🔴 {counts.red}</div>
          <div className="stat-label">Needs Review</div>
        </div>
        <div className="stat-box yellow">
          <div className="stat-value yellow">🟡 {counts.yellow}</div>
          <div className="stat-label">Worth Checking</div>
        </div>
        <div className="stat-box green">
          <div className="stat-value green">🟢 {counts.green}</div>
          <div className="stat-label">On Track</div>
        </div>
        <div className="stat-box gray">
          <div className="stat-value gray">⏳ {counts.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters no-print">
        <div className="filter-group">
          <span className="filter-label">Group:</span>
          <select className="select" style={{ width: 'auto' }} value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
            <option value="all">All Groups</option>
            {availableGroups.map(g => (
              <option key={g.id} value={g.id}>{getGroupFullName(g.id)}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <span className="filter-label">Unit:</span>
          <select className="select" style={{ width: 'auto' }} value={filterUnit} onChange={e => setFilterUnit(e.target.value)}>
            <option value="all">All Units</option>
            {[...getUnitsByCourse('foundation'), ...getUnitsByCourse('extended')].map(u => (
              <option key={u.id} value={u.id}>Unit {u.number}: {u.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Department View: At Risk Students */}
      {viewMode === 'department' && atRiskStudents.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <h2 className="card-title">⚠️ At Risk Students ({atRiskStudents.length})</h2>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Group</th>
                  <th>Submissions</th>
                  <th>🔴</th>
                  <th>🟡</th>
                  <th>🟢</th>
                  <th>Risk Reason</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {atRiskStudents.slice(0, 10).map(risk => (
                  <tr key={risk.studentId}>
                    <td><strong>{risk.student?.name}</strong></td>
                    <td>{risk.group ? getGroupFullName(risk.group.id) : ''}</td>
                    <td>{risk.submissions.length}</td>
                    <td className="text-red">{risk.redCount}</td>
                    <td className="text-yellow">{risk.yellowCount}</td>
                    <td className="text-green">{risk.greenCount}</td>
                    <td>
                      {risk.riskReasons.map((r, i) => (
                        <span key={i} className="badge badge-red" style={{ marginRight: '0.25rem' }}>{r}</span>
                      ))}
                    </td>
                    <td>
                      <a href={`/dashboard/student/${risk.studentId}`} className="btn btn-sm btn-secondary">View</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Red Submissions */}
      <div className="section-header">
        <button 
          onClick={() => toggleSection('red')} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}
        >
          {expandedSections.red ? '▼' : '▶'}
        </button>
        <h2 className="section-title text-red">🔴 Needs Review</h2>
        <span className="section-count">({redSubmissions.length})</span>
      </div>
      {expandedSections.red && (
        <div>
          {redSubmissions.length === 0 ? (
            <div className="empty-state">No submissions need urgent review</div>
          ) : (
            redSubmissions.map(sub => (
              <SubmissionCard key={sub.id} submission={sub} onMarkReviewed={handleMarkReviewed} />
            ))
          )}
        </div>
      )}

      {/* Yellow Submissions */}
      <div className="section-header">
        <button 
          onClick={() => toggleSection('yellow')} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}
        >
          {expandedSections.yellow ? '▼' : '▶'}
        </button>
        <h2 className="section-title text-yellow">🟡 Worth Checking</h2>
        <span className="section-count">({yellowSubmissions.length})</span>
      </div>
      {expandedSections.yellow && (
        <div>
          {yellowSubmissions.length === 0 ? (
            <div className="empty-state">No submissions in this category</div>
          ) : (
            yellowSubmissions.map(sub => (
              <SubmissionCard key={sub.id} submission={sub} onMarkReviewed={handleMarkReviewed} />
            ))
          )}
        </div>
      )}

      {/* Green Submissions */}
      <div className="section-header">
        <button 
          onClick={() => toggleSection('green')} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}
        >
          {expandedSections.green ? '▼' : '▶'}
        </button>
        <h2 className="section-title text-green">🟢 On Track</h2>
        <span className="section-count">({greenSubmissions.length})</span>
      </div>
      {expandedSections.green && (
        <div>
          {greenSubmissions.length === 0 ? (
            <div className="empty-state">No submissions in this category</div>
          ) : (
            greenSubmissions.map(sub => (
              <SubmissionCard key={sub.id} submission={sub} onMarkReviewed={handleMarkReviewed} />
            ))
          )}
        </div>
      )}

      {/* Pending */}
      {pendingSubmissions.length > 0 && (
        <>
          <div className="section-header">
            <h2 className="section-title text-gray">⏳ Pending Analysis</h2>
            <span className="section-count">({pendingSubmissions.length})</span>
          </div>
          <div>
            {pendingSubmissions.map(sub => (
              <SubmissionCard key={sub.id} submission={sub} onMarkReviewed={handleMarkReviewed} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SubmissionCard({ submission, onMarkReviewed }) {
  const sub = submission;
  const flagColor = sub.priorityFlag || 'gray';
  
  return (
    <div className={`submission-card ${flagColor}`}>
      <div className="submission-header">
        <div>
          <div className="submission-student">{sub.student?.name || 'Unknown Student'}</div>
          <div className="submission-meta">
            {sub.groupFullName} • {sub.assignment?.unitTitle || 'Unknown Unit'} {sub.assignment?.name || ''}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="submission-meta">
            {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('en-GB', { 
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
            }) : ''}
          </div>
          {sub.reviewed && <span className="badge badge-green">✓ Reviewed</span>}
        </div>
      </div>

      {sub.status === 'complete' && (
        <>
          <div className="submission-scores">
            <div>
              <span style={{ color: '#64748b' }}>Originality: </span>
              <strong className={sub.originalityScore < 80 ? 'text-red' : sub.originalityScore < 90 ? 'text-yellow' : 'text-green'}>
                {sub.originalityScore}%
              </strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Grade: </span>
              <strong className={
                sub.gradeEstimate === 'Fail' ? 'text-red' : 
                sub.gradeEstimate === 'Pass' ? 'text-yellow' : 'text-green'
              }>
                {sub.gradeEstimate}
              </strong>
            </div>
            {sub.criteriaResults && Object.keys(sub.criteriaResults).length > 0 && (
              <div className="criteria-grid">
                {Object.entries(sub.criteriaResults).map(([crit, status]) => (
                  <span key={crit} className={`criteria-badge ${status}`}>
                    {crit} {status === 'met' ? '✓' : status === 'partial' ? '⚠' : '✗'}
                  </span>
                ))}
              </div>
            )}
          </div>

          {sub.flags && sub.flags.length > 0 && (
            <div className="submission-flags">
              {sub.flags.slice(0, 3).map((flag, i) => (
                <div key={i} className="flag-item">
                  <span className="flag-icon">
                    {flag.severity === 'high' ? '🔴' : flag.severity === 'medium' ? '🟡' : '⚪'}
                  </span>
                  <span>{flag.message}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {(sub.status === 'pending' || sub.status === 'processing') && (
        <div style={{ color: '#64748b', fontStyle: 'italic' }}>
          {sub.status === 'processing' ? 'Analysis in progress...' : 'Awaiting analysis'}
        </div>
      )}

      <div className="submission-actions">
        <a href={`/dashboard/submission/${sub.id}`} className="btn btn-sm btn-primary">
          View Full Report
        </a>
        <a href={`/dashboard/student/${sub.studentId}`} className="btn btn-sm btn-secondary">
          View Student
        </a>
        {!sub.reviewed && sub.status === 'complete' && (
          <button className="btn btn-sm btn-secondary" onClick={() => onMarkReviewed(sub.id)}>
            Mark Reviewed ✓
          </button>
        )}
      </div>
    </div>
  );
}
