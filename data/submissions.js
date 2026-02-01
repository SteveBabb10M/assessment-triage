// Demo submission data for proof of concept
// In production, this would come from Supabase

import { STUDENTS, getGroupById, getTeacherById } from './demo';
import { getAssignmentById } from './units';

// Sample submission data
const DEMO_SUBMISSIONS = [
  {
    id: 'sub1',
    studentId: 'student1',
    assignmentId: 'unit1-ab',
    fileName: 'Unit1_Assignment_AB.docx',
    submittedAt: '2025-10-14T14:34:00Z',
    status: 'complete',
    originalityScore: 62,
    gradeEstimate: 'Pass',
    priorityFlag: 'red',
    criteriaResults: {
      P1: 'met', P2: 'met', P3: 'partial',
      M1: 'partial', M2: 'not_met',
      D1: 'not_met'
    },
    flags: [
      { type: 'ai_content', severity: 'high', message: 'AI-generated content detected in M1 assessment sections' },
      { type: 'copy_paste', severity: 'high', message: 'Copy-paste error: "Qatar Telecom" appears mid-text' },
      { type: 'vocabulary', severity: 'medium', message: 'Vocabulary mismatch: "compartmentalised structure" beyond expected level' }
    ],
    authenticElements: [
      'Spelling error "Defenition" suggests human input',
      'Local reference to Leicester Highcross Apple Store',
      'Inconsistent date formatting (human error pattern)'
    ],
    wordCount: 4832,
    summary: 'Significant originality concerns with AI-generated content detected. Pass criteria met but Merit criteria lacking evidence.',
    reviewed: false
  },
  {
    id: 'sub2',
    studentId: 'student1',
    assignmentId: 'unit1-cd',
    fileName: 'Unit1_Assignment_CD.docx',
    submittedAt: '2025-11-20T09:15:00Z',
    status: 'complete',
    originalityScore: 85,
    gradeEstimate: 'Pass',
    priorityFlag: 'yellow',
    criteriaResults: {
      P3: 'met', P4: 'met', P5: 'met', P6: 'met',
      M3: 'partial',
      D2: 'not_met', D3: 'not_met'
    },
    flags: [
      { type: 'ai_phrases', severity: 'medium', message: 'Some AI indicator phrases detected but within acceptable range' }
    ],
    authenticElements: [
      'Personal examples used throughout',
      'Consistent writing style'
    ],
    wordCount: 3654,
    summary: 'Minor originality concerns. Pass criteria achieved, Merit criteria partially evidenced.',
    reviewed: false
  },
  {
    id: 'sub3',
    studentId: 'student2',
    assignmentId: 'unit1-ab',
    fileName: 'Business_Features_Essay.docx',
    submittedAt: '2025-10-13T16:42:00Z',
    status: 'complete',
    originalityScore: 94,
    gradeEstimate: 'Merit',
    priorityFlag: 'green',
    criteriaResults: {
      P1: 'met', P2: 'met', P3: 'met',
      M1: 'met', M2: 'met',
      D1: 'partial'
    },
    flags: [],
    authenticElements: [
      'Strong personal voice throughout',
      'Original research with local business examples',
      'Consistent quality across sections'
    ],
    wordCount: 5120,
    summary: 'Excellent submission with high originality. Merit criteria achieved, approaching Distinction.',
    reviewed: true,
    reviewedAt: '2025-10-15T10:00:00Z'
  },
  {
    id: 'sub4',
    studentId: 'student3',
    assignmentId: 'unit1-ab',
    fileName: 'Unit1_Submission.docx',
    submittedAt: '2025-10-12T11:20:00Z',
    status: 'complete',
    originalityScore: 45,
    gradeEstimate: 'Fail',
    priorityFlag: 'red',
    criteriaResults: {
      P1: 'met', P2: 'not_met', P3: 'not_met',
      M1: 'not_met', M2: 'not_met',
      D1: 'not_met'
    },
    flags: [
      { type: 'ai_content', severity: 'high', message: 'High AI likelihood throughout submission' },
      { type: 'incomplete', severity: 'high', message: 'P2 not addressed - stakeholder influence missing' },
      { type: 'word_count', severity: 'medium', message: 'Significantly under expected word count (890 words)' }
    ],
    authenticElements: [],
    wordCount: 890,
    summary: 'Serious concerns. High AI likelihood and incomplete submission. P2 criteria not met resulting in Fail grade.',
    reviewed: false
  },
  {
    id: 'sub5',
    studentId: 'student4',
    assignmentId: 'unit1-ab',
    fileName: 'Exploring_Business.docx',
    submittedAt: '2025-10-14T09:00:00Z',
    status: 'complete',
    originalityScore: 91,
    gradeEstimate: 'Distinction',
    priorityFlag: 'green',
    criteriaResults: {
      P1: 'met', P2: 'met', P3: 'met',
      M1: 'met', M2: 'met',
      D1: 'met'
    },
    flags: [],
    authenticElements: [
      'Extensive independent research demonstrated',
      'Critical analysis throughout',
      'Original case study comparisons'
    ],
    wordCount: 6230,
    summary: 'Outstanding submission. All criteria met including Distinction level analysis.',
    reviewed: true,
    reviewedAt: '2025-10-16T14:30:00Z'
  },
  {
    id: 'sub6',
    studentId: 'student5',
    assignmentId: 'unit1-ab',
    fileName: 'Assignment1.docx',
    submittedAt: '2025-10-15T13:45:00Z',
    status: 'complete',
    originalityScore: 78,
    gradeEstimate: 'Pass',
    priorityFlag: 'red',
    criteriaResults: {
      P1: 'met', P2: 'met', P3: 'partial',
      M1: 'not_met', M2: 'not_met',
      D1: 'not_met'
    },
    flags: [
      { type: 'ai_content', severity: 'medium', message: 'AI assistance likely in analysis sections' },
      { type: 'generic', severity: 'medium', message: 'Analysis is generic, could apply to any business' }
    ],
    authenticElements: [
      'Introduction appears genuine',
      'Some personal observations included'
    ],
    wordCount: 3200,
    summary: 'Below originality threshold. Pass criteria met but lacks depth for higher grades.',
    reviewed: false
  },
  {
    id: 'sub7',
    studentId: 'student6',
    assignmentId: 'unit1-ab',
    fileName: 'Business_Unit1.docx',
    submittedAt: '2025-10-14T16:20:00Z',
    status: 'complete',
    originalityScore: 88,
    gradeEstimate: 'Merit',
    priorityFlag: 'yellow',
    criteriaResults: {
      P1: 'met', P2: 'met', P3: 'met',
      M1: 'met', M2: 'partial',
      D1: 'not_met'
    },
    flags: [
      { type: 'structure', severity: 'low', message: 'Some formulaic paragraph structures' }
    ],
    authenticElements: [
      'Good use of local examples',
      'Personal reflection evident'
    ],
    wordCount: 4500,
    summary: 'Solid submission. Merit criteria mostly achieved with room for improvement on M2.',
    reviewed: false
  },
  {
    id: 'sub8',
    studentId: 'student7',
    assignmentId: 'unit1-ab',
    fileName: 'Unit1_Work.docx',
    submittedAt: '2025-10-13T10:00:00Z',
    status: 'complete',
    originalityScore: 72,
    gradeEstimate: 'Pass',
    priorityFlag: 'red',
    criteriaResults: {
      P1: 'met', P2: 'met', P3: 'partial',
      M1: 'partial', M2: 'not_met',
      D1: 'not_met'
    },
    flags: [
      { type: 'ai_content', severity: 'high', message: 'Multiple AI signature phrases detected' },
      { type: 'inconsistent', severity: 'medium', message: 'Quality varies significantly between sections' }
    ],
    authenticElements: [
      'Some genuine errors suggest partial human input'
    ],
    wordCount: 3800,
    summary: 'Originality concerns. Pass achieved but evidence of significant AI assistance.',
    reviewed: false
  },
  // Add some pending submissions
  {
    id: 'sub9',
    studentId: 'student8',
    assignmentId: 'unit1-ab',
    fileName: 'My_Assignment.docx',
    submittedAt: '2025-10-15T15:30:00Z',
    status: 'processing',
    originalityScore: null,
    gradeEstimate: null,
    priorityFlag: null,
    criteriaResults: {},
    flags: [],
    authenticElements: [],
    wordCount: null,
    summary: null,
    reviewed: false
  },
  {
    id: 'sub10',
    studentId: 'student9',
    assignmentId: 'unit1-ab',
    fileName: 'Business_Essay.docx',
    submittedAt: '2025-10-15T15:45:00Z',
    status: 'pending',
    originalityScore: null,
    gradeEstimate: null,
    priorityFlag: null,
    criteriaResults: {},
    flags: [],
    authenticElements: [],
    wordCount: null,
    summary: null,
    reviewed: false
  }
];

