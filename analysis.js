// AI Analysis Engine — v5 (PDF Support)
// 
// Architecture:
// 1. Document forensics runs FIRST — examines .docx XML metadata (FREQUENCY)
//    *** SKIPPED for PDF submissions — no XML metadata available ***
// 2. Claude performs TWO assessments in a single call:
//    a. CRITERIA ASSESSMENT — runs CLEAN, no forensic lens. Assesses what's on the page.
//       This is the AMPLITUDE signal: how strong is the academic content?
//    b. ORIGINALITY ASSESSMENT — runs WITH forensic lens (docx) or content-only (pdf).
//       This combines with forensics to produce the FREQUENCY signal: what type of signal?
// 3. Stage 3 TRIAGE — JavaScript logic combines amplitude + frequency:
//    - High frequency (placed) + high amplitude (strong grades) = Red (effective tool use)
//    - High frequency (placed) + low amplitude (weak grades) = Amber (tool use but poor output)
//    - Low frequency (organic) + any amplitude = trust the text analysis
//    - Definitive forensic evidence = cannot be Green regardless of text analysis
//    - PDF submissions = no forensic layer, triage on text/content analysis only
//
// The forensics layer answers: "Was this produced by one person in one environment?"
// The criteria layer answers: "What academic quality is present on the page?"
// The originality layer answers: "What does the text evidence say about authorship?"
// The triage logic answers: "Given all three, what should the teacher investigate?"

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
      return {
        level: 'neutral',
        lens: '',
      };

    case 'indeterminate':
      return {
        level: 'neutral',
        lens: `\nFORENSIC PRE-ASSESSMENT: ${character.summary}\n`,
      };

    case 'uniform':
      return {
        level: 'guarded',
        lens: `\nFORENSIC PRE-ASSESSMENT (GUARDED): ${character.summary}\n\nThe text-level analysis should assess whether the intellectual quality and vocabulary level of this work are consistent with the student's expected ability. The formatting uniformity provides context but is not conclusive on its own.\n`,
      };

    case 'assembled':
      return {
        level: 'sceptical',
        lens: `\nFORENSIC PRE-ASSESSMENT (SCEPTICAL): ${character.summary}\n\nThese are objective formatting indicators that cannot be faked by text-modification tools and students are typically unaware they exist. Assess the text with high scrutiny:\n- Identify any sections that DO appear authentically student-written (natural errors, informal voice, appropriate vocabulary level)\n- Look specifically for vocabulary and analytical sophistication inconsistent with BTEC Level 3 student ability\n- Note that even if the text has been modified, the formatting evidence of external sourcing remains\n`,
      };

    case 'placed':
      return {
        level: 'sceptical',
        lens: `\nFORENSIC PRE-ASSESSMENT (SCEPTICAL): ${character.summary}\n\nThese are objective properties of the document file that cannot be altered by text-modification tools. Approach this text analysis with high scrutiny:\n- Assume the document contains externally sourced content until the text evidence suggests otherwise\n- Look specifically for vocabulary and analytical sophistication inconsistent with BTEC Level 3 student ability\n- Identify any sections that DO appear authentically student-written — these may indicate where the student's own work begins and ends\n- Pay close attention to fabricated statistics, orphaned sentences, and abrupt style shifts\n`,
      };

    default:
      return { level: 'neutral', lens: '' };
  }
}

// ─── PDF Context Builder ────────────────────────────────────
// For PDF submissions, there's no forensic data. Instead we tell
// Claude to pay attention to visual/layout signals it can observe
// directly from the PDF rendering.

function buildPdfContext() {
  return `
DOCUMENT FORMAT: PDF
No document forensics are available for PDF submissions. The mechanical analysis of .docx XML metadata (font declarations, rsid editing patterns, bold patterns, paste detection) cannot be performed on PDF files.

Your originality assessment must rely entirely on content and visual analysis. Pay particular attention to:
- VISUAL FORMATTING: Does the layout, font usage, and visual presentation look like a student-produced document or a professionally generated one? Look for consistent margins, headers, and formatting that suggest template or AI-export origin.
- CONTENT SIGNALS: All the standard originality indicators (vocabulary level, AI phrases, structural uniformity, humanizer markers) remain fully applicable.
- PRESENTATION QUALITY: PDF submissions that look like they were exported from an AI chat interface, Google Docs, or other platform may show characteristic visual patterns.
- IMAGE/DIAGRAM USAGE: Note any screenshots, charts, or images — their presence and quality can indicate the production method.

IMPORTANT: The absence of forensic data means your confidence ceiling for originality assessment is inherently lower than for .docx submissions. Reflect this in your confidence level. You cannot make definitive claims about document construction — only about content characteristics.
`;
}

