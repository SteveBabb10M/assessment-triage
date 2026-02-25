// Submission data — with uploader tracking for multi-teacher access control
// Each submission is tagged with the email of the teacher who uploaded it

import { STUDENTS, getCohortById, getTeachersForUnitCohort, canTeacherSeeSubmission } from './staff';
import { getAssignmentById, getUnitByNumber, UNITS } from './units';

// ─── Submission Store ───────────────────────────────────────
// In production, this would be a database
// For now, in-memory store (resets on server restart)

let SUBMISSIONS = [];

// ─── Uploader Tracking ──────────────────────────────────────

// Add a new submission with uploader info
export function addSubmission(submission, uploaderEmail = null) {
  const newSubmission = {
    ...submission,
    uploadedBy: uploaderEmail,
    uploadedAt: new Date().toISOString()
  };
  
  SUBMISSIONS.push(newSubmission);
  return enrichSubmission(newSubmission);
}

// Get submissions filtered by user role
// - sysadmin sees everything
// - teachers see only their own uploads
export function getSubmissionsForUser(userEmail, userRole) {
  if (!userEmail) return [];
  
  // Sysadmin sees all submissions
  if (userRole === 'sysadmin') {
    return SUBMISSIONS
      .map(enrichSubmission)
      .sort((a, b) => new Date(b.uploadedAt || b.submittedAt) - new Date(a.uploadedAt || a.submittedAt));
  }
  
  // Teachers see only their own uploads
  return SUBMISSIONS
    .filter(s => s.uploadedBy === userEmail)
    .map(enrichSubmission)
    .sort((a, b) => new Date(b.uploadedAt || b.submittedAt) - new Date(a.uploadedAt || a.submittedAt));
}

// Get a single submission (with access check)
export function getSubmissionForUser(id, userEmail, userRole) {
  const submission = SUBMISSIONS.find(s => s.id === id);
  
  if (!submission) return null;
  
  // Sysadmin can see any submission
  if (userRole === 'sysadmin') {
    return enrichSubmission(submission);
  }
  
  // Teachers can only see their own uploads
  if (submission.uploadedBy === userEmail) {
    return enrichSubmission(submission);
  }
  
  return null; // Access denied
}

// Get submission counts by uploader (for admin dashboard)
export function getUploaderStats() {
  const stats = {};
  
  SUBMISSIONS.forEach(sub => {
    const uploader = sub.uploadedBy || 'Unknown';
    if (!stats[uploader]) {
      stats[uploader] = { total: 0, red: 0, yellow: 0, green: 0 };
    }
    stats[uploader].total++;
    if (sub.priorityFlag === 'red') stats[uploader].red++;
    if (sub.priorityFlag === 'yellow') stats[uploader].yellow++;
    if (sub.priorityFlag === 'green') stats[uploader].green++;
  });
  
  return stats;
}

// ─── Enrichment ─────────────────────────────────────────────

function enrichSubmission(sub) {
  const student = STUDENTS.find(s => s.id === sub.studentId);
  const cohort = student ? getCohortById(student.cohortId) : null;
  
  // Handle ad hoc submissions
  if (sub.isAdHoc) {
    const unit = sub.adHocUnitId ? UNITS[sub.adHocUnitId] : 
                 (sub.adHocUnitNumber && cohort ? 
                   Object.values(UNITS).find(u => u.number === sub.adHocUnitNumber && u.course === cohort.course) : 
                   null);
    const coTeachers = (unit && cohort) ? getTeachersForUnitCohort(unit.number, cohort.id) : [];
    
    return {
      ...sub,
      student,
      cohort,
      assignment: null,
      unit,
      coTeachers,
      cohortName: cohort?.name || 'Unknown',
      unitTitle: unit ? `Unit ${unit.number}: ${unit.title}` : `Unit ${sub.adHocUnitNumber || '?'}`,
      assignmentName: sub.adHocTitle || 'Ad hoc submission',
    };
  }
  
  // Standard submission with assignment
  const assignment = getAssignmentById(sub.assignmentId);
  const unit = assignment ? getUnitByNumber(assignment.unitNumber) : null;
  const coTeachers = (unit && cohort) ? getTeachersForUnitCohort(unit.number, cohort.id) : [];

  return {
    ...sub,
    student,
    cohort,
    assignment,
    unit,
    coTeachers,
    cohortName: cohort?.name || 'Unknown',
    unitTitle: unit ? `Unit ${unit.number}: ${unit.title}` : 'Unknown',
    assignmentName: assignment?.name || 'Unknown',
  };
}

