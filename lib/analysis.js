// AI Analysis Engine — v3 (Lens Architecture)
// 
// Architecture:
// 1. Document forensics runs FIRST — examines .docx XML metadata
// 2. Forensics produces a CONCLUSION (not raw data) about document integrity
// 3. That conclusion frames the text analysis prompt as a "lens"
// 4. Claude performs text-level originality + holistic assessment through that lens
//
// The forensics layer answers: "Was this produced by one person in one environment?"
// The text analysis layer answers: "What does the content tell us about originality?"
// The lens ensures the text analysis looks harder where forensics found anomalies.

import { getAssignmentById } from '../data/units';
import { loadResources, formatResourcesForPrompt } from './resources';
import { calculateForensicDivisor } from './docForensics';
import { buildReport } from './reportSchema';

// ─── Local Analysis (fallback) ──────────────────────────────

const AI_PHRASES = [
  { text: 'it is important to note', weight: 3 },
  { text: 'in today\'s', weight: 2 },
  { text: 'it is worth noting', weight: 3 },
  { text: 'in conclusion', weight: 1 },
  { text: 'furthermore', weight: 2 },
  { text: 'delve into', weight: 3 },
  { text: 'multifaceted', weight: 3 },
  { text: 'comprehensive understanding', weight: 3 },
  { text: 'nuanced', weight: 2 },
  { text: 'crucial role', weight: 2 },
  { text: 'pivotal', weight: 2 },
  { text: 'holistic approach', weight: 3 },
  { text: 'synergistic', weight: 4 },
  { text: 'paradigm', weight: 3 },
  { text: 'in the realm of', weight: 3 },
  { text: 'it\'s important to', weight: 2 },
  { text: 'landscape', weight: 2 },
  { text: 'robust', weight: 2 },
  { text: 'leverage', weight: 2 },
  { text: 'foster', weight: 2 },
  { text: 'encompasses', weight: 2 },
  { text: 'navigate the complexities', weight: 4 },
  { text: 'in this regard', weight: 2 },
  { text: 'plays a vital role', weight: 2 },
  { text: 'serves as a testament', weight: 3 },
  { text: 'moreover', weight: 2 },
  { text: 'consequently', weight: 2 },
  { text: 'subsequently', weight: 2 },
  { text: 'henceforth', weight: 3 },
  { text: 'in light of', weight: 2 },
  { text: 'it should be noted', weight: 3 },
  { text: 'data driven', weight: 2 },
  { text: 'customer sentiment', weight: 3 },
  { text: 'market intelligence', weight: 3 },
];

function localAnalysis(text) {
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.length > 0 ? Math.round(wordCount / sentences.length) : 0;

  const lowerText = text.toLowerCase();
  const foundPhrases = [];
  let totalWeight = 0;

  AI_PHRASES.forEach(phrase => {
    const regex = new RegExp(phrase.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      foundPhrases.push({ ...phrase, count: matches.length });
      totalWeight += phrase.weight * matches.length;
    }
  });

  const complexWords = words.filter(w => w.length > 10).length;
  const complexRatio = wordCount > 0 ? complexWords / wordCount : 0;

  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const paraLengths = paragraphs.map(p => p.split(/\s+/).length);
  const avgParaLength = paraLengths.length > 0 ? paraLengths.reduce((a, b) => a + b, 0) / paraLengths.length : 0;
  const paraVariance = paraLengths.length > 1
    ? Math.sqrt(paraLengths.reduce((sum, l) => sum + Math.pow(l - avgParaLength, 2), 0) / paraLengths.length)
    : 0;
  const uniformityScore = avgParaLength > 0 ? Math.min(1, paraVariance / avgParaLength) : 0;

  let score = 100;
  score -= Math.min(30, totalWeight * 2);
  score -= Math.min(15, complexRatio * 150);
  if (uniformityScore < 0.2 && paragraphs.length > 3) score -= 10;
  if (avgSentenceLength > 25) score -= 5;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return { wordCount, sentenceCount: sentences.length, avgSentenceLength, paragraphCount: paragraphs.length, complexWordRatio: Math.round(complexRatio * 100), foundPhrases, totalWeight, uniformityScore: Math.round(uniformityScore * 100), originalityScore: score };
}