// In-memory store for submissions (for POC)
let submissions = [...DEMO_SUBMISSIONS];

// Get all submissions
export function getAllSubmissions() {
  return submissions.map(enrichSubmission);
}

// Get submission by ID
export function getSubmissionById(submissionId) {
  const sub = submissions.find(s => s.id === submissionId);
  return sub ? enrichSubmission(sub) : null;
}

// Get submissions by student
export function getSubmissionsByStudent(studentId) {
  return submissions.filter(s => s.studentId === studentId).map(enrichSubmission);
}

// Get submissions by assignment
export function getSubmissionsByAssignment(assignmentId) {
  return submissions.filter(s => s.assignmentId === assignmentId).map(enrichSubmission);
}

// Get submissions by group
export function getSubmissionsByGroup(groupId) {
  const groupStudents = STUDENTS.filter(s => s.groupId === groupId).map(s => s.id);
  return submissions.filter(s => groupStudents.includes(s.studentId)).map(enrichSubmission);
}

// Get submissions by teacher (all their groups)
export function getSubmissionsByTeacher(teacherId) {
  const teacherGroups = GROUPS.filter(g => g.teacherId === teacherId).map(g => g.id);
  const teacherStudents = STUDENTS.filter(s => teacherGroups.includes(s.groupId)).map(s => s.id);
  return submissions.filter(s => teacherStudents.includes(s.studentId)).map(enrichSubmission);
}

