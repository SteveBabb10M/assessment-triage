// AI Analysis Engine
// Uses Claude API for detailed submission analysis with local fallback

import { getAssignmentById } from '../data/units';

// AI indicator phrases commonly found in AI-generated text
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
];

// Local analysis — runs without API
function localAnalysis(text) {
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.length > 0 ? Math.round(wordCount / sentences.length) : 0;

  // Check for AI phrases
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

  // Vocabulary complexity
  const complexWords = words.filter(w => w.length > 10).length;
  const complexRatio = wordCount > 0 ? complexWords / wordCount : 0;

  // Paragraph uniformity
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const paraLengths = paragraphs.map(p => p.split(/\s+/).length);
  const avgParaLength = paraLengths.length > 0 ? paraLengths.reduce((a, b) => a + b, 0) / paraLengths.length : 0;
  const paraVariance = paraLengths.length > 1
    ? Math.sqrt(paraLengths.reduce((sum, l) => sum + Math.pow(l - avgParaLength, 2), 0) / paraLengths.length)
    : 0;
  const uniformityScore = avgParaLength > 0 ? Math.min(1, paraVariance / avgParaLength) : 0;

  // Calculate originality score
  let score = 100;
  score -= Math.min(30, totalWeight * 2);
  score -= Math.min(15, complexRatio * 150);
  if (uniformityScore < 0.2 && paragraphs.length > 3) score -= 10;
  if (avgSentenceLength > 25) score -= 5;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    wordCount,
    sentenceCount: sentences.length,
    avgSentenceLength,
    paragraphCount: paragraphs.length,
    complexWordRatio: Math.round(complexRatio * 100),
    foundPhrases,
    totalWeight,
    uniformityScore: Math.round(uniformityScore * 100),
    originalityScore: score,
  };
}

// Full AI analysis using Claude API
async function aiAnalysis(text, studentName, assignmentId) {
  const assignment = getAssignmentById(assignmentId);
  if (!assignment) throw new Error('Assignment not found');

  const criteriaList = assignment.criteria.join(', ');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `You are an assessment triage tool for BTEC Level 3 Business educators. Analyse this student submission for:
1. Originality concerns (AI-generated content, copy-paste errors, vocabulary mismatches)
2. Criteria achievement against: ${criteriaList}

This is for Unit ${assignment.unitNumber}: ${assignment.unitTitle}, ${assignment.name}.
The student is ${studentName}, studying at BTEC Level 3.

IMPORTANT: BTEC Level 3 students are 16-18 year olds. Many are bilingual learners. Expected vocabulary should be appropriate for this level. Sophisticated academic language may indicate AI assistance.

Respond ONLY in JSON format with no preamble:
{
  "originalityScore": <0-100>,
  "originalityVerdict": "<Appears authentic|Some concerns|High concern>",
  "likelyAITool": "<null|ChatGPT|Gemini|Copilot|Unknown>",
  "confidenceLevel": "<Low|Medium|High>",
  "gradeEstimate": "<Fail|Pass|Merit|Distinction>",
  "criteriaResults": { "<criterion>": "<met|partial|not_met>", ... },
  "flags": [{ "type": "<ai_content|copy_paste|vocabulary|structure|incomplete|word_count>", "severity": "<high|medium|low>", "message": "<description>" }],
  "authenticElements": ["<evidence of authentic student work>"],
  "summary": "<2-3 sentence overall summary>",
  "recommendations": ["<action for teacher>"],
  "questionsForStudent": ["<suggested viva question>"]
}

Student submission:
${text.substring(0, 15000)}`,
      }],
    }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  const responseText = data.content?.map(c => c.text || '').join('') || '';
  const cleaned = responseText.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

// Main analysis function
export async function analyzeSubmission(text, studentName, assignmentId) {
  const local = localAnalysis(text);

  // Determine priority flag from local analysis
  function getPriorityFlag(score, grade) {
    if (score < 80 || grade === 'Fail') return 'red';
    if (score < 90 || grade === 'Pass') return 'yellow';
    return 'green';
  }

  try {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('No API key');

    const ai = await aiAnalysis(text, studentName, assignmentId);
    const priorityFlag = getPriorityFlag(ai.originalityScore, ai.gradeEstimate);

    return {
      ...ai,
      priorityFlag,
      localAnalysis: local,
      wordCount: local.wordCount,
      status: 'complete',
    };
  } catch (err) {
    console.error('AI analysis failed, using local only:', err.message);

    const priorityFlag = getPriorityFlag(local.originalityScore, 'Unknown');
    return {
      originalityScore: local.originalityScore,
      originalityVerdict: local.originalityScore >= 90 ? 'Appears authentic' : local.originalityScore >= 80 ? 'Some concerns' : 'High concern',
      likelyAITool: local.totalWeight >= 10 ? 'Possibly ChatGPT' : null,
      confidenceLevel: 'Low',
      gradeEstimate: 'Requires manual review',
      criteriaResults: {},
      flags: local.foundPhrases.slice(0, 5).map(p => ({
        type: 'ai_phrases',
        severity: p.weight >= 3 ? 'high' : p.weight >= 2 ? 'medium' : 'low',
        message: `AI indicator phrase "${p.text}" found ${p.count} time(s)`,
      })),
      authenticElements: [],
      summary: `Local analysis only (AI unavailable). Originality score: ${local.originalityScore}%. Manual review recommended.`,
      recommendations: ['Manual review required', 'Discuss submission with student'],
      questionsForStudent: [],
      priorityFlag,
      localAnalysis: local,
      wordCount: local.wordCount,
      status: 'complete',
      limitedAnalysis: true,
    };
  }
}

export { calculateGrade } from '../data/submissions';