// ─── Forensic Lens Builder ──────────────────────────────────
// Produces a conclusion paragraph that frames the text analysis.
// The lens is built from the document's CHARACTER assessment
// (organic/indeterminate/uniform/assembled/placed) rather than
// counting individual flags.
//
// Key principle: forensics can escalate scrutiny but cannot
// grant absolution. A clean forensic result means "no evidence
// against" — not "evidence for."

function buildForensicLens(forensicsData) {
  if (!forensicsData || !forensicsData.summary) {
    return {
      level: 'neutral',
      lens: '',
    };
  }

  const character = forensicsData.character;
  const organicism = forensicsData.organicism;

  // If no character assessment available, fall back to summary risk level
  if (!character) {
    const s = forensicsData.summary;
    if (s.riskLevel === 'clean' || s.riskLevel === 'low') {
      return { level: 'neutral', lens: '' };
    }
    return {
      level: s.riskLevel === 'high' ? 'sceptical' : 'guarded',
      lens: `\nFORENSIC PRE-ASSESSMENT: ${s.message}\n`,
    };
  }

  switch (character.level) {
    case 'organic':
      // No forensic concerns — say nothing. Let the text analysis
      // run without bias in either direction.
      return {
        level: 'neutral',
        lens: '',
      };

    case 'indeterminate':
      // Minor observations, not enough to frame the analysis
      return {
        level: 'neutral',
        lens: `\nFORENSIC PRE-ASSESSMENT: ${character.summary}\n`,
      };

    case 'uniform':
      // Low formatting variation — the absence of organic variation
      // is itself a finding. The text analysis should be aware of this
      // context without being told to be suspicious.
      return {
        level: 'guarded',
        lens: `\nFORENSIC PRE-ASSESSMENT (GUARDED): ${character.summary}\n\nThe text-level analysis should assess whether the intellectual quality and vocabulary level of this work are consistent with the student's expected ability. The formatting uniformity provides context but is not conclusive on its own.\n`,
      };

    case 'assembled':
      // Evidence of content from multiple external sources
      return {
        level: 'sceptical',
        lens: `\nFORENSIC PRE-ASSESSMENT (SCEPTICAL): ${character.summary}\n\nThese are objective formatting indicators that cannot be faked by text-modification tools and students are typically unaware they exist. Assess the text with high scrutiny:\n- Identify any sections that DO appear authentically student-written (natural errors, informal voice, appropriate vocabulary level)\n- Look specifically for vocabulary and analytical sophistication inconsistent with BTEC Level 3 student ability\n- Note that even if the text has been modified, the formatting evidence of external sourcing remains\n`,
      };

    case 'placed':
      // Strong evidence document was not built by the submitter
      return {
        level: 'sceptical',
        lens: `\nFORENSIC PRE-ASSESSMENT (SCEPTICAL): ${character.summary}\n\nThese are objective properties of the document file that cannot be altered by text-modification tools. Approach this text analysis with high scrutiny:\n- Assume the document contains externally sourced content until the text evidence suggests otherwise\n- Look specifically for vocabulary and analytical sophistication inconsistent with BTEC Level 3 student ability\n- Identify any sections that DO appear authentically student-written — these may indicate where the student's own work begins and ends\n- Pay close attention to fabricated statistics, orphaned sentences, and abrupt style shifts\n`,
      };

    default:
      return { level: 'neutral', lens: '' };
  }
}

// ─── Full AI Analysis — Standard Submission ─────────────────

