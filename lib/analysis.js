// AI Analysis Engine — v2
// Combined Originality + Holistic Assessment reports
// Loads teacher guidance resources when available

import { getAssignmentById } from '../data/units';
import { loadResources, formatResourcesForPrompt } from './resources';

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

// ─── Full AI Analysis — Standard Submission ─────────────────

async function aiAnalysis(text, studentName, assignmentId, uploaderName = null, studentCohortId = null) {
  const assignment = getAssignmentById(assignmentId);
  if (!assignment) throw new Error('Assignment not found');

  const criteriaList = assignment.criteria.join(', ');
  const resourceData = loadResources(assignmentId, uploaderName, studentCohortId);
  const resourcesPrompt = resourceData ? formatResourcesForPrompt(resourceData.resources, resourceData.teacherName) : '\nNo teacher guidance resources available for this assignment. Assess based on BTEC Level 3 general expectations.\n';
  const resourcesNote = resourceData ? `\nIMPORTANT: Teacher guidance resources are provided below (from ${resourceData.teacherName}). Students had access to: ${resourceData.summary}. Content that follows the scaffolding structure is EXPECTED and should not be flagged as suspicious. However, content significantly beyond the scaffolding, or using language/concepts not in the guidance, warrants closer originality scrutiny.\n` : '';

  const prompt = `You are an experienced BTEC Level 3 Business assessor producing a combined Originality and Holistic Assessment report. Read the entire submission as a continuous piece of work and produce a report in two parts.

CONTEXT:
- Student: ${studentName}
- Unit ${assignment.unitNumber}: ${assignment.unitTitle}
- Assignment: ${assignment.name}
- Criteria being assessed: ${criteriaList}
- BTEC Level 3 students are 16-18 year olds, many are bilingual learners at Gateway College, Leicester
- Students follow a describe > explain > evaluate progression (Pass > Merit > Distinction)
${resourcesNote}
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

PART B: HOLISTIC QUALITY ASSESSMENT

Read holistically — assess the whole document as continuous evidence. For each criterion:
1. State what evidence IS present
2. Identify what is missing or inadequate
3. Give provisional grade: "Met", "Partially met", "Not yet met", or "Not evidenced"
4. Quote or reference actual content

Then provide:
- Overall provisional grade (Distinction / Merit / Pass / Referral)
- "What Went Well" — written TO the student, encouraging and specific
- "Even Better If" — specific actionable guidance per criterion
- "Priority Actions" — numbered list for improvement/resubmission
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
    "assessmentApproach": "<how the document was read>",
    "documentOverview": "<what the document covers>",
    "criteriaAssessments": [
      {
        "criterion": "<e.g. P1>",
        "criterionTitle": "<full wording or brief description>",
        "evidencePresent": "<what evidence the student provided>",
        "gaps": "<what is missing or inadequate>",
        "provisionalGrade": "<Met|Partially met|Not yet met|Not evidenced>",
        "notes": "<additional observations>"
      }
    ],
    "overallGrade": "<Distinction|Merit|Pass|Referral>",
    "gradeJustification": "<1-2 sentences>",
    "whatWentWell": "<written to the student — encouraging, specific, referencing actual content>",
    "evenBetterIf": "<written to the student — specific actionable guidance per criterion>",
    "priorityActions": ["<numbered specific actions>"],
    "scaffoldingAlignment": "<how well the student followed provided guidance — only if resources available>",
    "conditionalNote": "<if originality concerns: note grade is conditional on verification>"
  },
  "verificationQuestions": ["<specific questions referencing their submission content>"],
  "recommendedActions": ["<teacher recommendations>"],
  "priorityFlag": "<red|yellow|green>",
  "summaryMetrics": {
    "overallOriginality": "<e.g. 'High (estimated 85-90% original)'>",
    "aiContentLikelihood": "<e.g. 'Low' or 'High (particularly M1 sections)'>",
    "probableAITool": "<tool name or 'None detected'>",
    "studentUnderstanding": "<Limited evidence|Some evidence|Good evidence>",
    "academicIntegrityConcern": "<Yes — significant|Yes — minor|No>"
  }
}

Student submission (${text.split(/\s+/).length} words):
${text.substring(0, 25000)}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 12000, messages: [{ role: 'user', content: prompt }] }),
  });

  if (!response.ok) { const errText = await response.text(); throw new Error(`API error ${response.status}: ${errText}`); }
  const data = await response.json();
  const responseText = data.content?.map(c => c.text || '').join('') || '';
  const cleaned = responseText.replace(/```json|```/g, '').trim();
  const result = JSON.parse(cleaned);
  result.resourcesUsed = resourceData ? resourceData.resources.map(r => ({ type: r.type, label: r.label })) : [];
  return result;
}

// ─── Ad Hoc Analysis — Originality Only ─────────────────────

async function aiAnalysisAdHoc(text, studentName, unitNumber) {
  const prompt = `You are an experienced BTEC Level 3 Business assessor. Analyse this ad hoc submission for ORIGINALITY ONLY (no criteria assessment — no marking guide available).

CONTEXT:
- Student: ${studentName}, Unit ${unitNumber} (ad hoc submission)
- BTEC Level 3, 16-18 year olds, many bilingual learners, Gateway College Leicester

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
  "verificationQuestions": ["<specific questions>"],
  "recommendedActions": ["<teacher recommendations>"],
  "priorityFlag": "<red|yellow|green>",
  "summaryMetrics": {
    "overallOriginality": "<e.g. 'High (85-90% original)'>",
    "aiContentLikelihood": "<e.g. 'Low'>",
    "probableAITool": "<tool or 'None detected'>",
    "studentUnderstanding": "<Limited|Some|Good evidence>",
    "academicIntegrityConcern": "<Yes — significant|Yes — minor|No>"
  }
}

Student submission (${text.split(/\s+/).length} words):
${text.substring(0, 25000)}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 8000, messages: [{ role: 'user', content: prompt }] }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  const responseText = data.content?.map(c => c.text || '').join('') || '';
  const cleaned = responseText.replace(/```json|```/g, '').trim();
  const result = JSON.parse(cleaned);
  result.resourcesUsed = [];
  return result;
}

// ─── Main Entry Point ───────────────────────────────────────

export async function analyzeSubmission(text, studentName, assignmentId, adHocUnitNumber = null, uploaderName = null, studentCohortId = null) {
  const local = localAnalysis(text);
  const isAdHoc = !assignmentId;

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
      ? await aiAnalysisAdHoc(text, studentName, adHocUnitNumber)
      : await aiAnalysis(text, studentName, assignmentId, uploaderName, studentCohortId);

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
      recommendations: ai.recommendedActions || [],
      questionsForStudent: ai.verificationQuestions || [],
      priorityFlag,
      localAnalysis: local,
      wordCount: local.wordCount,
      status: 'complete',
      isAdHoc,
      reportVersion: 2,
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
      wordCount: local.wordCount,
      status: 'complete',
      limitedAnalysis: true,
      isAdHoc,
      reportVersion: 1,
    };
  }
}

export { calculateGrade } from '../data/submissions';
