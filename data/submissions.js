// Demo submission data with detailed reports
// In production, this would come from Supabase

import { STUDENTS, getGroupById, getTeacherById, GROUPS } from './demo';
import { getAssignmentById } from './units';

// Detailed demo submission - like the Sahil analysis
const DEMO_SUBMISSIONS = [
  {
    id: 'sub1',
    studentId: 'student1',
    assignmentId: 'unit1-ab',
    fileName: 'Unit1_Assignment_AB.docx',
    submittedAt: '2025-10-14T14:34:00Z',
    status: 'complete',
    originalityScore: 62,
    originalityVerdict: 'High concern',
    likelyAITool: 'ChatGPT',
    confidenceLevel: 'High',
    gradeEstimate: 'Pass',
    priorityFlag: 'red',
    
    detailedOriginalityAnalysis: {
      summary: 'This submission shows strong indicators of AI-generated content, particularly ChatGPT. The vocabulary is significantly above expected BTEC Level 3 standard, structural patterns are highly uniform, and multiple signature AI phrases appear throughout. A copy-paste error ("Qatar Telecom") provides strong evidence of content sourced from elsewhere.',
      keyEvidence: [
        {
          type: 'Copy-Paste Error',
          severity: 'High',
          description: 'The phrase "Qatar Telecom" appears in the middle of the LOROS charity section, which is completely unrelated to the assignment about Apple and LOROS.',
          examples: [
            '...LOROS demonstrates strong stakeholder engagement through Qatar Telecom their volunteer coordination program...'
          ],
          whyItMatters: 'This is a clear indicator that text was copied from a different source (likely an AI response about telecommunications) without proper review. A student writing their own work would not make this error.'
        },
        {
          type: 'AI Signature Phrases',
          severity: 'High',
          description: 'The phrase "all things considered" appears 5 times throughout the document. This is a highly characteristic ChatGPT phrase rarely used by BTEC Level 3 students.',
          examples: [
            '...all things considered, Apple\'s stakeholder management represents a multifaceted approach...',
            '...all things considered, the communication strategies employed demonstrate significant sophistication...'
          ],
          whyItMatters: 'This phrase frequency is statistically unlikely in authentic student work. ChatGPT uses this as a transitional phrase excessively.'
        },
        {
          type: 'Vocabulary Mismatch',
          severity: 'High',
          description: 'Multiple sophisticated terms appear that are inconsistent with the student\'s expected ability level and previous work.',
          examples: [
            '"compartmentalised organisational structure"',
            '"multifaceted stakeholder ecosystem"',
            '"paradigm of corporate governance"'
          ],
          whyItMatters: 'A mid-ability BTEC Level 3 student would not typically use these terms. The vocabulary is more consistent with MBA-level writing or AI-generated business content.'
        },
        {
          type: 'Structural Pattern',
          severity: 'Medium',
          description: 'Every stakeholder section follows an identical three-paragraph structure: introduction of stakeholder, analysis of relationship, concluding summary.',
          examples: [
            'Each section begins with "The [stakeholder] plays a crucial role in..."',
            'Each section ends with "All things considered, [stakeholder] engagement demonstrates..."'
          ],
          whyItMatters: 'This formulaic consistency is characteristic of AI-generated content. Authentic student work typically shows more variation in approach across sections.'
        }
      ],
      authenticElements: [
        {
          type: 'Spelling error',
          description: 'The word "Defenition" appears misspelled in the introduction',
          example: 'Defenition of a stakeholder'
        },
        {
          type: 'Local knowledge',
          description: 'Reference to Leicester Highcross Apple Store suggests some genuine local research',
          example: 'Apple\'s presence in Leicester Highcross shopping centre'
        },
        {
          type: 'Inconsistent formatting',
          description: 'Date formats vary between sections (12/03/24 vs March 12th)',
          example: 'Mix of UK and US date formats'
        }
      ]
    },
    
    sectionAnalysis: [
      {
        sectionTitle: 'P1 - Business Features',
        originalityAssessment: 'Mixed',
        concerns: ['Sophisticated vocabulary in Apple analysis', 'Generic descriptions that could apply to any tech company'],
        positives: ['Local Apple Store reference', 'Basic structure is appropriate']
      },
      {
        sectionTitle: 'P2 - Stakeholder Influence',
        originalityAssessment: 'Likely AI',
        concerns: ['Qatar Telecom copy-paste error', '"All things considered" appears 3 times', 'Analysis is generic'],
        positives: ['Correct stakeholders identified']
      },
      {
        sectionTitle: 'M1 - Assessment of Relationships',
        originalityAssessment: 'Likely AI',
        concerns: ['MBA-level vocabulary', 'Formulaic structure', 'No evidence of independent research'],
        positives: []
      }
    ],
    
    criteriaAssessment: {
      P1: {
        status: 'Met',
        evidence: 'Two contrasting businesses (Apple and LOROS) are identified and their features explained.',
        gaps: 'Explanations are somewhat generic and could benefit from more specific examples.',
        quote: 'Apple operates as a multinational technology corporation with a compartmentalised organisational structure...'
      },
      P2: {
        status: 'Met',
        evidence: 'Stakeholder influence is explained for both businesses.',
        gaps: 'The analysis lacks specific, evidenced examples of how stakeholders have actually influenced decisions.',
        quote: 'Shareholders exert considerable influence through their voting rights at annual general meetings...'
      },
      M1: {
        status: 'Partially Met',
        evidence: 'Some assessment of relationships is present.',
        gaps: 'Assessment is generic and lacks independent research. No specific examples, data, or external sources cited. The "Qatar Telecom" error suggests content was not carefully reviewed.',
        quote: 'The relationship between Apple and its customers demonstrates a multifaceted paradigm of engagement...'
      },
      M2: {
        status: 'Not Met',
        evidence: 'No evidence found in submission.',
        gaps: 'M2 criteria not addressed. Student may have misunderstood assignment requirements.',
        quote: null
      },
      D1: {
        status: 'Not Met',
        evidence: 'No evaluation present.',
        gaps: 'D1 requires evaluation with specific recommendations. This level of critical analysis is absent.',
        quote: null
      }
    },
    
    gradeJustification: 'P1 and P2 criteria are met at a basic level. M1 is only partially met due to lack of independent research and generic analysis. M2 and D1 are not addressed. Under BTEC rules, the grade is limited by the lowest achieved criterion, resulting in a Pass grade. However, originality concerns should be addressed before confirming this grade.',
    
    recommendations: [
      {
        priority: 'High',
        action: 'Conduct a face-to-face discussion with the student about the originality concerns',
        reason: 'Multiple high-severity indicators require clarification before the grade can be confirmed'
      },
      {
        priority: 'High',
        action: 'Ask student to explain the "Qatar Telecom" reference',
        reason: 'This is the clearest indicator of copied content and should be addressed directly'
      },
      {
        priority: 'Medium',
        action: 'Request evidence of research sources',
        reason: 'M1 requires independent research which is not currently evidenced'
      },
      {
        priority: 'Medium',
        action: 'Compare with student\'s previous work',
        reason: 'To assess if vocabulary level is consistent with their established ability'
      }
    ],
    
    questionsForStudent: [
      {
        question: 'Can you explain what you meant by "compartmentalised organisational structure"?',
        purpose: 'Test if student understands the vocabulary they used',
        expectedResponse: 'A genuine student would explain in simpler terms. Difficulty explaining suggests copied content.'
      },
      {
        question: 'I noticed you mentioned Qatar Telecom in your LOROS section - can you explain why?',
        purpose: 'Direct question about the copy-paste error',
        expectedResponse: 'An honest student may admit to the error. Confusion or deflection suggests lack of awareness of their own content.'
      },
      {
        question: 'What sources did you use for your research on Apple\'s stakeholder relationships?',
        purpose: 'Verify research was actually conducted',
        expectedResponse: 'Should be able to name specific websites, articles, or other sources. Vague answers suggest AI-generated content.'
      },
      {
        question: 'You used the phrase "all things considered" several times - is that a phrase you commonly use?',
        purpose: 'Check awareness of writing style',
        expectedResponse: 'Most students would not recognise this as unusual if they wrote it themselves.'
      }
    ],
    
    summary: 'This submission shows significant originality concerns with high confidence of ChatGPT usage. Key evidence includes a copy-paste error (Qatar Telecom), excessive use of AI signature phrases, and vocabulary significantly above expected level. While P1 and P2 criteria are technically met, a face-to-face discussion is strongly recommended before confirming any grade. The student should be asked about specific content and sources.',
    
    wordCount: 4832,
    reviewed: false,
    
    localAnalysis: {
      wordCount: 4832,
      foundPhrases: [
        { text: 'all things considered', weight: 3, tool: 'ChatGPT', count: 5 },
        { text: 'multifaceted', weight: 2, tool: 'ChatGPT', count: 3 },
        { text: 'paradigm', weight: 2, tool: 'ChatGPT', count: 2 },
        { text: 'plays a crucial role', weight: 2, tool: 'ChatGPT', count: 4 },
        { text: 'holistic approach', weight: 2, tool: 'Generic', count: 2 }
      ],
      totalIndicatorWeight: 28,
      vocabulary: {
        sophisticatedWords: [
          { word: 'compartmentalised', count: 2 },
          { word: 'paradigm', count: 2 }
        ]
      },
      structure: {
        paragraphCount: 47,
        sentenceCount: 198,
        avgSentenceLength: 24,
        uniformityScore: '72'
      },
      copyPasteErrors: [
        { type: 'Out of context reference', found: 'Qatar Telecom', context: '...LOROS demonstrates strong stakeholder engagement through Qatar Telecom their volunteer coordination program...' }
      ]
    }
  },
  
  // More concise entries for other submissions
  {
    id: 'sub2',
    studentId: 'student2',
    assignmentId: 'unit1-ab',
    fileName: 'Business_Features_Essay.docx',
    submittedAt: '2025-10-13T16:42:00Z',
    status: 'complete',
    originalityScore: 94,
    originalityVerdict: 'Appears authentic',
    likelyAITool: 'None detected',
    confidenceLevel: 'High',
    gradeEstimate: 'Merit',
    priorityFlag: 'green',
    
    detailedOriginalityAnalysis: {
      summary: 'This submission shows strong indicators of authentic student work. Vocabulary is appropriate for BTEC Level 3, the writing style is consistent throughout, and personal voice is evident. Minor issues do not indicate AI usage.',
      keyEvidence: [],
      authenticElements: [
        { type: 'Personal voice', description: 'First-person reflections appear naturally', example: 'I found it interesting that...' },
        { type: 'Local research', description: 'Specific local business examples used', example: 'Reference to specific Leicester businesses' },
        { type: 'Appropriate vocabulary', description: 'Language level matches expected ability', example: 'Clear, simple explanations throughout' }
      ]
    },
    
    criteriaAssessment: {
      P1: { status: 'Met', evidence: 'Clear explanations of business features', gaps: null, quote: null },
      P2: { status: 'Met', evidence: 'Stakeholder influence well explained', gaps: null, quote: null },
      M1: { status: 'Met', evidence: 'Good assessment with some research', gaps: 'Could include more sources', quote: null },
      M2: { status: 'Met', evidence: 'Communication methods assessed', gaps: null, quote: null },
      D1: { status: 'Partially Met', evidence: 'Some evaluation present', gaps: 'Recommendations need more depth', quote: null }
    },
    
    gradeJustification: 'All Pass and Merit criteria met. D1 partially met, limiting grade to Merit.',
    recommendations: [
      { priority: 'Low', action: 'Encourage student to develop evaluation skills for Distinction', reason: 'Close to achieving D1' }
    ],
    questionsForStudent: [],
    summary: 'Excellent authentic submission achieving Merit level. Strong personal voice and appropriate research evident.',
    wordCount: 5120,
    reviewed: true,
    reviewedAt: '2025-10-15T10:00:00Z'
  },
  
  {
    id: 'sub3',
    studentId: 'student3',
    assignmentId: 'unit1-ab',
    fileName: 'Unit1_Submission.docx',
    submittedAt: '2025-10-12T11:20:00Z',
    status: 'complete',
    originalityScore: 45,
    originalityVerdict: 'High concern',
    likelyAITool: 'ChatGPT',
    confidenceLevel: 'High',
    gradeEstimate: 'Fail',
    priorityFlag: 'red',
    
    detailedOriginalityAnalysis: {
      summary: 'Significant originality concerns combined with incomplete work. The submitted content shows high AI likelihood throughout, and P2 criteria is not addressed at all, resulting in automatic Fail.',
      keyEvidence: [
        { type: 'AI Signature Phrases', severity: 'High', description: 'Multiple ChatGPT indicators throughout', examples: ['"In essence..."', '"It is worth noting..."'], whyItMatters: 'Consistent AI writing patterns' },
        { type: 'Incomplete submission', severity: 'High', description: 'P2 criteria entirely missing', examples: ['No stakeholder influence section'], whyItMatters: 'Cannot achieve Pass without all P criteria' }
      ],
      authenticElements: []
    },
    
    criteriaAssessment: {
      P1: { status: 'Met', evidence: 'Basic business features explained', gaps: 'Superficial', quote: null },
      P2: { status: 'Not Met', evidence: 'Not addressed in submission', gaps: 'Entire section missing', quote: null },
      M1: { status: 'Not Met', evidence: 'No assessment present', gaps: null, quote: null }
    },
    
    gradeJustification: 'P2 criteria not met results in automatic Fail regardless of other achievement.',
    recommendations: [
      { priority: 'High', action: 'Discuss submission with student', reason: 'Originality concerns and incomplete work' },
      { priority: 'High', action: 'Clarify assignment requirements', reason: 'Student may have misunderstood P2' }
    ],
    questionsForStudent: [
      { question: 'Why is there no stakeholder influence section?', purpose: 'Understand if this was intentional', expectedResponse: 'May indicate confusion about requirements' }
    ],
    summary: 'High originality concern and incomplete submission. P2 not addressed = Fail. Requires urgent discussion.',
    wordCount: 890,
    reviewed: false
  },
  
  {
    id: 'sub4',
    studentId: 'student4',
    assignmentId: 'unit1-ab',
    fileName: 'Exploring_Business.docx',
    submittedAt: '2025-10-14T09:00:00Z',
    status: 'complete',
    originalityScore: 91,
    originalityVerdict: 'Appears authentic',
    likelyAITool: 'None detected',
    confidenceLevel: 'High',
    gradeEstimate: 'Distinction',
    priorityFlag: 'green',
    
    detailedOriginalityAnalysis: {
      summary: 'Outstanding authentic work. Strong evidence of independent research, critical thinking, and personal engagement with the topic.',
      keyEvidence: [],
      authenticElements: [
        { type: 'Original research', description: 'Primary research conducted', example: 'Visited local LOROS shop and interviewed volunteer' },
        { type: 'Critical analysis', description: 'Genuine evaluation present', example: 'Thoughtful recommendations based on evidence' }
      ]
    },
    
    criteriaAssessment: {
      P1: { status: 'Met', evidence: 'Excellent feature explanations', gaps: null, quote: null },
      P2: { status: 'Met', evidence: 'Comprehensive stakeholder analysis', gaps: null, quote: null },
      M1: { status: 'Met', evidence: 'Strong independent research', gaps: null, quote: null },
      M2: { status: 'Met', evidence: 'Detailed assessment', gaps: null, quote: null },
      D1: { status: 'Met', evidence: 'Excellent evaluation with recommendations', gaps: null, quote: null }
    },
    
    gradeJustification: 'All criteria met at required levels including Distinction.',
    recommendations: [],
    questionsForStudent: [],
    summary: 'Exemplary submission achieving Distinction. Strong original research and critical thinking demonstrated.',
    wordCount: 6230,
    reviewed: true,
    reviewedAt: '2025-10-16T14:30:00Z'
  },
  
  {
    id: 'sub5',
    studentId: 'student5',
    assignmentId: 'unit1-ab',
    fileName: 'Assignment1.docx',
    submittedAt: '2025-10-15T13:45:00Z',
    status: 'complete',
    originalityScore: 78,
    originalityVerdict: 'Moderate concern',
    likelyAITool: 'Possibly ChatGPT',
    confidenceLevel: 'Medium',
    gradeEstimate: 'Pass',
    priorityFlag: 'red',
    
    detailedOriginalityAnalysis: {
      summary: 'Below originality threshold with some AI indicators. Analysis sections appear to use AI assistance but introduction seems genuine.',
      keyEvidence: [
        { type: 'AI assistance likely', severity: 'Medium', description: 'Analysis sections show AI patterns', examples: ['Formulaic paragraph structure in M1'], whyItMatters: 'Inconsistent quality between sections' }
      ],
      authenticElements: [
        { type: 'Genuine introduction', description: 'Opening section appears student-written', example: 'Personal tone in first paragraphs' }
      ]
    },
    
    criteriaAssessment: {
      P1: { status: 'Met', evidence: 'Features explained', gaps: null, quote: null },
      P2: { status: 'Met', evidence: 'Stakeholders covered', gaps: null, quote: null },
      M1: { status: 'Not Met', evidence: 'Generic analysis', gaps: 'Lacks independent research evidence', quote: null }
    },
    
    gradeJustification: 'Pass criteria met but Merit criteria not evidenced sufficiently.',
    recommendations: [
      { priority: 'Medium', action: 'Discuss originality concerns with student', reason: 'Below 80% threshold' },
      { priority: 'Medium', action: 'Request research evidence', reason: 'M1 lacks independent research' }
    ],
    questionsForStudent: [
      { question: 'Can you show me the sources you used for your analysis?', purpose: 'Verify research', expectedResponse: 'Should be able to provide sources' }
    ],
    summary: 'Below originality threshold (78%). Pass criteria met but worth discussing with student.',
    wordCount: 3200,
    reviewed: false
  },
  
  // Pending submissions
  {
    id: 'sub6',
    studentId: 'student6',
    assignmentId: 'unit1-ab',
    fileName: 'Business_Unit1.docx',
    submittedAt: '2025-10-15T15:30:00Z',
    status: 'pending',
    originalityScore: null,
    gradeEstimate: null,
    priorityFlag: null,
    reviewed: false
  },
  {
    id: 'sub7',
    studentId: 'student7',
    assignmentId: 'unit1-ab',
    fileName: 'My_Assignment.docx',
    submittedAt: '2025-10-15T15:45:00Z',
    status: 'processing',
    originalityScore: null,
    gradeEstimate: null,
    priorityFlag: null,
    reviewed: false
  }
];