async function aiAnalysis(text, studentName, assignmentId, uploaderName = null, studentCohortId = null, forensicsData = null) {
  const assignment = getAssignmentById(assignmentId);
  if (!assignment) throw new Error('Assignment not found');

  const criteriaList = assignment.criteria.join(', ');
  const resourceData = loadResources(assignmentId, uploaderName, studentCohortId);
  const resourcesPrompt = resourceData ? formatResourcesForPrompt(resourceData.resources, resourceData.teacherName) : '\nNo teacher guidance resources available for this assignment. Assess based on BTEC Level 3 general expectations.\n';
  const resourcesNote = resourceData ? `\nIMPORTANT: Teacher guidance resources are provided below (from ${resourceData.teacherName}). Students had access to: ${resourceData.summary}. Content that follows the scaffolding structure is EXPECTED and should not be flagged as suspicious. However, content significantly beyond the scaffolding, or using language/concepts not in the guidance, warrants closer originality scrutiny.\n` : '';
  const forensicLens = buildForensicLens(forensicsData);

  const prompt = `You are an experienced BTEC Level 3 Business assessor producing a combined Originality and Holistic Assessment report. Read the entire submission as a continuous piece of work and produce a report in two parts.

CONTEXT:
- Student: ${studentName}
- Unit ${assignment.unitNumber}: ${assignment.unitTitle}
- Assignment: ${assignment.name}
- Criteria being assessed: ${criteriaList}
- BTEC Level 3 students are 16-18 year olds, many are bilingual learners at Gateway College, Leicester
- Students follow a describe > explain > evaluate progression (Pass > Merit > Distinction)
${resourcesNote}${forensicLens.lens}
PART A: ORIGINALITY ASSESSMENT

Assess for originality and academic integrity with specific, evidence-based analysis:

1. HUMANIZER DETECTION (tools like StealthWriter/Undetectable AI):
   - Excessive formal connectives (count "Furthermore", "Moreover", "Additionally" — more than 3-4 of any is suspicious)
   - Abnormal abbreviation frequency (count exact "e.g." occurrences)
   - Inconsistent vocabulary: simple errors mixed with sophisticated terminology
   - Unusual synonym substitutions ("challengers" for "competitors", "lure" for "attract")
   - Formulaic repeated sentence patterns ("This helps [Company]...", "This allows [Company]...")

2. DIRECT AI GENERATION (no humanizer):
   - Harvard-style academic citations atypical for L3 BTEC
   - Zero errors across a long document
   - Language significantly above level
   - Leftover AI artifacts (URL-style references, grade labels as headers)
   - Perfect paragraph structure with no natural variation

3. AUTHENTIC STUDENT INDICATORS:
   - Natural typos consistent with typing speed
   - Informal language appropriate for cohort
   - Appropriate connective frequency
   - Consistent vocabulary level throughout
   - Genuine student reasoning (slightly awkward but showing comprehension)
   - Reference list quality (Google Search URLs = genuine but unskilled research)

Provide SPECIFIC EVIDENCE with exact quotes and occurrence counts.

PART B: CRITERIA ASSESSMENT

Read holistically — assess the whole document as continuous evidence. For each criterion:
1. State what evidence IS present (with quotes or references to actual content)
2. Identify what is missing or inadequate
3. Give provisional grade: "Met", "Partially met", "Not yet met", or "Not evidenced"
4. Note any observations relevant to the evidence quality

Then provide an overall provisional grade with justification.
If there are originality concerns, note that the grade is conditional on verification.
${resourcesPrompt}
Respond ONLY in valid JSON with no preamble or markdown fencing:
{
  "triageClassification": "<REVIEW (Red)|CHECK (Amber)|ON TRACK (Green)>",
  "originalityAssessment": {
    "overallVerdict": "<Largely Authentic Student Work|Some Concerns — Verification Recommended|Significant Concerns — Verification Required|Strong AI Indicators — Urgent Review>",
    "originalityScore": <0-100>,
    "confidenceLevel": "<Low|Medium|High>",
    "likelyAITool": "<null|ChatGPT|Gemini|Copilot|Claude|Humanizer (e.g. StealthWriter)|Unknown>",
    "likelyAIToolReasoning": "<2-3 sentences with specific evidence>",
    "humanizerMarkers": [{"marker": "<description>", "evidence": "<specific evidence with counts>", "significance": "<why this matters>"}],
    "directAIMarkers": [{"marker": "<description>", "evidence": "<specific examples>", "significance": "<why this matters>"}],
    "authenticIndicators": ["<specific evidence of genuine student work with quotes>"],
    "vocabularyFlags": [{"quote": "<exact quote>", "concern": "<why beyond L3>"}],
    "copyPasteIndicators": [{"text": "<problematic text>", "location": "<where>", "significance": "<why>"}],
    "researchQualityNotes": "<observations about references and source quality>",
    "summary": "<2-3 sentence originality summary>"
  },
  "holisticAssessment": {
    "documentOverview": "<what the document covers>",
    "criteriaAssessments": [
      {
        "criterion": "<e.g. P1>",
        "criterionTitle": "<full wording or brief description>",
        "evidencePresent": "<what evidence the student provided — specific quotes and references>",
        "gaps": "<what is missing or inadequate>",
        "provisionalGrade": "<Met|Partially met|Not yet met|Not evidenced>",
        "notes": "<additional observations>"
      }
    ],
    "overallGrade": "<Distinction|Merit|Pass|Referral>",
    "gradeJustification": "<1-2 sentences>",
    "conditionalNote": "<if originality concerns: note grade is conditional on verification>"
  },
  "verificationQuestions": ["<specific questions referencing their submission content — for teacher to use at their discretion>"],
  "priorityFlag": "<red|yellow|green>"
}

Student submission (${text.split(/\s+/).length} words):
${text.substring(0, 25000)}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 16000, messages: [{ role: 'user', content: prompt }] }),
  });

  if (!response.ok) { const errText = await response.text(); throw new Error(`API error ${response.status}: ${errText}`); }
  const data = await response.json();
  const responseText = data.content?.map(c => c.text || '').join('') || '';
  const cleaned = responseText.replace(/```json|```/g, '').trim();
  const result = JSON.parse(cleaned);
  result.resourcesUsed = resourceData ? resourceData.resources.map(r => ({ type: r.type, label: r.label })) : [];
  result.forensicLensLevel = forensicLens.level;
  return result;
}

// ─── Ad Hoc Analysis — Originality Only ─────────────────────

async function aiAnalysisAdHoc(text, studentName, unitNumber, forensicsData = null) {
  const forensicLens = buildForensicLens(forensicsData);
  const prompt = `You are an experienced BTEC Level 3 Business assessor. Analyse this ad hoc submission for ORIGINALITY ONLY (no criteria assessment — no marking guide available).

CONTEXT:
- Student: ${studentName}, Unit ${unitNumber} (ad hoc submission)
- BTEC Level 3, 16-18 year olds, many bilingual learners, Gateway College Leicester
${forensicLens.lens}
Analyse for: humanizer detection, direct AI generation markers, authentic student indicators, copy-paste indicators. Provide specific evidence with quotes and counts.

Respond ONLY in valid JSON:
{
  "triageClassification": "<REVIEW (Red)|CHECK (Amber)|ON TRACK (Green)>",
  "originalityAssessment": {
    "overallVerdict": "<Largely Authentic Student Work|Some Concerns — Verification Recommended|Significant Concerns — Verification Required|Strong AI Indicators — Urgent Review>",
    "originalityScore": <0-100>,
    "confidenceLevel": "<Low|Medium|High>",
    "likelyAITool": "<null|ChatGPT|Gemini|Copilot|Claude|Humanizer|Unknown>",
    "likelyAIToolReasoning": "<2-3 sentences>",
    "humanizerMarkers": [{"marker": "<desc>", "evidence": "<evidence>", "significance": "<why>"}],
    "directAIMarkers": [{"marker": "<desc>", "evidence": "<examples>", "significance": "<why>"}],
    "authenticIndicators": ["<evidence with quotes>"],
    "vocabularyFlags": [{"quote": "<quote>", "concern": "<why beyond L3>"}],
    "copyPasteIndicators": [{"text": "<text>", "location": "<where>", "significance": "<why>"}],
    "researchQualityNotes": "<observations>",
    "summary": "<2-3 sentences — ad hoc originality check only>"
  },
  "verificationQuestions": ["<specific questions referencing their submission content>"],
  "priorityFlag": "<red|yellow|green>"
}

Student submission (${text.split(/\s+/).length} words):
${text.substring(0, 25000)}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 12000, messages: [{ role: 'user', content: prompt }] }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  const responseText = data.content?.map(c => c.text || '').join('') || '';
  const cleaned = responseText.replace(/```json|```/g, '').trim();
  const result = JSON.parse(cleaned);
  result.resourcesUsed = [];
  result.forensicLensLevel = forensicLens.level;
  return result;
}

