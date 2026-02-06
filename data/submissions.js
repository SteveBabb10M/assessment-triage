// Submission data — in production this comes from Supabase
// Sample submissions use real student names for realistic demo

import { STUDENTS, getCohortById, getTeachersForUnitCohort, canTeacherSeeSubmission } from './staff';
import { getAssignmentById, getUnitByNumber } from './units';

// ─── Sample Submissions ──────────────────────────────────────
// Mix of RAG statuses across different cohorts/units for demo
let SUBMISSIONS = [
  // RED — High concern: AI content detected (DETAILED ANALYSIS FORMAT)
  {
    id: 'sub-001',
    studentId: 'bs1-04',  // Bharat: Prayas
    assignmentId: 'unit8-a',
    fileName: 'Unit8_AssignmentA_Prayas.docx',
    submittedAt: '2025-10-03T14:34:00Z',
    status: 'complete',
    originalityScore: 38,
    originalityVerdict: 'High concern',
    likelyAITool: 'ChatGPT',
    likelyAIToolReasoning: 'Based on stylistic markers: the "all things considered" signature phrase, balanced pros/cons structure, tendency toward business jargon, and three-paragraph assessment formula are characteristic of ChatGPT (GPT-3.5 or GPT-4) rather than Claude or other tools.',
    confidenceLevel: 'High',
    gradeEstimate: 'Pass',
    priorityFlag: 'red',
    criteriaResults: { P1: 'met', P2: 'met', M1: 'partial', D1: 'not_met' },
    wordCount: 4832,
    reviewed: false,

    // ─── Section-by-Section Analysis ───
    sectionAnalysis: [
      {
        section: 'Introduction and Template Sections',
        quality: 'Basic, formulaic',
        likelySource: 'Teacher template',
        notes: 'The opening paragraph and contents page structure appear to be teacher-provided scaffolding or copied from assignment brief. This is normal and expected.',
      },
      {
        section: 'Basic Business Information',
        quality: 'Mixed, some errors',
        likelySource: 'Partly student',
        notes: 'Mixed authenticity. Contains misspelling "Defenition", inconsistent date formatting (11/09/2025 vs 11.09.2025). These errors suggest some human input, but surrounding sophisticated analysis is incongruous.',
      },
      {
        section: 'Stakeholder Definitions',
        quality: 'Textbook-like',
        likelySource: 'AI or copied notes',
        notes: 'Definitions are technically accurate but written in a style that suggests direct copying from AI output or textbook sources.',
      },
      {
        section: 'Assessment Sections (M1 Criterion)',
        quality: 'Highly sophisticated',
        likelySource: 'AI-generated (likely ChatGPT)',
        notes: 'MAJOR CONCERN. Every stakeholder assessment follows identical three-part pattern: description of methods, analysis of effectiveness, summary of relationship. This mechanical uniformity is characteristic of AI tools.',
      },
      {
        section: 'References',
        quality: 'Minimal, inconsistent',
        likelySource: 'Student (inadequate)',
        notes: 'Despite listing some URLs, the analysis doesn\'t draw specific data from them beyond surface-level facts.',
      },
    ],

    // ─── AI Phrase Detection ───
    aiPhraseAnalysis: [
      { phrase: 'All things considered', occurrences: 5, significance: 'Classic ChatGPT closing phrase' },
      { phrase: 'Nevertheless', occurrences: 4, significance: 'Favoured AI transitional word' },
      { phrase: 'Taking everything into consideration', occurrences: 2, significance: 'AI summary phrase' },
      { phrase: 'multi-channel approach/strategy', occurrences: 5, significance: 'Business jargon AI defaults to' },
      { phrase: 'mission-driven', occurrences: 3, significance: 'Generic AI vocabulary' },
      { phrase: 'Despite these challenges/drawbacks', occurrences: 3, significance: 'AI balance phrase' },
    ],

    // ─── Vocabulary Inconsistencies ───
    vocabularyFlags: [
      {
        quote: '"Apple has an ownership structure that allows it to have long-term strategic orientation and financial stability by having institutional investors such as Vanguard and BlackRock as its dominant owners"',
        concern: 'Phrase "long-term strategic orientation" is far beyond expected BTEC L3 vocabulary',
      },
      {
        quote: '"The compartmentalised structure allows protecting innovation and reducing leaks"',
        concern: 'Term "compartmentalised structure" unlikely to be in student\'s natural vocabulary',
      },
      {
        quote: '"The dynamic may also lead to tension between the shareholder interest and more general stakeholder interests"',
        concern: 'Sophisticated academic phrasing inconsistent with expected level',
      },
    ],

    // ─── Copy-Paste Errors ───
    copyPasteErrors: [
      {
        text: '"Qatar Telecom exhibits a commitment to transparency and growth through regular updates..."',
        location: 'LOROS staff section',
        significance: 'This sentence appears in the LOROS section and makes no contextual sense. "Qatar Telecom" is clearly a remnant from another AI generation or different assignment. This is compelling evidence of copy-pasting AI-generated content without careful review.',
      },
    ],

    // ─── Additional Concerns ───
    additionalConcerns: [
      'No genuine engagement with sources: Despite listing URLs, the analysis doesn\'t draw specific data from them beyond surface-level facts.',
      'Generic analysis: The stakeholder assessments could apply to almost any large company or charity—they don\'t show specific research.',
      'Perfect grammar in extended sections: A student would typically show more grammatical inconsistencies in longer pieces.',
      'Image references: The document references images/charts but the analysis around them is AI-generic.',
    ],

    // ─── Authentic Elements ───
    authenticElements: [
      'Misspelling "Defenition" suggests some human input',
      'Inconsistent date formatting (11/09/2025 vs 11.09.2025) is a human error pattern',
      'Reference to local employer shows some genuine engagement',
      'Factually incorrect claim about LOROS being "Primary sector" (actually tertiary/voluntary) suggests limited understanding but genuine attempt',
    ],

    // ─── Summary Metrics ───
    summaryMetrics: {
      overallOriginality: 'Low (estimated 30-40% original student work)',
      aiContentLikelihood: 'High (particularly M1 sections)',
      probableAITool: 'ChatGPT',
      studentUnderstanding: 'Limited evidence',
      academicIntegrityConcern: 'Yes — significant',
    },

    summary: 'The document appears to combine some genuine (though error-prone) student work with substantial AI-generated content, particularly in the extended assessment sections that carry the M1 marks.',

    // ─── Recommendations ───
    recommendations: [
      'Conversation with student: Ask them to explain specific claims (e.g., "What do you mean by \'compartmentalised structure\'?" or "Why did you mention Qatar Telecom?")',
      'Check writing samples: Compare against known authentic work from this student',
      'Turnitin/AI detection: Run through institutional AI detection tools for additional confirmation',
      'Assessment adjustment: If AI use is confirmed, consider whether the student understands the underlying concepts or simply submitted AI output',
    ],

    questionsForStudent: [
      'What do you mean by "compartmentalised structure"?',
      'Can you explain why you mentioned Qatar Telecom in the LOROS section?',
      'Talk me through how you researched the stakeholder relationships for Apple.',
      'What sources did you use for the M1 analysis?',
    ],
  },
  // RED — Fail grade
  {
    id: 'sub-002',
    studentId: 'bs2-08',  // Khan: Rehan
    assignmentId: 'unit14-a',
    fileName: 'Unit14_AssA_Rehan.docx',
    submittedAt: '2026-01-30T11:20:00Z',
    status: 'complete',
    originalityScore: 91,
    originalityVerdict: 'Appears authentic',
    likelyAITool: null,
    confidenceLevel: 'Low',
    gradeEstimate: 'Fail',
    priorityFlag: 'red',
    criteriaResults: { P1: 'met', P2: 'not_met', M1: 'not_met', D1: 'not_met' },
    flags: [
      { type: 'incomplete', severity: 'high', message: 'P2 not evidenced — no comparison of customer service in different businesses' },
      { type: 'word_count', severity: 'medium', message: 'Word count (820) significantly below expected range (1500-2500)' },
    ],
    authenticElements: [
      'Writing style consistent with student\'s previous work',
      'Personal shopping experiences referenced naturally',
      'Spelling and grammar errors consistent with expected level',
    ],
    summary: 'Work appears authentic but incomplete. P2 criterion not met, resulting in Fail. Student may need additional support or extension.',
    recommendations: ['Check if student needs additional support', 'Consider extension if circumstances warrant', 'Review P2 requirements with student'],
    questionsForStudent: [],
    wordCount: 820,
    reviewed: false,
  },
  // YELLOW — Borderline originality
  {
    id: 'sub-003',
    studentId: 'bs1-12',  // Mahmood: Muhammad Imaad
    assignmentId: 'unit5-ab',
    fileName: 'Unit5_AB_Imaad.docx',
    submittedAt: '2025-10-04T16:45:00Z',
    status: 'complete',
    originalityScore: 84,
    originalityVerdict: 'Some concerns',
    likelyAITool: 'Possibly ChatGPT',
    confidenceLevel: 'Medium',
    gradeEstimate: 'Pass',
    priorityFlag: 'yellow',
    criteriaResults: { P1: 'met', P2: 'met', P3: 'met', M1: 'partial', M2: 'not_met', D1: 'not_met' },
    flags: [
      { type: 'ai_phrases', severity: 'medium', message: 'Some AI indicator phrases detected: "it is important to note", "in today\'s globalised economy"' },
    ],
    authenticElements: [
      'Local business examples from Leicester used throughout',
      'Some grammatical errors consistent with L3 standard',
      'Personal opinion sections show authentic voice',
    ],
    summary: 'Minor originality concerns. Pass criteria met. Some AI phrases detected but overall appears substantially student work.',
    recommendations: ['Quick review sufficient', 'Note AI phrases for student feedback'],
    questionsForStudent: [],
    wordCount: 2956,
    reviewed: false,
  },
  // YELLOW — Pass grade
  {
    id: 'sub-004',
    studentId: 'bf3-09',  // Moataz: Rayan
    assignmentId: 'unit22-a',
    fileName: 'Unit22_AssA_Rayan.docx',
    submittedAt: '2026-01-25T10:10:00Z',
    status: 'complete',
    originalityScore: 92,
    originalityVerdict: 'Appears authentic',
    likelyAITool: null,
    confidenceLevel: 'Low',
    gradeEstimate: 'Pass',
    priorityFlag: 'yellow',
    criteriaResults: { P1: 'met', M1: 'partial', D1: 'not_met' },
    flags: [],
    authenticElements: [
      'Writing style natural and age-appropriate',
      'Examples drawn from personal experience',
    ],
    summary: 'Authentic work at Pass level. M1 partially evidenced — student close to Merit with additional depth.',
    recommendations: ['Provide feedback on how to strengthen M1 analysis'],
    questionsForStudent: [],
    wordCount: 1450,
    reviewed: false,
  },
  // GREEN — Strong Merit
  {
    id: 'sub-005',
    studentId: 'bs1-18',  // Sankhla: Raksha
    assignmentId: 'unit8-a',
    fileName: 'Unit8_AssA_Raksha.docx',
    submittedAt: '2025-10-05T09:30:00Z',
    status: 'complete',
    originalityScore: 96,
    originalityVerdict: 'Appears authentic',
    likelyAITool: null,
    confidenceLevel: 'Low',
    gradeEstimate: 'Merit',
    priorityFlag: 'green',
    criteriaResults: { P1: 'met', P2: 'met', M1: 'met', D1: 'partial' },
    flags: [],
    authenticElements: [
      'Consistent writing voice throughout',
      'Strong use of PEEL structure taught in class',
      'Appropriate business terminology for L3',
      'Local examples from part-time job experience',
    ],
    summary: 'Strong authentic work at Merit standard. D1 partially evidenced — close to Distinction with more evaluative depth.',
    recommendations: ['Mark with confidence', 'Provide D1 upgrade feedback'],
    questionsForStudent: [],
    wordCount: 3120,
    reviewed: false,
  },
  // GREEN — Distinction
  {
    id: 'sub-006',
    studentId: 'bf4-02',  // Allana: Aaishah
    assignmentId: 'unit1-ab',
    fileName: 'Unit1_AB_Aaishah.docx',
    submittedAt: '2025-10-18T13:15:00Z',
    status: 'complete',
    originalityScore: 94,
    originalityVerdict: 'Appears authentic',
    likelyAITool: null,
    confidenceLevel: 'Low',
    gradeEstimate: 'Distinction',
    priorityFlag: 'green',
    criteriaResults: { P1: 'met', P2: 'met', P3: 'met', M1: 'met', M2: 'met', D1: 'met' },
    flags: [],
    authenticElements: [
      'Excellent depth of analysis',
      'Writing style consistent across all sections',
      'Creative examples showing independent thinking',
    ],
    summary: 'Excellent authentic work at Distinction standard. All criteria met with strong evidence throughout.',
    recommendations: ['Mark with confidence'],
    questionsForStudent: [],
    wordCount: 4210,
    reviewed: false,
  },
  // GREEN — Co-taught unit (Unit 19, BS1 — visible to both David and Simon)
  {
    id: 'sub-007',
    studentId: 'bs1-10',  // Itesh: Aksh
    assignmentId: 'unit19-a',
    fileName: 'Unit19_AssA_Aksh.docx',
    submittedAt: '2026-02-22T15:00:00Z',
    status: 'complete',
    originalityScore: 93,
    originalityVerdict: 'Appears authentic',
    likelyAITool: null,
    confidenceLevel: 'Low',
    gradeEstimate: 'Merit',
    priorityFlag: 'green',
    criteriaResults: { P1: 'met', P2: 'met', M1: 'met', D1: 'partial' },
    flags: [],
    authenticElements: [
      'Business pitch idea clearly personal and well-developed',
      'Financial projections show reasonable understanding',
    ],
    summary: 'Authentic Merit-standard work on co-taught unit. Visible to both assigned teachers.',
    recommendations: ['Mark with confidence'],
    questionsForStudent: [],
    wordCount: 2780,
    reviewed: false,
  },
  // RED — Co-taught unit (Unit 14, BS2 — visible to both David and Simon)
  {
    id: 'sub-008',
    studentId: 'bs2-01',  // Awan: Nail
    assignmentId: 'unit14-a',
    fileName: 'Unit14_AssA_Nail.docx',
    submittedAt: '2026-01-31T08:50:00Z',
    status: 'complete',
    originalityScore: 65,
    originalityVerdict: 'High concern',
    likelyAITool: 'ChatGPT',
    confidenceLevel: 'High',
    gradeEstimate: 'Merit',
    priorityFlag: 'red',
    criteriaResults: { P1: 'met', P2: 'met', M1: 'met', D1: 'not_met' },
    flags: [
      { type: 'ai_content', severity: 'high', message: 'Substantial AI-generated content throughout P1 and M1 sections' },
      { type: 'style_shift', severity: 'high', message: 'Dramatic style shift between introduction (simple) and body (highly sophisticated)' },
    ],
    authenticElements: [
      'Introduction paragraph appears genuinely student-written',
      'Handwritten notes referenced in submission suggest some engagement',
    ],
    summary: 'High originality concern on co-taught unit. Style shift strongly suggests AI assistance for main body. Both co-teachers should review.',
    recommendations: ['Both co-teachers should discuss before student meeting', 'Conduct viva voce', 'Compare with student\'s in-class writing'],
    questionsForStudent: ['Your introduction and main body have very different writing styles — can you explain your process?', 'Can you show me any notes or drafts you made?'],
    wordCount: 3560,
    reviewed: false,
  },
  // Pending submission
  {
    id: 'sub-009',
    studentId: 'bf4-11',  // Imtihaz: Sahil
    assignmentId: 'unit22-a',
    fileName: 'Unit22_AssA_Sahil.docx',
    submittedAt: '2026-01-26T16:55:00Z',
    status: 'pending',
    originalityScore: null,
    gradeEstimate: null,
    priorityFlag: null,
    criteriaResults: {},
    flags: [],
    authenticElements: [],
    summary: 'Awaiting analysis...',
    wordCount: null,
    reviewed: false,
  },
  // Another green from BF3
  {
    id: 'sub-010',
    studentId: 'bf3-16',  // Rakesh: Neel
    assignmentId: 'unit22-a',
    fileName: 'Unit22_AssA_Neel.docx',
    submittedAt: '2026-01-25T14:30:00Z',
    status: 'complete',
    originalityScore: 97,
    originalityVerdict: 'Appears authentic',
    likelyAITool: null,
    confidenceLevel: 'Low',
    gradeEstimate: 'Merit',
    priorityFlag: 'green',
    criteriaResults: { P1: 'met', M1: 'met', D1: 'partial' },
    flags: [],
    authenticElements: [
      'Strong personal voice',
      'Appropriate use of market research terminology',
      'Examples from local businesses in Leicester',
    ],
    summary: 'Authentic Merit work. D1 partially evidenced.',
    recommendations: ['Mark with confidence'],
    questionsForStudent: [],
    wordCount: 1680,
    reviewed: false,
  },
];

// ─── Enrichment ──────────────────────────────────────────────
// Attach student, cohort, assignment, and unit info to each submission

function enrichSubmission(sub) {
  const student = STUDENTS.find(s => s.id === sub.studentId);
  const assignment = getAssignmentById(sub.assignmentId);
  const cohort = student ? getCohortById(student.cohortId) : null;
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

// ─── Public API ──────────────────────────────────────────────

export function getAllSubmissions() {
  return SUBMISSIONS.map(enrichSubmission);
}

export function getSubmissionById(id) {
  const sub = SUBMISSIONS.find(s => s.id === id);
  return sub ? enrichSubmission(sub) : null;
}

// Get submissions visible to a specific teacher (via teaching assignments or HoD)
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

// Get triage counts from a list of submissions
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

// Get at-risk students from submissions
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

// Mark a submission as reviewed
export function markReviewed(submissionId) {
  const sub = SUBMISSIONS.find(s => s.id === submissionId);
  if (sub) sub.reviewed = true;
}

// Add a new submission (from webhook or test upload)
export function addSubmission(submission) {
  SUBMISSIONS.push(submission);
  return enrichSubmission(submission);
}

// Calculate BTEC grade from criteria results (sequential achievement)
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
