// Submission data — in production this comes from Supabase
// Sample submissions use real student names for realistic demo

import { STUDENTS, getCohortById, getTeachersForUnitCohort, canTeacherSeeSubmission } from './staff';
import { getAssignmentById, getUnitByNumber, UNITS } from './units';

// ─── Sample Submissions ──────────────────────────────────────
// Comprehensive demo data across all cohorts, teachers, and RAG statuses
// Includes: standard, ad hoc, co-taught, and detailed granular analysis examples
let SUBMISSIONS = [

  // ═══════════════════════════════════════════════════════════════
  // STEVE BABB (sba) — Unit 8 (BS1, BS2), Unit 22 (BF3, BF4)
  // ═══════════════════════════════════════════════════════════════

  // RED — High concern: AI content detected (DETAILED ANALYSIS FORMAT)
  // Steve's Unit 8 BS1
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
    aiPhraseAnalysis: [
      { phrase: 'All things considered', occurrences: 5, significance: 'Classic ChatGPT closing phrase' },
      { phrase: 'Nevertheless', occurrences: 4, significance: 'Favoured AI transitional word' },
      { phrase: 'Taking everything into consideration', occurrences: 2, significance: 'AI summary phrase' },
      { phrase: 'multi-channel approach/strategy', occurrences: 5, significance: 'Business jargon AI defaults to' },
      { phrase: 'mission-driven', occurrences: 3, significance: 'Generic AI vocabulary' },
      { phrase: 'Despite these challenges/drawbacks', occurrences: 3, significance: 'AI balance phrase' },
    ],
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
    copyPasteErrors: [
      {
        text: '"Qatar Telecom exhibits a commitment to transparency and growth through regular updates..."',
        location: 'LOROS staff section',
        significance: 'This sentence appears in the LOROS section and makes no contextual sense. "Qatar Telecom" is clearly a remnant from another AI generation or different assignment. This is compelling evidence of copy-pasting AI-generated content without careful review.',
      },
    ],
    additionalConcerns: [
      'No genuine engagement with sources: Despite listing URLs, the analysis doesn\'t draw specific data from them beyond surface-level facts.',
      'Generic analysis: The stakeholder assessments could apply to almost any large company or charity—they don\'t show specific research.',
      'Perfect grammar in extended sections: A student would typically show more grammatical inconsistencies in longer pieces.',
      'Image references: The document references images/charts but the analysis around them is AI-generic.',
    ],
    authenticElements: [
      'Misspelling "Defenition" suggests some human input',
      'Inconsistent date formatting (11/09/2025 vs 11.09.2025) is a human error pattern',
      'Reference to local employer shows some genuine engagement',
      'Factually incorrect claim about LOROS being "Primary sector" (actually tertiary/voluntary) suggests limited understanding but genuine attempt',
    ],
    summaryMetrics: {
      overallOriginality: 'Low (estimated 30-40% original student work)',
      aiContentLikelihood: 'High (particularly M1 sections)',
      probableAITool: 'ChatGPT',
      studentUnderstanding: 'Limited evidence',
      academicIntegrityConcern: 'Yes — significant',
    },
    summary: 'The document appears to combine some genuine (though error-prone) student work with substantial AI-generated content, particularly in the extended assessment sections that carry the M1 marks.',
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

  // GREEN — Strong Merit (Steve's Unit 8 BS1)
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

  // GREEN — Authentic Pass (Steve's Unit 8 BS2)
  {
    id: 'sub-020',
    studentId: 'bs2-09',  // Maisuria: Dhruv
    assignmentId: 'unit8-a',
    fileName: 'Unit8_AssA_Dhruv.docx',
    submittedAt: '2025-10-04T10:15:00Z',
    status: 'complete',
    originalityScore: 95,
    originalityVerdict: 'Appears authentic',
    likelyAITool: null,
    confidenceLevel: 'Low',
    gradeEstimate: 'Pass',
    priorityFlag: 'green',
    criteriaResults: { P1: 'met', P2: 'met', M1: 'partial', D1: 'not_met' },
    flags: [],
    authenticElements: [
      'Natural writing style with typical L3 errors',
      'References to family business show genuine experience',
      'Vocabulary appropriate and consistent throughout',
    ],
    summary: 'Authentic Pass-standard work. M1 partially evidenced — could reach Merit with more analysis depth.',
    recommendations: ['Mark with confidence', 'Feedback on M1 development'],
    questionsForStudent: [],
    wordCount: 1920,
    reviewed: false,
  },

  // YELLOW — Borderline AI in Unit 8 BS2
  {
    id: 'sub-021',
    studentId: 'bs2-16',  // Ram: Vishal
    assignmentId: 'unit8-b',
    fileName: 'Unit8_AssB_Vishal.docx',
    submittedAt: '2025-11-08T14:20:00Z',
    status: 'complete',
    originalityScore: 85,
    originalityVerdict: 'Some concerns',
    likelyAITool: 'Possibly ChatGPT',
    confidenceLevel: 'Medium',
    gradeEstimate: 'Merit',
    priorityFlag: 'yellow',
    criteriaResults: { P3: 'met', P4: 'met', M2: 'met', D2: 'partial' },
    flags: [
      { type: 'ai_phrases', severity: 'medium', message: 'AI indicator phrases found in M2 section: "it is important to note", "plays a crucial role"' },
    ],
    authenticElements: [
      'Interview transcripts appear genuine',
      'P3 section uses natural student vocabulary',
      'References to college career fair are specific and verifiable',
    ],
    summary: 'Mostly authentic with some AI-assisted phrasing in the Merit section. The Pass-level work is clearly student-written; the step up in M2 quality warrants a quick check.',
    recommendations: ['Quick conversation about M2 sources', 'Compare M2 writing with in-class work'],
    questionsForStudent: ['Can you talk me through how you wrote the M2 section?'],
    wordCount: 2640,
    reviewed: false,
  },

  // ★ AD HOC SUBMISSION — Steve's Unit 8 BS1 (originality-only, no criteria)
  {
    id: 'sub-011',
    studentId: 'bs1-19',  // Shaban: Didar
    assignmentId: null,
    isAdHoc: true,
    adHocTitle: 'Unit 8 Research Task',
    adHocUnitNumber: 8,
    adHocUnitId: 'unit8',
    teamsAssignmentTitle: 'Unit 8 Research Task',
    fileName: 'Unit8_Research_Didar.docx',
    submittedAt: '2025-10-10T11:45:00Z',
    status: 'complete',
    originalityScore: 52,
    originalityVerdict: 'High concern',
    likelyAITool: 'ChatGPT',
    likelyAIToolReasoning: 'The text exhibits hallmark ChatGPT patterns: perfectly balanced paragraphs, extensive use of "furthermore" and "it is worth noting", and a characteristic summary structure. The level of business sophistication is inconsistent with known student ability.',
    confidenceLevel: 'High',
    gradeEstimate: null,
    criteriaResults: null,
    priorityFlag: 'red',
    wordCount: 1840,
    reviewed: false,
    sectionAnalysis: [
      {
        section: 'Opening Paragraph',
        quality: 'Basic, some errors',
        likelySource: 'Partly student',
        notes: 'First two sentences appear student-written with minor grammatical errors. Third sentence onwards shifts dramatically in sophistication.',
      },
      {
        section: 'Research Findings',
        quality: 'Highly sophisticated',
        likelySource: 'AI-generated (likely ChatGPT)',
        notes: 'Detailed analysis of recruitment methods with perfectly structured pros/cons. Uses terminology like "talent acquisition pipeline" and "organisational synergies" — far beyond expected L3 level.',
      },
      {
        section: 'Conclusion',
        quality: 'Formulaic, sophisticated',
        likelySource: 'AI-generated (likely ChatGPT)',
        notes: 'Classic ChatGPT conclusion structure: restatement, balanced summary, forward-looking statement. Phrase "all things considered" used.',
      },
    ],
    aiPhraseAnalysis: [
      { phrase: 'It is worth noting', occurrences: 3, significance: 'High-frequency ChatGPT phrase' },
      { phrase: 'Furthermore', occurrences: 4, significance: 'Overused AI transition word' },
      { phrase: 'All things considered', occurrences: 1, significance: 'Classic ChatGPT closing phrase' },
      { phrase: 'Plays a crucial role', occurrences: 2, significance: 'AI filler phrase' },
    ],
    vocabularyFlags: [
      {
        quote: '"The talent acquisition pipeline requires systematic optimisation to ensure organisational resilience"',
        concern: '"Talent acquisition pipeline" and "organisational resilience" are MBA-level terminology, not L3',
      },
      {
        quote: '"Leveraging digital platforms to foster employee engagement"',
        concern: '"Leveraging" and "foster" are classic AI vocabulary choices unlikely from this student',
      },
    ],
    copyPasteErrors: [],
    additionalConcerns: [
      'No specific examples from real businesses — all analysis is generic',
      'Writing quality dramatically above this student\'s known ability',
      'No spelling or grammar errors in body text despite errors in opening',
    ],
    authenticElements: [
      'Opening paragraph contains minor grammatical errors consistent with student level',
      'Student\'s name correctly formatted on cover page',
    ],
    summaryMetrics: {
      overallOriginality: 'Low (estimated 20-30% original student work)',
      aiContentLikelihood: 'High (research findings and conclusion sections)',
      probableAITool: 'ChatGPT',
      studentUnderstanding: 'Limited evidence',
      academicIntegrityConcern: 'Yes — significant',
    },
    summary: 'Ad hoc submission — originality analysis only. Significant AI content detected throughout the research findings section. The opening appears partly authentic but the majority of the document shows strong ChatGPT indicators.',
    recommendations: [
      'This is an ad hoc submission with no marking criteria — prioritise originality discussion',
      'Ask student to explain key terminology used in the document',
      'Compare with student\'s in-class writing samples',
      'Consider whether this indicates a pattern before formal assignments are due',
    ],
    questionsForStudent: [
      'What do you mean by "talent acquisition pipeline"?',
      'Can you explain "organisational resilience" in your own words?',
      'What sources did you use for your research findings?',
    ],
  },

  // YELLOW — Pass grade (Steve's Unit 22 BF3)
  {
    id: 'sub-004',
    studentId: 'bs3-09',  // Moataz: Rayan
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

  // GREEN — Merit (Steve's Unit 22 BF3)
  {
    id: 'sub-010',
    studentId: 'bs3-16',  // Rakesh: Neel
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

  // RED — AI content in Unit 22 BF3 (DETAILED FORMAT — good for Foundation demo)
  {
    id: 'sub-017',
    studentId: 'bs3-06',  // Joni: Santiago
    assignmentId: 'unit22-a',
    fileName: 'Unit22_AssA_Santiago.docx',
    submittedAt: '2026-01-26T09:20:00Z',
    status: 'complete',
    originalityScore: 42,
    originalityVerdict: 'High concern',
    likelyAITool: 'ChatGPT',
    likelyAIToolReasoning: 'Characteristic ChatGPT structure: perfectly formatted headings, balanced analysis paragraphs, and consistent use of academic transitions. The "in conclusion" + "furthermore" + "it is important to note" combination is a strong ChatGPT signature.',
    confidenceLevel: 'High',
    gradeEstimate: 'Merit',
    priorityFlag: 'red',
    criteriaResults: { P1: 'met', M1: 'met', D1: 'not_met' },
    wordCount: 2180,
    reviewed: false,
    sectionAnalysis: [
      {
        section: 'P1 — Types of Market Research',
        quality: 'Textbook-like, well-structured',
        likelySource: 'AI-generated (likely ChatGPT)',
        notes: 'Definitions are word-perfect and follow a consistent pattern: term, definition, example, advantage, limitation. This mechanical structure is typical of ChatGPT.',
      },
      {
        section: 'M1 — Explain the Importance',
        quality: 'Highly sophisticated',
        likelySource: 'AI-generated (likely ChatGPT)',
        notes: 'Uses phrases like "empirical data-driven decision making" and "mitigating market entry risks" — significantly beyond Foundation Diploma Y1 expected vocabulary. Analysis quality is consistent with degree-level writing.',
      },
      {
        section: 'Examples Section',
        quality: 'Generic, lacks specifics',
        likelySource: 'AI-generated',
        notes: 'References Coca-Cola and Apple as examples but provides only generic information that could apply to any multinational. No Leicester-based or UK-specific examples despite being a local market research task.',
      },
    ],
    aiPhraseAnalysis: [
      { phrase: 'It is important to note', occurrences: 4, significance: 'High-frequency ChatGPT phrase — used 4 times in 2000 words is very high' },
      { phrase: 'In today\'s competitive landscape', occurrences: 2, significance: 'Generic ChatGPT business opening' },
      { phrase: 'Furthermore', occurrences: 6, significance: 'Significantly overused transition word' },
      { phrase: 'Comprehensive understanding', occurrences: 2, significance: 'AI filler phrase' },
    ],
    vocabularyFlags: [
      {
        quote: '"Empirical data-driven decision making enables organisations to mitigate market entry risks"',
        concern: '"Empirical data-driven" and "mitigate market entry risks" are degree-level phrases — this is a Y1 Foundation Diploma student',
      },
      {
        quote: '"The holistic approach to market segmentation facilitates nuanced targeting strategies"',
        concern: 'Every word in this phrase is beyond expected Y1 vocabulary: "holistic", "facilitates", "nuanced"',
      },
    ],
    copyPasteErrors: [
      {
        text: '"Samsung\'s market research department utilises advanced analytics to forecast consumer trends across their product ecosystem"',
        location: 'Examples section (local business task)',
        significance: 'The assignment asks about local Leicester businesses. A Samsung reference suggests AI-generated content that hasn\'t been adapted to the actual task requirements.',
      },
    ],
    additionalConcerns: [
      'No local business examples despite the task requiring them',
      'Vocabulary level dramatically inconsistent with Y1 Foundation Diploma expectations',
      'Document metadata shows creation at 2:14 AM — unusual for Y1 student',
      'Zero spelling or grammar errors across 2000+ words — atypical for this student\'s known ability',
    ],
    authenticElements: [
      'Student name and cohort correctly added to header',
      'Contents page structure matches teacher template',
    ],
    summaryMetrics: {
      overallOriginality: 'Low (estimated 10-20% original student work)',
      aiContentLikelihood: 'Very High (all substantive sections)',
      probableAITool: 'ChatGPT',
      studentUnderstanding: 'Limited evidence — only template sections appear student-produced',
      academicIntegrityConcern: 'Yes — significant',
    },
    summary: 'Strong evidence of substantial AI-generated content throughout all substantive sections. Only the template structure and header appear student-produced. Vocabulary and analysis quality are dramatically above Y1 Foundation Diploma expectations.',
    recommendations: [
      'Formal conversation with student — evidence is strong',
      'Ask student to explain key terms from their submission',
      'Check if this pattern appears in other submissions from this student',
      'Consider referral to academic integrity process if confirmed',
    ],
    questionsForStudent: [
      'What do you mean by "empirical data-driven decision making"?',
      'Can you name a local Leicester business that does market research?',
      'Why did you use Samsung as an example when the task asked about local businesses?',
      'What is "market segmentation" — explain it to me in your own words?',
    ],
  },

  // GREEN — Distinction (Steve's Unit 22 BF4)
  {
    id: 'sub-019',
    studentId: 'bf4-09',  // Gani: Ammarah
    assignmentId: 'unit22-a',
    fileName: 'Unit22_AssA_Ammarah.docx',
    submittedAt: '2026-01-26T11:40:00Z',
    status: 'complete',
    originalityScore: 98,
    originalityVerdict: 'Appears authentic',
    likelyAITool: null,
    confidenceLevel: 'Low',
    gradeEstimate: 'Distinction',
    priorityFlag: 'green',
    criteriaResults: { P1: 'met', M1: 'met', D1: 'met' },
    flags: [],
    authenticElements: [
      'Excellent use of local business examples (Leicester Market, Highcross)',
      'Writing shows genuine understanding with appropriate vocabulary',
      'Personal observations from visiting businesses referenced naturally',
      'Strong evaluative points using R.E.A.L. framework taught in class',
    ],
    summary: 'Outstanding authentic work at Distinction standard. Student has clearly engaged with local businesses and applied market research concepts independently.',
    recommendations: ['Mark with confidence — exemplar work'],
    questionsForStudent: [],
    wordCount: 2340,
    reviewed: false,
  },

  // Pending (Steve's Unit 22 BF4)
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

  // ═══════════════════════════════════════════════════════════════
  // AMREEN SHABIR (ams) — Unit 5 (BS1), Unit 17 (BS1), Unit 1 (BF3)
  // ═══════════════════════════════════════════════════════════════

  // YELLOW — Borderline originality (Amreen's Unit 5 BS1)
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

  // GREEN — Merit (Amreen's Unit 5 BS1)
  {
    id: 'sub-022',
    studentId: 'bs1-15',  // Patel: Dhvani
    assignmentId: 'unit5-ab',
    fileName: 'Unit5_AB_Dhvani.docx',
    submittedAt: '2025-10-05T11:00:00Z',
    status: 'complete',
    originalityScore: 93,
    originalityVerdict: 'Appears authentic',
    likelyAITool: null,
    confidenceLevel: 'Low',
    gradeEstimate: 'Merit',
    priorityFlag: 'green',
    criteriaResults: { P1: 'met', P2: 'met', P3: 'met', M1: 'met', M2: 'met', D1: 'partial' },
    flags: [],
    authenticElements: [
      'Good understanding of international trade barriers',
      'Uses family textile business as case study throughout',
      'Writing style consistent and age-appropriate',
    ],
    summary: 'Strong authentic Merit work. Student has used personal family business experience effectively. D1 partially evidenced.',
    recommendations: ['Mark with confidence', 'Encourage D1 evaluative depth'],
    questionsForStudent: [],
    wordCount: 3450,
    reviewed: false,
  },

  // RED — AI content in Unit 1 BF3 (DETAILED FORMAT — Amreen)
  {
    id: 'sub-013',
    studentId: 'bs3-03',  // Demco: Sebastian
    assignmentId: 'unit1-ab',
    fileName: 'Unit1_AB_Sebastian.docx',
    submittedAt: '2025-10-19T10:30:00Z',
    status: 'complete',
    originalityScore: 48,
    originalityVerdict: 'High concern',
    likelyAITool: 'Gemini',
    likelyAIToolReasoning: 'The writing style favours longer flowing sentences with semicolons and embedded clauses, which is more characteristic of Google Gemini than ChatGPT. Additionally, the use of "it\'s worth highlighting" (vs ChatGPT\'s "it is important to note") and structured enumeration patterns point to Gemini.',
    confidenceLevel: 'High',
    gradeEstimate: 'Merit',
    priorityFlag: 'red',
    criteriaResults: { P1: 'met', P2: 'met', P3: 'met', M1: 'met', M2: 'partial', D1: 'not_met' },
    wordCount: 3680,
    reviewed: false,
    sectionAnalysis: [
      {
        section: 'Business Ownership Types (P1)',
        quality: 'Textbook-accurate, flowing prose',
        likelySource: 'AI-generated (likely Gemini)',
        notes: 'Definitions use semicolons and embedded clauses in a style characteristic of Gemini. Content is accurate but the prose style is far above Y1 Foundation level.',
      },
      {
        section: 'Stakeholder Analysis (P2/P3)',
        quality: 'Highly detailed, structured',
        likelySource: 'AI-generated (likely Gemini)',
        notes: 'Each stakeholder is analysed with identical structure: identification, interest, influence, conflict. This rigid pattern suggests AI generation.',
      },
      {
        section: 'Merit Analysis (M1)',
        quality: 'Sophisticated academic analysis',
        likelySource: 'AI-generated',
        notes: 'Uses degree-level concepts like "asymmetric information" and "agency theory" — dramatically beyond Y1 Foundation level.',
      },
      {
        section: 'Personal Reflection',
        quality: 'Basic, brief',
        likelySource: 'Student',
        notes: 'Short paragraph at the end with simpler vocabulary and minor grammatical errors. Likely the only section written by the student.',
      },
    ],
    aiPhraseAnalysis: [
      { phrase: 'It\'s worth highlighting', occurrences: 3, significance: 'Gemini-characteristic phrase (vs ChatGPT\'s "important to note")' },
      { phrase: 'Plays a pivotal role', occurrences: 3, significance: 'AI-typical emphasis phrase' },
      { phrase: 'In essence', occurrences: 2, significance: 'AI summary transition' },
      { phrase: 'It is crucial to understand', occurrences: 2, significance: 'AI instructional phrase' },
    ],
    vocabularyFlags: [
      {
        quote: '"The principal-agent problem creates asymmetric information dynamics between shareholders and directors"',
        concern: '"Principal-agent problem" and "asymmetric information" are university-level economics concepts — entirely beyond Y1 Foundation',
      },
      {
        quote: '"Stakeholder salience theory suggests that managers prioritise stakeholders based on power, legitimacy, and urgency"',
        concern: 'Mitchell\'s stakeholder salience theory is a postgraduate concept not taught at BTEC Level 3',
      },
    ],
    copyPasteErrors: [],
    additionalConcerns: [
      'Dramatic quality gap between body text (sophisticated) and personal reflection (basic)',
      'References academic theories not in the BTEC specification',
      'No spelling errors in 3600+ words despite English being student\'s second language',
    ],
    authenticElements: [
      'Final reflection paragraph appears genuine with simpler vocabulary',
      'Cover page formatted to teacher specification',
      'Student selected Tesco as their business — this was discussed in class',
    ],
    summaryMetrics: {
      overallOriginality: 'Low (estimated 15-25% original student work)',
      aiContentLikelihood: 'Very High (all analytical sections)',
      probableAITool: 'Google Gemini',
      studentUnderstanding: 'Limited — personal reflection shows basic grasp only',
      academicIntegrityConcern: 'Yes — significant',
    },
    summary: 'Strong evidence of AI-generated content, likely from Google Gemini based on stylistic analysis. Analytical sections reference university-level theories not taught at BTEC Level 3. Only the personal reflection paragraph appears genuinely student-written.',
    recommendations: [
      'Formal discussion with student about academic integrity',
      'Ask student to explain the theories referenced in their submission',
      'This may indicate the student doesn\'t understand the task — consider targeted support',
      'Flag to personal tutor if academic integrity confirmed',
    ],
    questionsForStudent: [
      'Can you explain what "asymmetric information" means?',
      'Where did you learn about "stakeholder salience theory"?',
      'Tell me about Tesco\'s ownership in your own words.',
      'Which part of this assignment did you find hardest?',
    ],
  },

  // YELLOW — Some AI phrases in Unit 17 BS1 (Amreen)
  {
    id: 'sub-014',
    studentId: 'bs1-17',  // Rashid: Qays
    assignmentId: 'unit17-a',
    fileName: 'Unit17_AssA_Qays.docx',
    submittedAt: '2026-01-31T15:30:00Z',
    status: 'complete',
    originalityScore: 86,
    originalityVerdict: 'Some concerns',
    likelyAITool: 'Possibly ChatGPT',
    confidenceLevel: 'Medium',
    gradeEstimate: 'Merit',
    priorityFlag: 'yellow',
    criteriaResults: { P1: 'met', P2: 'met', M1: 'met', D1: 'not_met' },
    flags: [
      { type: 'ai_phrases', severity: 'medium', message: 'AI phrases detected in M1 section: "in the digital landscape", "leveraging social media platforms"' },
      { type: 'style_shift', severity: 'low', message: 'Slight style elevation in Merit section compared to Pass sections' },
    ],
    authenticElements: [
      'Screenshots of real social media campaigns included',
      'References to local Leicester businesses\' Instagram accounts',
      'P1 and P2 sections written in natural student voice',
    ],
    summary: 'Largely authentic with some AI-assisted phrasing in the Merit section. Pass work is clearly student-written. Quick check recommended for M1.',
    recommendations: ['Brief check on M1 phrasing — may be light AI paraphrasing', 'Overall appears substantially authentic'],
    questionsForStudent: [],
    wordCount: 2870,
    reviewed: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // CAROLINE LAWFORD (cla) — Unit 5 (BS2), Unit 17 (BS2), Unit 1 (BF4)
  // ═══════════════════════════════════════════════════════════════

  // GREEN — Distinction (Caroline's Unit 5 BS2 — detailed format)
  {
    id: 'sub-012',
    studentId: 'bs2-05',  // Kanti: Meghakxi
    assignmentId: 'unit5-ab',
    fileName: 'Unit5_AB_Meghakxi.docx',
    submittedAt: '2025-10-05T13:45:00Z',
    status: 'complete',
    originalityScore: 98,
    originalityVerdict: 'Appears authentic',
    likelyAITool: null,
    likelyAIToolReasoning: null,
    confidenceLevel: 'Low',
    gradeEstimate: 'Distinction',
    priorityFlag: 'green',
    criteriaResults: { P1: 'met', P2: 'met', P3: 'met', M1: 'met', M2: 'met', D1: 'met' },
    wordCount: 4520,
    reviewed: false,
    sectionAnalysis: [
      {
        section: 'International Trade Overview (P1-P3)',
        quality: 'Well-structured, appropriate vocabulary',
        likelySource: 'Student',
        notes: 'Excellent coverage of trade barriers and opportunities. Uses appropriate L3 terminology without overreaching. Examples from Indian textile industry show genuine knowledge.',
      },
      {
        section: 'Merit Analysis (M1-M2)',
        quality: 'Strong analysis with personal insight',
        likelySource: 'Student',
        notes: 'Analysis builds logically from Pass work. Uses PEEL structure effectively. Writing style is consistent with P sections.',
      },
      {
        section: 'Distinction Evaluation (D1)',
        quality: 'Thoughtful evaluation',
        likelySource: 'Student',
        notes: 'Genuine evaluative voice. Makes balanced judgments about trade-offs. References family business experience to support arguments.',
      },
    ],
    aiPhraseAnalysis: [],
    vocabularyFlags: [],
    copyPasteErrors: [],
    additionalConcerns: [],
    authenticElements: [
      'Consistent writing voice across all sections — no quality jumps',
      'Uses family business importing textiles from India as running case study',
      'Spelling/grammar errors are minor and consistent with L3 expectations',
      'References class discussions and teacher feedback in text',
      'Local Leicester context throughout (Golden Mile businesses)',
    ],
    summaryMetrics: {
      overallOriginality: 'High (estimated 95%+ original student work)',
      aiContentLikelihood: 'Very Low',
      probableAITool: 'None detected',
      studentUnderstanding: 'Strong evidence throughout',
      academicIntegrityConcern: 'No',
    },
    summary: 'Excellent authentic work at Distinction standard. Student demonstrates genuine understanding through consistent voice, personal examples, and appropriate vocabulary. Mark with full confidence.',
    recommendations: ['Mark with confidence — exemplar work', 'Consider as WAGOLL example (with student permission)'],
    questionsForStudent: [],
  },

  // GREEN — Distinction (Caroline's Unit 1 BF4)
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

  // YELLOW — Borderline Fail (Caroline's Unit 1 BF4)
  {
    id: 'sub-015',
    studentId: 'bf4-15',  // Nerway: Aroz
    assignmentId: 'unit1-ab',
    fileName: 'Unit1_AB_Aroz.docx',
    submittedAt: '2025-10-19T16:50:00Z',
    status: 'complete',
    originalityScore: 91,
    originalityVerdict: 'Appears authentic',
    likelyAITool: null,
    confidenceLevel: 'Low',
    gradeEstimate: 'Pass',
    priorityFlag: 'yellow',
    criteriaResults: { P1: 'met', P2: 'partial', P3: 'not_met', M1: 'not_met', M2: 'not_met', D1: 'not_met' },
    flags: [
      { type: 'incomplete', severity: 'high', message: 'P3 not evidenced — stakeholder section missing entirely' },
      { type: 'word_count', severity: 'medium', message: 'Word count (980) below expected range (1500-2500)' },
    ],
    authenticElements: [
      'Writing is clearly student\'s own — appropriate vocabulary',
      'Good attempt at P1 with genuine examples',
      'Some effort evident despite incomplete submission',
    ],
    summary: 'Authentic but incomplete work. P2 partially met, P3 missing entirely. Student appears to have run out of time or struggled with the task. Not an integrity concern — a support concern.',
    recommendations: ['Check with student about barriers to completion', 'Consider whether extension or additional scaffolding is needed', 'Review P3 requirements one-to-one'],
    questionsForStudent: [],
    wordCount: 980,
    reviewed: false,
  },

  // GREEN — Pass (Caroline's Unit 17 BS2)
  {
    id: 'sub-016',
    studentId: 'bs2-13',  // Perkuszewska: Victoria
    assignmentId: 'unit17-a',
    fileName: 'Unit17_AssA_Victoria.docx',
    submittedAt: '2026-02-01T09:15:00Z',
    status: 'complete',
    originalityScore: 94,
    originalityVerdict: 'Appears authentic',
    likelyAITool: null,
    confidenceLevel: 'Low',
    gradeEstimate: 'Pass',
    priorityFlag: 'green',
    criteriaResults: { P1: 'met', P2: 'met', M1: 'partial', D1: 'not_met' },
    flags: [],
    authenticElements: [
      'Good use of personal social media examples',
      'Screenshots of real campaigns included as evidence',
      'Writing style natural with some Polish syntax influence — consistent with student profile',
    ],
    summary: 'Authentic Pass work. M1 partially evidenced. Student shows good engagement with digital marketing concepts.',
    recommendations: ['Mark with confidence', 'Feedback on M1 analysis depth'],
    questionsForStudent: [],
    wordCount: 1890,
    reviewed: false,
  },

  // ═══════════════════════════════════════════════════════════════
  // CO-TAUGHT UNITS
  // David Urquhart (dau) + Simon Brown (sbo)
  // Unit 19 → BS1, Unit 14 → BS2
  // ═══════════════════════════════════════════════════════════════

  // GREEN — Co-taught (Unit 19, BS1)
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

  // YELLOW — Co-taught AI concern (Unit 19, BS1)
  {
    id: 'sub-018',
    studentId: 'bs1-20',  // Sharma: Sumit
    assignmentId: 'unit19-a',
    fileName: 'Unit19_AssA_Sumit.docx',
    submittedAt: '2026-02-22T16:45:00Z',
    status: 'complete',
    originalityScore: 82,
    originalityVerdict: 'Some concerns',
    likelyAITool: 'Possibly ChatGPT',
    confidenceLevel: 'Medium',
    gradeEstimate: 'Pass',
    priorityFlag: 'yellow',
    criteriaResults: { P1: 'met', P2: 'met', M1: 'partial', D1: 'not_met' },
    flags: [
      { type: 'ai_phrases', severity: 'medium', message: 'AI phrases in business model section: "holistic approach", "synergistic value proposition"' },
      { type: 'style_shift', severity: 'medium', message: 'Business model canvas section noticeably more sophisticated than pitch narrative' },
    ],
    authenticElements: [
      'Business idea (cricket coaching academy) is personal and specific',
      'Pitch narrative section written in natural voice',
      'Financial figures appear manually calculated with rounding errors',
    ],
    summary: 'Business idea and pitch are authentic but the business model analysis section shows possible AI assistance. Co-taught unit — both teachers should review before feedback.',
    recommendations: ['Quick check on business model section', 'Both teachers coordinate before student conversation'],
    questionsForStudent: ['Can you explain what you mean by "synergistic value proposition"?', 'Walk me through your business model canvas — why did you choose those elements?'],
    wordCount: 2340,
    reviewed: false,
  },

  // RED — Fail grade, co-taught (Unit 14, BS2)
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
    summary: 'Work appears authentic but incomplete. P2 criterion not met, resulting in Fail. Student may need additional support or extension. Co-taught unit — both teachers should be aware.',
    recommendations: ['Check if student needs additional support', 'Consider extension if circumstances warrant', 'Review P2 requirements with student', 'Coordinate with co-teacher'],
    questionsForStudent: [],
    wordCount: 820,
    reviewed: false,
  },

  // RED — AI content, co-taught (Unit 14, BS2)
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
];

// ─── Enrichment ──────────────────────────────────────────────
// Attach student, cohort, assignment, and unit info to each submission

function enrichSubmission(sub) {
  const student = STUDENTS.find(s => s.id === sub.studentId);
  const cohort = student ? getCohortById(student.cohortId) : null;
  
  // Handle ad hoc submissions differently
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

// ─── Unmatched Submissions ───────────────────────────────────
// Submissions that couldn't be automatically matched to a student or assignment
let UNMATCHED_SUBMISSIONS = [
  // Seeded demo entry — no unit number in title
  {
    id: 'unmatched-demo-001',
    type: 'unknown_assignment',
    studentId: 'bs2-14',
    studentName: 'Rahman: Gm Asafur',
    cohortId: 'bs2',
    assignmentTitle: 'Business Research Project',
    fileName: 'Research_Project_Asafur.docx',
    receivedAt: '2026-02-04T14:20:00Z',
    reason: 'Could not parse assignment from title "Business Research Project" — no unit number found',
  },
  // Seeded demo entry — unknown student
  {
    id: 'unmatched-demo-002',
    type: 'unknown_student',
    studentName: 'Johnson: Tyler',
    assignmentTitle: 'Unit 8 Assignment A',
    fileName: 'Unit8_AssA_Tyler.docx',
    receivedAt: '2026-02-05T09:10:00Z',
    reason: 'Student "Johnson: Tyler" not found in system',
  },
];

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
  
  // Return the resolved data for processing
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
