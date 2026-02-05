'use client';

import { useParams } from 'next/navigation';
import { getSubmissionsByStudent } from '../../../../data/submissions';
import { getStudentById, cohort } from '../../../../data/demo';
import { units, getAllAssignments } from '../../../../data/units';

export default function StudentProfile() {
  const params = useParams();
  const studentId = params.id;

  const student = getStudentById(studentId);
  const submissions = getSubmissionsByStudent(studentId);
  const allAssignments = getAllAssignments().filter(a => a.unitType === 'coursework');

  if (!student) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="card">
          <p>Student not found</p>
          <a href="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Dashboard</a>
        </div>
      </div>
    );
  }

  const isAtRisk = submissions.some(s => s.rag === 'RED');

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <a href="/dashboard" style={{ color: '#64748b', fontSize: '0.875rem' }}>← Back to Dashboard</a>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">{student.displayName}</h1>
          <p className="page-subtitle">{cohort.name} • {cohort.programme}</p>
        </div>
        {isAtRisk && <span className="badge badge-red" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>⚠️ At Risk</span>}
      </div>

      {/* Summary stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-number">{submissions.length}</div>
          <div className="stat-label">Submissions</div>
        </div>
        <div className="stat-card">
          <div className="stat-number rag-red">{submissions.filter(s => s.rag === 'RED').length}</div>
          <div className="stat-label">🔴 Flagged</div>
        </div>
        <div className="stat-card">
          <div className="stat-number rag-green">{submissions.filter(s => s.rag === 'GREEN').length}</div>
          <div className="stat-label">🟢 On Track</div>
        </div>
      </div>

      {/* Submissions */}
      <div className="card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Submissions</h2>
        {submissions.length === 0 ? (
          <p style={{ color: '#64748b' }}>No submissions yet</p>
        ) : (
          submissions.map(sub => (
            <div key={sub.id} className="submission-row">
              <div className="submission-info">
                <div className="submission-name">{sub.analysis?.assignmentTitle || sub.assignmentId}</div>
                <div className="submission-meta">
                  {sub.submittedAt && new Date(sub.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {sub.originalityScore !== undefined && ` • Originality: ${sub.originalityScore}%`}
                  {sub.estimatedGrade && ` • Grade: ${sub.estimatedGrade}`}
                </div>
              </div>
              <div className="submission-actions">
                <span className={`badge badge-${sub.rag === 'RED' ? 'red' : sub.rag === 'AMBER' ? 'amber' : sub.rag === 'GREEN' ? 'green' : 'gray'}`}>
                  {sub.rag || sub.status}
                </span>
                <a href={`/dashboard/submission/${sub.id}`} className="btn btn-sm btn-primary">View Report</a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Assignment Progress */}
      <div className="card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Assignment Progress</h2>
        {Object.values(units).filter(u => u.type === 'coursework').map(unit => (
          <div key={unit.id} style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Unit {unit.number}: {unit.title}
            </h3>
            {Object.values(unit.assignments).map(assignment => {
              const sub = submissions.find(s => s.assignmentId === assignment.id);
              const dueDate = assignment.handIn ? new Date(assignment.handIn) : null;
              const isOverdue = dueDate && dueDate < new Date() && !sub;
              return (
                <div key={assignment.id} className="calendar-row" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                  <span>{assignment.title || `Assignment ${assignment.learningAim}`}</span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {dueDate ? dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                  </span>
                  <span>
                    {sub ? (
                      <span className={`badge badge-${sub.rag === 'RED' ? 'red' : sub.rag === 'AMBER' ? 'amber' : 'green'}`}>
                        {sub.estimatedGrade || sub.status}
                      </span>
                    ) : isOverdue ? (
                      <span className="badge badge-red">Not Submitted</span>
                    ) : (
                      <span className="badge badge-gray">Pending</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