// ─── Legacy Functions (for compatibility) ───────────────────

// These maintain backward compatibility with existing code
export function getAllSubmissions() {
  return SUBMISSIONS.map(enrichSubmission);
}

export function getSubmissionById(id) {
  const sub = SUBMISSIONS.find(s => s.id === id);
  return sub ? enrichSubmission(sub) : null;
}

// Get submissions by teacher (original logic - for reference)
export function getSubmissionsByTeacher(teacherId) {
  return SUBMISSIONS
    .map(enrichSubmission)
    .filter(sub => {
      if (!sub.unit || !sub.cohort) return false;
      return canTeacherSeeSubmission(teacherId, sub.unit.number, sub.cohort.id);
    });
}

// Get submissions for a specific student
export function getSubmissionsByStudent(studentId) {
  return SUBMISSIONS.filter(s => s.studentId === studentId).map(enrichSubmission);
}

// ─── Triage Helpers ─────────────────────────────────────────

export function getTriageCounts(submissions) {
  const complete = submissions.filter(s => s.status === 'complete');
  return {
    total: submissions.length,
    red: complete.filter(s => s.priorityFlag === 'red').length,
    yellow: complete.filter(s => s.priorityFlag === 'yellow').length,
    green: complete.filter(s => s.priorityFlag === 'green').length,
    pending: submissions.filter(s => s.status === 'pending' || s.status === 'processing').length,
    reviewed: complete.filter(s => s.reviewed).length,
  };
}

export function getAtRiskStudents(submissions) {
  const atRisk = new Map();
  submissions.forEach(sub => {
    if (sub.status !== 'complete') return;
    const isAtRisk = (sub.originalityScore !== null && sub.originalityScore < 80) || sub.gradeEstimate === 'Fail';
    if (isAtRisk && sub.student) {
      if (!atRisk.has(sub.studentId)) {
        atRisk.set(sub.studentId, { student: sub.student, cohort: sub.cohort, reasons: [] });
      }
      const entry = atRisk.get(sub.studentId);
      if (sub.originalityScore < 80) entry.reasons.push(`Originality ${sub.originalityScore}% on ${sub.unitTitle}`);
      if (sub.gradeEstimate === 'Fail') entry.reasons.push(`Fail on ${sub.unitTitle}`);
    }
  });
  return Array.from(atRisk.values());
}

export function markReviewed(submissionId) {
  const sub = SUBMISSIONS.find(s => s.id === submissionId);
  if (sub) sub.reviewed = true;
}

// ─── Unmatched Submissions ──────────────────────────────────

let UNMATCHED_SUBMISSIONS = [];

export function addUnmatchedSubmission(unmatched) {
  UNMATCHED_SUBMISSIONS.push(unmatched);
  return unmatched;
}

export function getUnmatchedSubmissions() {
  return UNMATCHED_SUBMISSIONS;
}

export function resolveUnmatchedSubmission(unmatchedId, studentId, assignmentId) {
  const idx = UNMATCHED_SUBMISSIONS.findIndex(u => u.id === unmatchedId);
  if (idx === -1) return null;
  
  const unmatched = UNMATCHED_SUBMISSIONS[idx];
  UNMATCHED_SUBMISSIONS.splice(idx, 1);
  
  return {
    ...unmatched,
    resolvedStudentId: studentId,
    resolvedAssignmentId: assignmentId,
  };
}

export function removeUnmatchedSubmission(unmatchedId) {
  const idx = UNMATCHED_SUBMISSIONS.findIndex(u => u.id === unmatchedId);
  if (idx !== -1) {
    UNMATCHED_SUBMISSIONS.splice(idx, 1);
    return true;
  }
  return false;
}

// ─── Grade Calculation ──────────────────────────────────────

export function calculateGrade(criteriaResults, assignmentCriteria) {
  if (!criteriaResults || !assignmentCriteria) return 'Unknown';
  const pCriteria = assignmentCriteria.filter(c => c.startsWith('P'));
  const mCriteria = assignmentCriteria.filter(c => c.startsWith('M'));
  const dCriteria = assignmentCriteria.filter(c => c.startsWith('D'));
  const allPMet = pCriteria.every(c => criteriaResults[c] === 'met');
  const allMMet = mCriteria.every(c => criteriaResults[c] === 'met');
  const allDMet = dCriteria.every(c => criteriaResults[c] === 'met');
  if (!allPMet) return 'Fail';
  if (!allMMet) return 'Pass';
  if (!allDMet) return 'Merit';
  return 'Distinction';
}