// Get submissions by course
export function getSubmissionsByCourse(courseId) {
  const courseStudents = STUDENTS.filter(s => s.course === courseId).map(s => s.id);
  return submissions.filter(s => courseStudents.includes(s.studentId)).map(enrichSubmission);
}

// Add a new submission
export function addSubmission(submission) {
  const newSub = {
    id: `sub${Date.now()}`,
    status: 'pending',
    submittedAt: new Date().toISOString(),
    reviewed: false,
    flags: [],
    authenticElements: [],
    criteriaResults: {},
    ...submission
  };
  submissions.push(newSub);
  return enrichSubmission(newSub);
}

// Update submission (e.g., after analysis)
export function updateSubmission(submissionId, updates) {
  const index = submissions.findIndex(s => s.id === submissionId);
  if (index !== -1) {
    submissions[index] = { ...submissions[index], ...updates };
    return enrichSubmission(submissions[index]);
  }
  return null;
}

// Mark submission as reviewed
export function markReviewed(submissionId) {
  return updateSubmission(submissionId, {
    reviewed: true,
    reviewedAt: new Date().toISOString()
  });
}

// Enrich submission with related data
function enrichSubmission(sub) {
  const student = STUDENTS.find(s => s.id === sub.studentId);
  const group = student ? getGroupById(student.groupId) : null;
  const teacher = group ? getTeacherById(group.teacherId) : null;
  const assignment = getAssignmentById(sub.assignmentId);
  
  return {
    ...sub,
    student,
    group,
    teacher,
    assignment,
    groupFullName: group ? `${group.course === 'foundation' ? 'Foundation Diploma' : 'Extended Diploma'} ${group.name}` : ''
  };
}

// Get triage counts
export function getTriageCounts(submissionsList) {
  const counts = {
    red: 0,
    yellow: 0,
    green: 0,
    pending: 0,
    total: submissionsList.length
  };
  
  submissionsList.forEach(sub => {
    if (sub.status === 'pending' || sub.status === 'processing') {
      counts.pending++;
    } else if (sub.priorityFlag === 'red') {
      counts.red++;
    } else if (sub.priorityFlag === 'yellow') {
      counts.yellow++;
    } else if (sub.priorityFlag === 'green') {
      counts.green++;
    }
  });
  
  return counts;
}

// Get at-risk students (originality < 80% or Fail grade)
export function getAtRiskStudents(submissionsList) {
  const studentRisk = {};
  
  submissionsList.forEach(sub => {
    if (sub.status !== 'complete') return;
    
    const studentId = sub.studentId;
    if (!studentRisk[studentId]) {
      studentRisk[studentId] = {
        studentId,
        student: sub.student,
        group: sub.group,
        submissions: [],
        redCount: 0,
        yellowCount: 0,
        greenCount: 0,
        isAtRisk: false,
        riskReasons: []
      };
    }
    
    const record = studentRisk[studentId];
    record.submissions.push(sub);
    
    if (sub.priorityFlag === 'red') record.redCount++;
    else if (sub.priorityFlag === 'yellow') record.yellowCount++;
    else if (sub.priorityFlag === 'green') record.greenCount++;
    
    if (sub.originalityScore !== null && sub.originalityScore < 80) {
      record.isAtRisk = true;
      if (!record.riskReasons.includes('Originality < 80%')) {
        record.riskReasons.push('Originality < 80%');
      }
    }
    
    if (sub.gradeEstimate === 'Fail') {
      record.isAtRisk = true;
      if (!record.riskReasons.includes('Fail grade')) {
        record.riskReasons.push('Fail grade');
      }
    }
  });
  
  return Object.values(studentRisk).filter(r => r.isAtRisk);
}

// Import GROUPS for internal use
import { GROUPS } from './demo';