// ─── Claude API Message Builder ─────────────────────────────
// Builds the messages array for the Claude API call.
// For .docx: sends extracted text as a user message.
// For .pdf: sends the PDF as a base64 document block so Claude
// can see the actual visual layout alongside the prompt.

function buildApiMessages(prompt, fileType, pdfBase64, text) {
  if (fileType === 'pdf' && pdfBase64) {
    // Send PDF as a document block + the analysis prompt as text
    return [{
      role: 'user',
      content: [
        {
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: pdfBase64,
          },
        },
        {
          type: 'text',
          text: prompt,
        },
      ],
    }];
  }
  // Default: text-only (docx path)
  return [{ role: 'user', content: prompt }];
}

// ─── Full AI Analysis — Standard Submission ─────────────────

async function aiAnalysis(text, studentName, assignmentId, uploaderName = null, studentCohortId = null, forensicsData = null, fileType = 'docx', pdfBase64 = null) {
  const assignment = getAssignmentById(assignmentId);
  if (!assignment) throw new Error('Assignment not found');

  const criteriaList = assignment.criteria.join(', ');
  const resourceData = loadResources(assignmentId, uploaderName, studentCohortId);
  const resourcesPrompt = resourceData ? formatResourcesForPrompt(resourceData.resources, resourceData.teacherName) : '\nNo teacher guidance resources available for this assignment. Assess based on BTEC Level 3 general expectations.\n';
  const resourcesNote = resourceData ? `\nIMPORTANT: Teacher guidance resources are provided below (from ${resourceData.teacherName}). Students had access to: ${resourceData.summary}. Content that follows the scaffolding structure is EXPECTED and should not be flagged as suspicious. However, content significantly beyond the scaffolding, or using language/concepts not in the guidance, warrants closer originality scrutiny.\n` : '';
  
  const isPdf = fileType === 'pdf';
  const forensicLens = isPdf ? { level: 'neutral', lens: '' } : buildForensicLens(forensicsData);
  const pdfContext = isPdf ? buildPdfContext() : '';

  // For PDF: word count comes from local text extraction (may be approximate)
  // For docx: word count comes from mammoth extraction (reliable)
  const wordCountNote = isPdf && (!text || text.trim().length < 100)
    ? 'Word count unavailable — assess document length visually from the PDF.'
    : `${text.split(/\s+/).length} words`;

  const prompt = `You are an experienced BTEC Level 3 Business assessor producing a combined assessment report. This report has TWO PARTS that must be assessed INDEPENDENTLY using different approaches.

CONTEXT:
- Student: ${studentName}
- Unit ${assignment.unitNumber}: ${assignment.unitTitle}
- Assignment: ${assignment.name}
- Criteria being assessed: ${criteriaList}
- BTEC Level 3 students are 16-18 year olds, many are bilingual learners at Gateway College, Leicester
- Students follow a describe > explain > evaluate progression (Pass > Merit > Distinction)
- Document length: ${wordCountNote}
${resourcesNote}${pdfContext}
═══════════════════════════════════════════════════════
PART B: CRITERIA ASSESSMENT — ASSESS FIRST, ASSESS CLEAN
═══════════════════════════════════════════════════════

CRITICAL INSTRUCTION: Assess the criteria based SOLELY on what is written in the submission. Do NOT consider originality, authorship, or document integrity concerns in this section. Your job here is to describe what evidence IS present on the page, identify gaps, and grade against the criteria. Assess as if the work is genuine — originality is handled separately in Part A.

Read holistically — assess the whole document as continuous evidence. For each criterion:
1. State what evidence IS present (with quotes or references to actual content)
2. Identify what is missing or inadequate
3. Give provisional grade: "Met", "Partially met", "Not yet met", or "Not evidenced"
4. Note any observations relevant to the evidence quality

GRADING RULES (apply mechanically after criterion assessment):
- Distinction: P1 Met AND M1 Met AND D1 Met
- Merit: P1 Met AND M1 Met (D1 may be Partially met or Not yet met)
- Pass: P1 Met (M1 and D1 may be any status)
- Referral: P1 is Partially met or Not yet met or Not evidenced

If there are originality concerns from Part A, note that the grade is conditional on verification — but do NOT let originality concerns change the criterion grades themselves.
${resourcesPrompt}
═══════════════════════════════════════════════════════
PART A: ORIGINALITY ASSESSMENT — NOW APPLY ${isPdf ? 'CONTENT ANALYSIS' : 'FORENSIC CONTEXT'}
═══════════════════════════════════════════════════════
${forensicLens.lens}
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

IMPORTANT: Your originality assessment should NOT influence the criterion grades in Part B. Those are assessed independently. If you find originality concerns, the "conditionalNote" field handles the relationship.
${isPdf ? '\nREMINDER: This is a PDF submission. No document forensics are available. Your confidence level should reflect this limitation — you cannot make definitive claims about document construction, only about content characteristics. Set confidence to "Low" or "Medium" unless content signals are very strong.\n' : ''}
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

${isPdf ? 'The student submission PDF is attached as a document above. Analyse it visually and textually.' : `Student submission (${text.split(/\\s+/).length} words):\n${text.substring(0, 25000)}`}`;

  const messages = buildApiMessages(prompt, fileType, pdfBase64, text);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 16000, messages }),
  });

  if (!response.ok) { const errText = await response.text(); throw new Error(`API error ${response.status}: ${errText}`); }
  const data = await response.json();
  const responseText = data.content?.map(c => c.text || '').join('') || '';
  const cleaned = responseText.replace(/```json|```/g, '').trim();
  const result = JSON.parse(cleaned);
  result.resourcesUsed = resourceData ? resourceData.resources.map(r => ({ type: r.type, label: r.label })) : [];
  result.forensicLensLevel = forensicLens.level;
  result.fileType = fileType;
  return result;
}

