'use client';

import { useParams } from 'next/navigation';
import { getSubmissionsByStudent } from '../../../../data/submissions';
import { getStudentById, getGroupById, getTeacherById, getGroupFullName } from '../../../../data/demo';
import { getUnitsByCourse, UNITS } from '../../../../data/units';

export default function StudentProfile() {
  const params = useParams();
  const studentId = params.id;
  
  const student = getStudentById(studentId);
  const submissions = getSubmissionsByStudent(studentId);
  const group = student ? getGroupById(student.groupId) : null;
  const teacher = group ? getTeacherById(group.teacherId) : null;
  
  if (!student) {
    return (
      <div className="container" style={{ paddingTop: '2rem' }}>
        <div className="card">
          <p>Student not found</p>
          <a href="/dashboard" className="btn btn-primary mt-4">Back to Dashboard</a>
        </div>
      </div>
    );
  }

  // Calculate stats
  const completedSubmissions = submissions.filter(s => s.status === 'complete');
  const redCount = completedSubmissions.filter(s => s.priorityFlag === 'red').length;
  const yellowCount = completedSubmissions.filter(s => s.priorityFlag === 'yellow').length;
  const greenCount = completedSubmissions.filter(s => s.priorityFlag === 'green').length;
  
  const hasOriginalityConcern = completedSubmissions.some(s => s.originalityScore < 80);
  const hasGradeConcern = completedSubmissions.some(s => s.gradeEstimate === 'Fail');
  const isAtRisk = hasOriginalityConcern || hasGradeConcern;
  
  // Get expected assignments for this course
  const courseUnits = getUnitsByCourse(student.course);
  const expectedAssignments = courseUnits.flatMap(u => u.assignments);

  // Group submissions by unit
  const submissionsByUnit = {};
  submissions.forEach(sub => {
    const unitId = sub.assignment?.unitId;
    if (unitId) {
      if (!submissionsByUnit[unitId]) {
        submissionsByUnit[unitId] = [];
      }
      submissionsByUnit[unitId].push(sub);
    }
  });

  // Identify patterns
  const patterns = [];
  if (redCount >= 3) {
    patterns.push({ type: 'warning', message: `Originality concerns in ${redCount} submissions — recommend conversation` });
  }
  if (hasGradeConcern) {
    patterns.push({ type: 'warning', message: 'Has failing grade(s) — intervention needed' });
  }
  const avgOriginality = completedSubmissions.length > 0 
    ? Math.round(completedSubmissions.reduce((sum, s) => sum + (s.originalityScore || 0), 0) / completedSubmissions.length)
    : null;
  if (avgOriginality && avgOriginality >= 90) {
    patterns.push({ type: 'positive', message: 'Generally strong originality scores' });
  }

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      {/* Back link */}
      <a href="/dashboard" style={{ color: '#64748b', fontSize: '0.875rem' }}>← Back to Dashboard</a>
      
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">{student.name}</h1>
        <p className="page-subtitle">
          {getGroupFullName(student.groupId)} • Teacher: {teacher?.name || 'Unknown'}
        </p>
      </div>

      {/* Overall Status Card */}
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '1rem' }}>Overall Status</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <div style={{ marginBottom: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>Submissions</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
              {completedSubmissions.length} of {expectedAssignments.length} expected
            </div>
            <div className="progress-bar" style={{ marginTop: '0.5rem' }}>
              <div 
                className="progress-fill green" 
                style={{ width: `${(completedSubmissions.length / expectedAssignments.length) * 100}%` }}
              />
            </div>
          </div>
          
          <div>
            <div style={{ marginBottom: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>At Risk</div>
            {isAtRisk ? (
              <div>
                <span className="badge badge-red" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>Yes</span>
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                  {hasOriginalityConcern && <div>• Originality below 80%</div>}
                  {hasGradeConcern && <div>• Has failing grade</div>}
                </div>
              </div>
            ) : (
              <span className="badge badge-green" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>No</span>
            )}
          </div>
        </div>

        <div className="stats-grid" style={{ marginTop: '1.5rem' }}>
          <div className="stat-box red">
            <div className="stat-value red">{redCount}</div>
            <div className="stat-label">Review</div>
          </div>
          <div className="stat-box yellow">
            <div className="stat-value yellow">{yellowCount}</div>
            <div className="stat-label">Check</div>
          </div>
          <div className="stat-box green">
            <div className="stat-value green">{greenCount}</div>
            <div className="stat-label">On Track</div>
          </div>
          <div className="stat-box gray">
            <div className="stat-value gray">{avgOriginality || '—'}%</div>
            <div className="stat-label">Avg Originality</div>
          </div>
        </div>
      </div>

      {/* Patterns & Insights */}
      {patterns.length > 0 && (
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1rem' }}>Patterns & Insights</h2>
          {patterns.map((p, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '0.5rem', 
              marginBottom: '0.5rem',
              padding: '0.5rem',
              background: p.type === 'warning' ? 'var(--color-yellow-bg)' : 'var(--color-green-bg)',
              borderRadius: '6px'
            }}>
              <span>{p.type === 'warning' ? '⚠️' : '✓'}</span>
              <span>{p.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Submissions by Unit */}
      <div className="card">
        <h2 className="card-title" style={{ marginBottom: '1rem' }}>Submission History</h2>
        
        {courseUnits.map(unit => {
          const unitSubs = submissionsByUnit[unit.id] || [];
          
          return (
            <div key={unit.id} style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                Unit {unit.number}: {unit.title}
              </h3>
              
              <div style={{ 
                background: '#f8fafc', 
                borderRadius: '8px', 
                overflow: 'hidden',
                border: '1px solid #e2e8f0'
              }}>
                {unit.assignments.map(assignment => {
                  const sub = unitSubs.find(s => s.assignment?.id === assignment.id);
                  const dueDate = new Date(assignment.handIn);
                  const isOverdue = !sub && dueDate < new Date();
                  const notYetDue = !sub && dueDate >= new Date();
                  
                  return (
                    <div 
                      key={assignment.id}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid #e2e8f0'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {sub ? (
                          <span className={`rag-dot ${sub.priorityFlag || 'gray'}`} />
                        ) : isOverdue ? (
                          <span className="rag-dot red" style={{ opacity: 0.5 }} />
                        ) : (
                          <span className="rag-dot gray" style={{ opacity: 0.3 }} />
                        )}
                        <span style={{ fontWeight: 500 }}>{assignment.name}</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {sub ? (
                          <>
                            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                              Orig: <strong className={sub.originalityScore < 80 ? 'text-red' : 'text-green'}>{sub.originalityScore}%</strong>
                            </span>
                            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                              Grade: <strong className={sub.gradeEstimate === 'Fail' ? 'text-red' : 'text-green'}>{sub.gradeEstimate}</strong>
                            </span>
                            <a href={`/dashboard/submission/${sub.id}`} className="btn btn-sm btn-secondary">
                              View Report
                            </a>
                          </>
                        ) : isOverdue ? (
                          <span className="badge badge-red">Overdue</span>
                        ) : notYetDue ? (
                          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                            Due: {dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
