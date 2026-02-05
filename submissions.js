// Submissions data store
// In production, this would be backed by a database (Supabase)
// For now, uses in-memory store with demo data

let submissions = [];

// RAG classification thresholds
const RAG_THRESHOLDS = {
  RED: { originality: 80, gradeRequired: 'Fail' },
  AMBER: { originality: 90, gradeRequired: 'Pass' },
  GREEN: { originality: 90, gradeRequired: 'Merit' }
};

export function classifyRAG(originalityScore, estimatedGrade) {
  if (originalityScore < RAG_THRESHOLDS.RED.originality || estimatedGrade === 'Fail') {
    return 'RED';
  }
  if (originalityScore < RAG_THRESHOLDS.AMBER.originality || estimatedGrade === 'Pass') {
    return 'AMBER';
  }
  return 'GREEN';
}

export function addSubmission(submission) {
  const id = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const newSubmission = {
    id,
    ...submission,
    submittedAt: new Date().toISOString(),
    status: 'pending' // pending, analysing, complete, error
  };
  submissions.push(newSubmission);
  return newSubmission;
}

export function updateSubmission(id, updates) {
  const index = submissions.findIndex(s => s.id === id);
  if (index === -1) return null;
  submissions[index] = { ...submissions[index], ...updates };
  return submissions[index];
}

export function getSubmission(id) {
  return submissions.find(s => s.id === id);
}

export function getSubmissionsByStudent(studentId) {
  return submissions.filter(s => s.studentId === studentId);
}

export function getSubmissionsByAssignment(assignmentId) {
  return submissions.filter(s => s.assignmentId === assignmentId);
}

export function getSubmissionsByTeacher(teacherId) {
  return submissions.filter(s => s.teacherId === teacherId);
}

export function getAllSubmissions() {
  return [...submissions];
}

export function getSubmissionStats() {
  const total = submissions.length;
  const byRAG = {
    RED: submissions.filter(s => s.rag === 'RED').length,
    AMBER: submissions.filter(s => s.rag === 'AMBER').length,
    GREEN: submissions.filter(s => s.rag === 'GREEN').length
  };
  const pending = submissions.filter(s => s.status === 'pending').length;
  const complete = submissions.filter(s => s.status === 'complete').length;

  return { total, byRAG, pending, complete };
}

// BTEC Sequential Grading Rules
export function calculateBTECGrade(criteriaResults) {
  // criteriaResults = { P1: true/false, P2: true/false, M1: true/false, D1: true/false, ... }
  const pass = Object.entries(criteriaResults)
    .filter(([k]) => k.startsWith('P'))
    .every(([, v]) => v === true);

  const merit = Object.entries(criteriaResults)
    .filter(([k]) => k.startsWith('M'))
    .every(([, v]) => v === true);

  const distinction = Object.entries(criteriaResults)
    .filter(([k]) => k.startsWith('D'))
    .every(([, v]) => v === true);

  if (!pass) return 'Fail';
  if (pass && merit && distinction) return 'Distinction';
  if (pass && merit) return 'Merit';
  return 'Pass';
}

// At-risk detection
export function isStudentAtRisk(studentId) {
  const studentSubs = getSubmissionsByStudent(studentId);
  return studentSubs.some(s =>
    (s.originalityScore && s.originalityScore < 80) ||
    s.estimatedGrade === 'Fail'
  );
}

// Get students who haven't submitted for an assignment
export function getMissingSubmissions(assignmentId, allStudentIds) {
  const submitted = getSubmissionsByAssignment(assignmentId).map(s => s.studentId);
  return allStudentIds.filter(id => !submitted.includes(id));
}