// ─── Ad Hoc Analysis — Originality Only ─────────────────────

async function aiAnalysisAdHoc(text, studentName, unitNumber, forensicsData = null, fileType = 'docx', pdfBase64 = null) {
  const isPdf = fileType === 'pdf';
  const forensicLens = isPdf ? { level: 'neutral', lens: '' } : buildForensicLens(forensicsData);
  const pdfContext = isPdf ? buildPdfContext() : '';

  const wordCountNote = isPdf && (!text || text.trim().length < 100)
    ? 'Word count unavailable — assess document length visually from the PDF.'
    : `${text.split(/\s+/).length} words`;

  const prompt = `You are an experienced BTEC Level 3 Business assessor. Analyse this ad hoc submission for ORIGINALITY ONLY (no criteria assessment — no marking guide available).

CONTEXT:
- Student: ${studentName}, Unit ${unitNumber} (ad hoc submission)
- BTEC Level 3, 16-18 year olds, many bilingual learners, Gateway College Leicester
- Document length: ${wordCountNote}
${pdfContext}${forensicLens.lens}
Analyse for: humanizer detection, direct AI generation markers, authentic student indicators, copy-paste indicators. Provide specific evidence with quotes and counts.
${isPdf ? '\nREMINDER: This is a PDF submission. No document forensics are available. Your confidence level should reflect this limitation. Set confidence to "Low" or "Medium" unless content signals are very strong.\n' : ''}
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

${isPdf ? 'The student submission PDF is attached as a document above. Analyse it visually and textually.' : `Student submission (${text.split(/\\s+/).length} words):\n${text.substring(0, 25000)}`}`;

  const messages = buildApiMessages(prompt, fileType, pdfBase64, text);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 12000, messages }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  const responseText = data.content?.map(c => c.text || '').join('') || '';
  const cleaned = responseText.replace(/```json|```/g, '').trim();
  const result = JSON.parse(cleaned);
  result.resourcesUsed = [];
  result.forensicLensLevel = forensicLens.level;
  result.fileType = fileType;
  return result;
}

