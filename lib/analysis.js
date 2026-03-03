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
// Three lens levels:
//   CLEAN  — no formatting concerns, assess on textual merits
//   GUARDED — some anomalies, look more carefully at flagged sections
//   SCEPTICAL — strong evidence of assembled content, treat with high scrutiny

function buildForensicLens(forensicsData) {
  if (!forensicsData || !forensicsData.summary) {
    return {
      level: 'clean',
      lens: '',
    };
  }

  const s = forensicsData.summary;
  const flags = forensicsData.forensicFlags || [];

  if (s.riskLevel === 'clean') {
    return {
      level: 'clean',
      lens: `\nFORENSIC PRE-ASSESSMENT: Document formatting analysis found no anomalies. The document appears to have been composed in a single writing environment with consistent formatting throughout. Assess this work on its textual merits.\n`,
    };
  }

  if (s.riskLevel === 'low') {
    return {
      level: 'clean',
      lens: `\nFORENSIC PRE-ASSESSMENT: Document formatting analysis found minor observations that are not conclusive on their own. Assess this work on its textual merits but note any corroborating textual evidence.\n`,
    };
  }

  // Build specific findings for medium/high risk
  const findings = [];
  const platformDetected = [];

  for (const flag of flags) {
    switch (flag.type) {
      case 'ai_platform_font': {
        const fontEntry = Object.entries(forensicsData.fontProfile || {}).find(([_, v]) => v.aiSignature);
        if (fontEntry) {
          platformDetected.push(fontEntry[1].aiSignature.platform);
          findings.push(`${fontEntry[1].percentage}% of the document body text is in ${fontEntry[0]}, the default font of ${fontEntry[1].aiSignature.platform}. This font is not a Word default and would not appear in student-typed work.`);
        }
        break;
      }
      case 'font_transitions': {
        const transitions = forensicsData.transitions || [];
        const highSig = transitions.filter(t => t.significance === 'high');
        if (highSig.length > 0) {
          const t = highSig[0];
          findings.push(`The document font changes from ${t.fromFont} to ${t.toFont} at paragraph ${t.toParagraph}, indicating content from a different source begins at that point. Look particularly carefully at the vocabulary and style shift from that paragraph onwards.`);
        }
        break;
      }
      case 'bold_inconsistency': {
        const toggles = forensicsData.boldPattern?.toggleCount || 0;
        findings.push(`The body text alternates between bold and normal formatting ${toggles} times, consistent with ${toggles + 1} separate paste operations from different prompts or sessions.`);
        break;
      }
      case 'rsid_paste_block': {
        const blockSize = forensicsData.rsidAnalysis?.largestBlock || 0;
        findings.push(`${blockSize} consecutive paragraphs share the same revision ID, meaning they were pasted into the document in a single operation rather than typed incrementally.`);
        break;
      }
      case 'spelling_convention': {
        if (forensicsData.spellingConvention?.americanCount > 0) {
          findings.push(`${forensicsData.spellingConvention.americanCount} American English spellings were found (${forensicsData.spellingConvention.americanExamples.map(e => e.replace(/ \(×\d+\)/, '')).join(', ')}). ChatGPT defaults to American English; Gateway College students would typically use British English.`);
        }
        break;
      }
      case 'theme_font_anomaly': {
        findings.push(`The AI platform font ${flag.evidence?.replace('Theme font: ', '') || ''} is embedded in the document template itself, suggesting the document was created in or heavily influenced by an AI environment.`);
        break;
      }
      case 'multiple_font_sources': {
        findings.push(`The document contains content from ${flags.find(f => f.type === 'multiple_font_sources')?.detail?.match(/(\d+) distinct/)?.[1] || 'multiple'} different font environments, indicating it was assembled from multiple sources.`);
        break;
      }
    }
  }

  if (s.riskLevel === 'medium') {
    return {
      level: 'guarded',
      lens: `\nFORENSIC PRE-ASSESSMENT (GUARDED): Document formatting analysis has identified anomalies suggesting this may not be entirely the work of a single author in a single environment.\n\nFindings:\n${findings.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\nThese formatting indicators cannot be faked by humanizer tools and students are typically unaware they exist. Assess the text with these findings in mind — pay particular attention to vocabulary consistency, whether the writing quality shifts at the points where formatting changes, and whether the level of analysis is consistent with BTEC Level 3 student ability.\n`,
    };
  }

  // High risk
  const platform = platformDetected.length > 0 ? platformDetected[0] : 'an AI platform';
  return {
    level: 'sceptical',
    lens: `\nFORENSIC PRE-ASSESSMENT (SCEPTICAL): Document formatting analysis provides strong evidence that this submission contains content assembled from ${platform}. This document was not produced by a single author working in a single environment.\n\nKey evidence:\n${findings.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\nThese are objective formatting indicators that cannot be faked by humanizer tools and students are typically unaware they exist. Approach this text analysis with high scrutiny:\n- Assume the document contains externally sourced content until the text evidence suggests otherwise\n- Look specifically for vocabulary and analytical sophistication that is inconsistent with BTEC Level 3 student ability\n- Identify any sections that DO appear authentically student-written (natural errors, informal voice, appropriate vocabulary level) — these may indicate where the student's own work begins and ends\n- Pay close attention to fabricated statistics, orphaned sentences, and abrupt style shifts\n- Note that even if a humanizer has been applied, the formatting evidence remains — the content was not written by this student in Word\n`,
  };
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
      // Document forensics — separate data layer for dashboard display
      documentForensics: forensicsData ? {
        summary: forensicsData.summary,
        lensLevel: ai.forensicLensLevel || 'clean',
        fontProfile: forensicsData.fontProfile,
        boldPattern: forensicsData.boldPattern,
        spellingConvention: forensicsData.spellingConvention,
        rsidAnalysis: forensicsData.rsidAnalysis ? {
          totalContentParas: forensicsData.rsidAnalysis.totalContentParas,
          uniqueRsids: forensicsData.rsidAnalysis.uniqueRsids,
          largestBlock: forensicsData.rsidAnalysis.largestBlock,
          blockDetails: forensicsData.rsidAnalysis.blockDetails,
        } : null,
        runFragmentation: forensicsData.runFragmentation ? {
          avgCharsPerRun: forensicsData.runFragmentation.avgCharsPerRun,
          totalRuns: forensicsData.runFragmentation.totalRuns,
          concern: forensicsData.runFragmentation.concern,
        } : null,
        documentProperties: forensicsData.documentProperties || null,
        forensicFlags: forensicsData.forensicFlags,
        forensicScore: { divisor: forensicScore.divisor, weights: forensicScore.weights, total: forensicScore.total },
        transitions: forensicsData.transitions?.slice(0, 10),
      } : null,
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