// ─── Main Entry Point ───────────────────────────────────────

export async function analyzeSubmission(text, studentName, assignmentId, adHocUnitNumber = null, uploaderName = null, studentCohortId = null, forensicsData = null) {
  const local = localAnalysis(text);
  const isAdHoc = !assignmentId;
  const assignment = assignmentId ? getAssignmentById(assignmentId) : null;

  // Calculate forensic score for storage (even though it doesn't modify the AI score)
  const forensicScore = forensicsData ? calculateForensicDivisor(forensicsData) : { divisor: 1.0, weights: [], total: 0 };

  function getPriorityFlag(score, grade) {
    if (score < 80 || grade === 'Fail' || grade === 'Referral') return 'red';
    if (score < 90 || grade === 'Pass') return 'yellow';
    return 'green';
  }

  function getAdHocPriorityFlag(score) {
    if (score < 80) return 'red';
    if (score < 90) return 'yellow';
    return 'green';
  }

  try {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('No API key');

    const ai = isAdHoc
      ? await aiAnalysisAdHoc(text, studentName, adHocUnitNumber, forensicsData)
      : await aiAnalysis(text, studentName, assignmentId, uploaderName, studentCohortId, forensicsData);

    const originalityScore = ai.originalityAssessment?.originalityScore ?? local.originalityScore;
    const gradeEstimate = ai.holisticAssessment?.overallGrade ?? null;
    const priorityFlag = ai.priorityFlag || (isAdHoc ? getAdHocPriorityFlag(originalityScore) : getPriorityFlag(originalityScore, gradeEstimate));

    // Build criteriaResults for backward compatibility
    const criteriaResults = {};
    if (ai.holisticAssessment?.criteriaAssessments) {
      ai.holisticAssessment.criteriaAssessments.forEach(ca => {
        const gradeMap = { 'Met': 'met', 'Partially met': 'partial', 'Not yet met': 'not_met', 'Not evidenced': 'not_met' };
        criteriaResults[ca.criterion] = gradeMap[ca.provisionalGrade] || 'not_met';
      });
    }

    // Build structured report from Phase 1 + Phase 2
    const reportMetadata = {
      studentName,
      cohortId: studentCohortId,
      unitNumber: assignment?.unitNumber || adHocUnitNumber,
      unitTitle: assignment?.unitTitle || `Unit ${adHocUnitNumber}`,
      assignmentName: assignment?.name || null,
      criteria: assignment?.criteria || [],
      wordCount: local.wordCount,
      submittedAt: null,
      isAdHoc,
    };

    const structuredReport = buildReport(reportMetadata, forensicsData, ai);

    // Return structured report + backward-compatible flat fields
    return {
      ...ai,
      originalityScore,
      originalityVerdict: ai.originalityAssessment?.overallVerdict || 'Unknown',
      likelyAITool: ai.originalityAssessment?.likelyAITool || null,
      likelyAIToolReasoning: ai.originalityAssessment?.likelyAIToolReasoning || null,
      confidenceLevel: ai.originalityAssessment?.confidenceLevel || 'Low',
      gradeEstimate,
      criteriaResults,
      summary: ai.originalityAssessment?.summary || '',
      questionsForStudent: ai.verificationQuestions || [],
      priorityFlag,
      localAnalysis: local,
      report: structuredReport,
      documentForensics: structuredReport.forensics,
      wordCount: local.wordCount,
      status: 'complete',
      isAdHoc,
      reportVersion: 3,
    };
  } catch (err) {
    console.error('AI analysis failed, using local only:', err.message);

    const priorityFlag = isAdHoc ? getAdHocPriorityFlag(local.originalityScore) : getPriorityFlag(local.originalityScore, 'Unknown');

    return {
      originalityScore: local.originalityScore,
      originalityVerdict: local.originalityScore >= 90 ? 'Appears authentic' : local.originalityScore >= 80 ? 'Some concerns' : 'High concern',
      likelyAITool: local.totalWeight >= 10 ? 'Possibly ChatGPT' : null,
      confidenceLevel: 'Low',
      gradeEstimate: isAdHoc ? null : 'Requires manual review',
      criteriaResults: isAdHoc ? null : {},
      flags: local.foundPhrases.slice(0, 5).map(p => ({ type: 'ai_phrases', severity: p.weight >= 3 ? 'high' : p.weight >= 2 ? 'medium' : 'low', message: `AI indicator phrase "${p.text}" found ${p.count} time(s)` })),
      authenticElements: [],
      summary: isAdHoc ? `Ad hoc — local analysis score: ${local.originalityScore}%. Manual review recommended.` : `Local analysis only (AI unavailable). Score: ${local.originalityScore}%. Manual review recommended.`,
      recommendations: ['Manual review required', 'Discuss submission with student'],
      questionsForStudent: [],
      priorityFlag,
      localAnalysis: local,
      documentForensics: null,
      wordCount: local.wordCount,
      status: 'complete',
      limitedAnalysis: true,
      isAdHoc,
      reportVersion: 1,
    };
  }
}

export { calculateGrade } from '../data/submissions';