// ─── Main Entry Point ───────────────────────────────────────

export async function analyzeSubmission(text, studentName, assignmentId, adHocUnitNumber = null, uploaderName = null, studentCohortId = null, forensicsData = null, fileType = 'docx', pdfBase64 = null) {
  // Local analysis runs on extracted text (may be minimal for PDFs with failed extraction)
  const local = localAnalysis(text || '');
  const isAdHoc = !assignmentId;
  const isPdf = fileType === 'pdf';
  const assignment = assignmentId ? getAssignmentById(assignmentId) : null;

  // Calculate forensic score for storage — null for PDFs
  const forensicScore = (!isPdf && forensicsData) ? calculateForensicDivisor(forensicsData) : { divisor: 1.0, weights: [], total: 0 };

  // ─── Stage 3: Amplitude/Frequency Triage ──────────────────
  // Frequency = forensic signal (what TYPE of document is this?)
  // Amplitude = academic quality (how STRONG is the content?)
  // The combination determines the triage classification.
  //
  // Rules:
  // 1. FORENSIC FLOOR: If forensics show definitive evidence (placed/assembled
  //    with high-severity flags), the result CANNOT be Green regardless of text.
  // 2. HIGH FREQUENCY + HIGH AMPLITUDE: Placed document that meets criteria well
  //    = strongest concern (effective tool use). Red.
  // 3. HIGH FREQUENCY + LOW AMPLITUDE: Placed document that doesn't meet criteria
  //    = tool use but poor output. Amber (not Green — forensics are objective).
  // 4. LOW FREQUENCY + any amplitude: Organic document. Trust the text analysis.
  // 5. NO FORENSICS: Forensics unavailable. Flag as unverified, trust text only
  //    but note the limitation.
  // 6. PDF: Same as rule 5 — no forensics possible. Triage reason explains why.

  function stage3Triage(forensicsData, aiResult, originalityScore) {
    const forensicsAvailable = forensicsData && forensicsData.summary && forensicsData.summary.riskLevel !== 'unknown';
    const characterLevel = forensicsData?.character?.level || 'unknown';
    const organicismScore = forensicsData?.organicism?.score ?? null;
    const grade = aiResult?.holisticAssessment?.overallGrade || null;
    const aiOriginalityScore = aiResult?.originalityAssessment?.originalityScore ?? originalityScore;
    const hasDefinitiveForensics = ['placed', 'assembled'].includes(characterLevel);
    const hasHighForensics = hasDefinitiveForensics || (organicismScore !== null && organicismScore >= 80);
    
    // Check for definitive forensic flags (foreign charrsid, large paste blocks)
    const definitiveFlags = (forensicsData?.forensicFlags || []).filter(f => 
      f.type === 'foreign_charrsid' || 
      (f.type === 'rsid_paste_block' && f.severity === 'high') ||
      (f.type === 'washed_text' && f.severity === 'high')
    );
    const hasDefinitiveFlags = definitiveFlags.length > 0;

    // Grade quality mapping (amplitude)
    const isHighAmplitude = ['Distinction', 'Merit'].includes(grade);
    const isLowAmplitude = ['Referral'].includes(grade) || grade === null;

    let classification, flag, triageReason;

    if (isPdf) {
      // PDF-specific: no forensics possible, content analysis only
      if (aiOriginalityScore < 50) { classification = 'REVIEW (Red)'; flag = 'red'; }
      else if (aiOriginalityScore < 80) { classification = 'CHECK (Amber)'; flag = 'yellow'; }
      else { classification = 'ON TRACK (Green)'; flag = 'green'; }
      triageReason = 'PDF submission — document forensics not available for this file format. Triage based on content and visual analysis only. Confidence is reduced compared to .docx submissions where mechanical forensic analysis is possible.';
    }
    else if (!forensicsAvailable) {
      // No forensics — trust text analysis but note limitation
      if (aiOriginalityScore < 50) { classification = 'REVIEW (Red)'; flag = 'red'; }
      else if (aiOriginalityScore < 80) { classification = 'CHECK (Amber)'; flag = 'yellow'; }
      else { classification = 'ON TRACK (Green)'; flag = 'green'; }
      triageReason = 'Document forensics unavailable — triage based on text analysis only. Originality assessment is unverified.';
    }
    else if (hasDefinitiveFlags || (hasDefinitiveForensics && isHighAmplitude)) {
      classification = 'REVIEW (Red)';
      flag = 'red';
      if (hasDefinitiveFlags && isHighAmplitude) {
        triageReason = 'Definitive forensic evidence of non-original construction combined with strong academic output. Highest concern: effective use of external tools to produce work meeting assessment criteria.';
      } else if (hasDefinitiveFlags) {
        triageReason = 'Definitive forensic evidence of non-original document construction. Document cannot be cleared regardless of text analysis.';
      } else {
        triageReason = 'Document forensics indicate assembled/placed construction and the content meets criteria at Merit/Distinction level — consistent with effective tool use.';
      }
    }
    else if (hasHighForensics && !isHighAmplitude) {
      classification = 'CHECK (Amber)';
      flag = 'yellow';
      if (isLowAmplitude) {
        triageReason = 'Document forensics indicate non-original construction, but academic content does not meet criteria — suggesting either ineffective tool use or alternative explanation for forensic signals. Forensic evidence prevents clearance but concern is modulated by weak academic output.';
      } else {
        triageReason = 'Document forensics indicate non-original construction with Pass-level academic content. Warrants verification.';
      }
    }
    else if (!hasHighForensics && characterLevel === 'uniform') {
      if (aiOriginalityScore < 50) { classification = 'REVIEW (Red)'; flag = 'red'; }
      else if (aiOriginalityScore < 85) { classification = 'CHECK (Amber)'; flag = 'yellow'; }
      else { classification = 'ON TRACK (Green)'; flag = 'green'; }
      triageReason = 'Uniform formatting detected but no definitive forensic evidence. Triage primarily based on text analysis.';
    }
    else {
      if (aiOriginalityScore < 50) { classification = 'REVIEW (Red)'; flag = 'red'; }
      else if (aiOriginalityScore < 80) { classification = 'CHECK (Amber)'; flag = 'yellow'; }
      else { classification = 'ON TRACK (Green)'; flag = 'green'; }
      triageReason = 'Document forensics show no significant concerns. Triage based on text analysis.';
    }

    return { classification, flag, triageReason };
  }

  try {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('No API key');

    const ai = isAdHoc
      ? await aiAnalysisAdHoc(text, studentName, adHocUnitNumber, isPdf ? null : forensicsData, fileType, pdfBase64)
      : await aiAnalysis(text, studentName, assignmentId, uploaderName, studentCohortId, isPdf ? null : forensicsData, fileType, pdfBase64);

    const originalityScore = ai.originalityAssessment?.originalityScore ?? local.originalityScore;
    const gradeEstimate = ai.holisticAssessment?.overallGrade ?? null;
    
    // Stage 3: Amplitude/Frequency triage
    const triage = isAdHoc
      ? stage3Triage(isPdf ? null : forensicsData, null, originalityScore)
      : stage3Triage(isPdf ? null : forensicsData, ai, originalityScore);
    
    // Override Claude's triage classification with Stage 3 result
    const priorityFlag = triage.flag;
    ai.triageClassification = triage.classification;
    ai.triageReason = triage.triageReason;

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
      fileType,
    };

    const structuredReport = buildReport(reportMetadata, isPdf ? null : forensicsData, ai);

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
      triageReason: triage.triageReason,
      localAnalysis: local,
      report: structuredReport,
      documentForensics: structuredReport.forensics,
      wordCount: local.wordCount,
      status: 'complete',
      isAdHoc,
      fileType,
      reportVersion: 5,
    };
  } catch (err) {
    console.error('AI analysis failed, using local only:', err.message);

    const triage = stage3Triage(isPdf ? null : forensicsData, null, local.originalityScore);

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
      priorityFlag: triage.flag,
      triageReason: triage.triageReason,
      localAnalysis: local,
      documentForensics: null,
      wordCount: local.wordCount,
      status: 'complete',
      limitedAnalysis: true,
      isAdHoc,
      fileType,
      reportVersion: 1,
    };
  }
}

export { calculateGrade } from '../data/submissions';
