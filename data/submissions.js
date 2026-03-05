// Submission data — Supabase-backed persistent storage
// Each submission is tagged with the email of the teacher who uploaded it

import { supabase } from '../lib/supabase';
import { STUDENTS, getCohortById, getTeachersForUnitCohort, canTeacherSeeSubmission } from './staff';
import { getAssignmentById, getUnitByNumber, UNITS } from './units';

// ─── Fallback In-Memory Store ──────────────────────────────
// Used when Supabase is not configured (local dev without DB)
let SUBMISSIONS_FALLBACK = [];

const useDatabase = !!supabase;

// ─── Submission CRUD ───────────────────────────────────────

// Add a new submission with uploader info
export async function addSubmission(submission, uploaderEmail = null) {
  const newSubmission = {
    ...submission,
    uploadedBy: uploaderEmail,
    uploadedAt: new Date().toISOString()
  };

  if (useDatabase) {
    const { data, error } = await supabase
      .from('submissions')
      .insert({
        id: newSubmission.id,
        student_id: newSubmission.studentId,
        assignment_id: newSubmission.assignmentId || null,
        uploaded_by: uploaderEmail,
        uploaded_at: newSubmission.uploadedAt,
        priority_flag: newSubmission.priorityFlag || null,
        status: newSubmission.status || 'pending',
        is_ad_hoc: newSubmission.isAdHoc || false,
        reviewed: newSubmission.reviewed || false,
        data: newSubmission
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      // Fall back to in-memory
      SUBMISSIONS_FALLBACK.push(newSubmission);
      return enrichSubmission(newSubmission);
    }

    return enrichSubmission(data.data);
  }

  // In-memory fallback
  SUBMISSIONS_FALLBACK.push(newSubmission);
  return enrichSubmission(newSubmission);
}

// Get submissions filtered by user role
export async function getSubmissionsForUser(userEmail, userRole) {
  if (!userEmail) return [];

  if (useDatabase) {
    let query = supabase.from('submissions').select('*');

    if (userRole !== 'sysadmin') {
      query = query.eq('uploaded_by', userEmail);
    }

    query = query.order('uploaded_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Supabase fetch error:', error);
      return [];
    }

    return (data || []).map(row => enrichSubmission(row.data));
  }

  // In-memory fallback
  const filtered = userRole === 'sysadmin'
    ? SUBMISSIONS_FALLBACK
    : SUBMISSIONS_FALLBACK.filter(s => s.uploadedBy === userEmail);

  return filtered
    .map(enrichSubmission)
    .sort((a, b) => new Date(b.uploadedAt || b.submittedAt) - new Date(a.uploadedAt || a.submittedAt));
}

// Get a single submission (with access check)
export async function getSubmissionForUser(id, userEmail, userRole) {
  if (useDatabase) {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    if (userRole !== 'sysadmin' && data.uploaded_by !== userEmail) {
      return null;
    }

    return enrichSubmission(data.data);
  }

  // In-memory fallback
  const submission = SUBMISSIONS_FALLBACK.find(s => s.id === id);
  if (!submission) return null;
  if (userRole !== 'sysadmin' && submission.uploadedBy !== userEmail) return null;
  return enrichSubmission(submission);
}

// Get submission counts by uploader (for admin dashboard)
export async function getUploaderStats() {
  if (useDatabase) {
    const { data, error } = await supabase
      .from('submissions')
      .select('uploaded_by, priority_flag');

    if (error) {
      console.error('Supabase stats error:', error);
      return {};
    }

    const stats = {};
    (data || []).forEach(row => {
      const uploader = row.uploaded_by || 'Unknown';
      if (!stats[uploader]) {
        stats[uploader] = { total: 0, red: 0, yellow: 0, green: 0 };
      }
      stats[uploader].total++;
      if (row.priority_flag === 'red') stats[uploader].red++;
      if (row.priority_flag === 'yellow') stats[uploader].yellow++;
      if (row.priority_flag === 'green') stats[uploader].green++;
    });
    return stats;
  }

  // In-memory fallback
  const stats = {};
  SUBMISSIONS_FALLBACK.forEach(sub => {
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

  const assignment = getAssignmentById(sub.assignmentId);
  const unit = assignment ? getUnitByNumber(assignment.unitNumber) : null;
  const coTeachers = (unit && cohort) ? getTeachersForUnitCohort(unit.number, cohort.id) : [];

  // Use assignment.unitTitle (resolved from the correct unit via unitId) rather than
  // getUnitByNumber which can return the wrong unit when BTEC and T Level share number 1
  const resolvedUnitTitle = assignment
    ? `Unit ${assignment.unitNumber}: ${assignment.unitTitle}`
    : (unit ? `Unit ${unit.number}: ${unit.title}` : 'Unknown');

  return {
    ...sub,
    student,
    cohort,
    assignment,
    unit,
    coTeachers,
    cohortName: cohort?.name || 'Unknown',
    unitTitle: resolvedUnitTitle,
    assignmentName: assignment?.name || 'Unknown',
  };
}

// ─── Legacy / Compatibility Functions ───────────────────────

export async function getAllSubmissions() {
  if (useDatabase) {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return [];
    }
    return (data || []).map(row => enrichSubmission(row.data));
  }

  return SUBMISSIONS_FALLBACK.map(enrichSubmission);
}

export async function getSubmissionById(id) {
  if (useDatabase) {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return enrichSubmission(data.data);
  }

  const sub = SUBMISSIONS_FALLBACK.find(s => s.id === id);
  return sub ? enrichSubmission(sub) : null;
}

export async function getSubmissionsByTeacher(teacherId) {
  const all = await getAllSubmissions();
  return all.filter(sub => {
    if (!sub.unit || !sub.cohort) return false;
    return canTeacherSeeSubmission(teacherId, sub.unit.number, sub.cohort.id);
  });
}

export async function getSubmissionsByStudent(studentId) {
  if (useDatabase) {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('student_id', studentId)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return [];
    }
    return (data || []).map(row => enrichSubmission(row.data));
  }

  return SUBMISSIONS_FALLBACK.filter(s => s.studentId === studentId).map(enrichSubmission);
}

// ─── Mark Reviewed ─────────────────────────────────────────

export async function markReviewed(submissionId) {
  if (useDatabase) {
    const { data: existing, error: fetchError } = await supabase
      .from('submissions')
      .select('data')
      .eq('id', submissionId)
      .single();

    if (fetchError || !existing) return;

    const updatedData = { ...existing.data, reviewed: true };

    const { error } = await supabase
      .from('submissions')
      .update({ reviewed: true, data: updatedData })
      .eq('id', submissionId);

    if (error) console.error('Supabase update error:', error);
    return;
  }

  const sub = SUBMISSIONS_FALLBACK.find(s => s.id === submissionId);
  if (sub) sub.reviewed = true;
}

// ─── Triage Helpers (work on enriched arrays — no DB needed) ─

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

// ─── Unmatched Submissions ──────────────────────────────────
// These stay in-memory for now — they're transient and low volume

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
