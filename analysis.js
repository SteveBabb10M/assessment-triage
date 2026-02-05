// AI Analysis Engine
// Sends student submission text to Claude for analysis against BTEC criteria

import { units } from '../data/units.js';
import { classifyRAG, calculateBTECGrade } from '../data/submissions.js';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export async function analyzeSubmission({ text, assignmentId, studentName }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  // Find the assignment and its criteria
  let assignment = null;
  let unit = null;
  for (const u of Object.values(units)) {
    if (u.assignments && u.assignments[assignmentId]) {
      assignment = u.assignments[assignmentId];
      unit = u;
      break;
    }
  }

  if (!assignment) {
    throw new Error(`Assignment ${assignmentId} not found`);
  }

  const criteria = assignment.criteria;
  const criteriaText = Object.entries(criteria)
    .map(([id, c]) => {
      const lookFor = c.lookFor
        ? '\n    Look for: ' + c.lookFor.join('; ')
        : '';
      return `  ${id} (${c.grade}): ${c.text}${lookFor}`;
    })
    .join('\n');

  const systemPrompt = `You are an experienced BTEC Business Studies assessor and internal verifier. You are analysing a student submission for Unit ${unit.number}: ${unit.title}.

Your role is to:
1. Assess the submission against the specific BTEC criteria
2. Identify potential originality concerns (AI-generated content, copy-paste from sources, vocabulary mismatches for a Level 3 student)
3. Provide an honest, detailed assessment that helps the teacher prioritise their marking

IMPORTANT CONTEXT:
- This is a BTEC Level 3 Extended Diploma programme
- Students are typically 17-18 year olds, many are bilingual learners
- BTEC grading is sequential: must achieve ALL Pass criteria before Merit criteria count, ALL Merit before Distinction
- The command word matters: 'Explain' requires reasons/causes, 'Analyse' requires breakdown of factors, 'Evaluate' requires balanced judgements with conclusions

Assignment: ${assignment.title}
Learning Aim: ${assignment.learningAim}
Scenario: ${assignment.scenario || 'N/A'}

Assessment Criteria:
${criteriaText}`;

  const userPrompt = `Please analyse this student submission from ${studentName}.

SUBMISSION TEXT:
---
${text}
---

Provide your analysis in the following JSON structure ONLY (no other text):
{
  "originalityScore": <number 0-100>,
  "originalityFlags": [
    {
      "type": "<ai_generated|copy_paste|vocabulary_mismatch|structural_concern|reference_issue>",
      "severity": "<high|medium|low>",
      "description": "<specific description of the concern>",
      "evidence": "<quote or reference from the text>"
    }
  ],
  "criteriaAssessment": {
    "<criterion_id>": {
      "met": <true|false>,
      "confidence": "<high|medium|low>",
      "evidence": "<what in the submission supports this judgement>",
      "gaps": "<what is missing or insufficient>",
      "feedback": "<specific feedback for the student>"
    }
  },
  "estimatedGrade": "<Distinction|Merit|Pass|Fail>",
  "wordCount": <approximate word count>,
  "overallSummary": "<2-3 sentence summary of the submission quality>",
  "keyStrengths": ["<strength 1>", "<strength 2>"],
  "keyWeaknesses": ["<weakness 1>", "<weakness 2>"],
  "technicalDetails": {
    "readabilityLevel": "<appropriate|above_level|below_level>",
    "academicTone": "<appropriate|too_informal|too_formal_for_level>",
    "structureQuality": "<well_structured|adequate|poor>",
    "evidenceOfResearch": "<strong|adequate|weak|none>",
    "commandWordsAddressed": "<all|most|some|few>"
  }
}`;

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const responseText = data.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');

    // Parse the JSON response
    const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(cleanJson);

    // Calculate BTEC grade using sequential rules
    const criteriaResults = {};
    Object.entries(analysis.criteriaAssessment).forEach(([id, assessment]) => {
      criteriaResults[id] = assessment.met;
    });
    const calculatedGrade = calculateBTECGrade(criteriaResults);

    // Override if Claude's estimate differs from sequential calculation
    analysis.estimatedGrade = calculatedGrade;

    // Calculate RAG
    const rag = classifyRAG(analysis.originalityScore, analysis.estimatedGrade);

    return {
      ...analysis,
      rag,
      assignmentId,
      unitId: unit.id,
      unitNumber: unit.number,
      unitTitle: unit.title,
      assignmentTitle: assignment.title,
      criteria: criteria, // Include criteria definitions for the report
      analysedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
}

// Extract text from a .docx file (base64 encoded)
export async function extractTextFromDocx(base64Content) {
  // In production, use mammoth.js or similar
  // For now, basic extraction
  const buffer = Buffer.from(base64Content, 'base64');

  try {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Text extraction failed:', error);
    throw new Error('Could not extract text from document. Ensure it is a valid .docx file.');
  }
}