// In-memory store
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

// Get submissions by teacher
export function getSubmissionsByTeacher(teacherId) {
  const teacherGroups = GROUPS.filter(g => g.teacherId === teacherId).map(g => g.id);
  const teacherStudents = STUDENTS.filter(s => teacherGroups.includes(s.groupId)).map(s => s.id);
  return submissions.filter(s => teacherStudents.includes(s.studentId)).map(enrichSubmission);
}

// Add a new submission
export function addSubmission(submission) {
  const newSub = {
    id: `sub${Date.now()}`,
    status: 'pending',
    submittedAt: new Date().toISOString(),
    reviewed: false,
    ...submission
  };
  submissions.push(newSub);
  return enrichSubmission(newSub);
}

// Update submission
export function updateSubmission(submissionId, updates) {
  const index = submissions.findIndex(s => s.id === submissionId);
  if (index !== -1) {
    submissions[index] = { ...submissions[index], ...updates };
    return enrichSubmission(submissions[index]);
  }
  return null;
}

// Mark reviewed
export function markReviewed(submissionId) {
  return updateSubmission(submissionId, {
    reviewed: true,
    reviewedAt: new Date().toISOString()
  });
}

// Enrich with related data
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
  const counts = { red: 0, yellow: 0, green: 0, pending: 0, total: submissionsList.length };
  
  submissionsList.forEach(sub => {
    if (sub.status === 'pending' || sub.status === 'processing') counts.pending++;
    else if (sub.priorityFlag === 'red') counts.red++;
    else if (sub.priorityFlag === 'yellow') counts.yellow++;
    else if (sub.priorityFlag === 'green') counts.green++;
  });
  
  return counts;
}

// Get at-risk students
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
