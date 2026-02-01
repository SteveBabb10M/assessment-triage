// Analysis library - handles AI analysis via Claude API

const AI_INDICATORS = {
  phrases: [
    { text: "all things considered", weight: 3, tool: "ChatGPT" },
    { text: "taking everything into consideration", weight: 3, tool: "ChatGPT" },
    { text: "it's worth noting", weight: 2, tool: "ChatGPT" },
    { text: "it is important to note", weight: 2, tool: "ChatGPT" },
    { text: "in today's world", weight: 2, tool: "ChatGPT" },
    { text: "multifaceted", weight: 2, tool: "ChatGPT" },
    { text: "delve into", weight: 3, tool: "ChatGPT" },
    { text: "navigate the complexities", weight: 3, tool: "ChatGPT" },
    { text: "foster a sense of", weight: 3, tool: "ChatGPT" },
    { text: "tapestry of", weight: 3, tool: "ChatGPT" },
    { text: "a testament to", weight: 2, tool: "ChatGPT" },
    { text: "pivotal role", weight: 2, tool: "ChatGPT" },
    { text: "nuanced understanding", weight: 2, tool: "ChatGPT" },
    { text: "myriad of", weight: 2, tool: "ChatGPT" },
    { text: "paramount importance", weight: 2, tool: "ChatGPT" },
    { text: "in the realm of", weight: 2, tool: "ChatGPT" },
    { text: "holistic approach", weight: 2, tool: "Generic" },
    { text: "multi-channel strategy", weight: 2, tool: "ChatGPT" },
    { text: "mission-driven", weight: 2, tool: "ChatGPT" },
    { text: "despite these challenges", weight: 2, tool: "ChatGPT" },
    { text: "notwithstanding", weight: 1, tool: "Generic" },
    { text: "leverage", weight: 1, tool: "Generic" },
    { text: "robust", weight: 1, tool: "Generic" },
    { text: "seamless", weight: 1, tool: "Generic" },
    { text: "cutting-edge", weight: 1, tool: "Generic" },
    { text: "synergy", weight: 2, tool: "Generic" },
    { text: "paradigm", weight: 2, tool: "ChatGPT" },
    { text: "in essence", weight: 2, tool: "ChatGPT" },
    { text: "plays a crucial role", weight: 2, tool: "ChatGPT" },
    { text: "ever-evolving", weight: 2, tool: "ChatGPT" },
    { text: "dynamic interplay", weight: 3, tool: "ChatGPT" },
  ]
};

// Perform local analysis (pattern detection)
export function performLocalAnalysis(text) {
  const lowerText = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;
  
  // Find AI indicator phrases
  const foundPhrases = [];
  let totalWeight = 0;
  
  AI_INDICATORS.phrases.forEach(indicator => {
    const regex = new RegExp(indicator.text, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      foundPhrases.push({
        ...indicator,
        count: matches.length
      });
      totalWeight += indicator.weight * matches.length;
    }
  });

  // Calculate vocabulary sophistication
  const complexWords = text.match(/\b\w{10,}\b/g) || [];
  const complexWordRatio = wordCount > 0 ? complexWords.length / wordCount : 0;

  // Check for structural uniformity
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 50);
  let structuralUniformity = 0;
  if (paragraphs.length > 3) {
    const similarLengths = paragraphs.slice(0, -1).filter((p, i) => {
      const nextP = paragraphs[i + 1];
      const pLength = p.length;
      const nextLength = nextP?.length || 0;
      return Math.abs(pLength - nextLength) < pLength * 0.3;
    });
    structuralUniformity = similarLengths.length / (paragraphs.length - 1);
  }

  // Calculate originality score (inverse of AI likelihood)
  // Base score starts at 100, reduced by AI indicators
  let originalityScore = 100;
  originalityScore -= totalWeight * 2; // Each weight point reduces by 2%
  originalityScore -= structuralUniformity * 10; // High uniformity reduces score
  originalityScore = Math.max(0, Math.min(100, Math.round(originalityScore)));

  return {
    wordCount,
    sentenceCount: sentences.length,
    avgSentenceLength: avgSentenceLength.toFixed(1),
    foundPhrases: foundPhrases.sort((a, b) => b.weight - a.weight),
    totalIndicatorWeight: totalWeight,
    complexWordRatio: (complexWordRatio * 100).toFixed(1),
    structuralUniformity: (structuralUniformity * 100).toFixed(0),
    paragraphCount: paragraphs.length,
    originalityScore
  };
}

// Full analysis using Claude API
export async function analyzeSubmission(text, assignment, studentContext) {
  const localAnalysis = performLocalAnalysis(text);
  
  const criteriaList = assignment?.criteria?.join(', ') || 'P1, P2, M1, D1';
  
  const systemPrompt = `You are an expert BTEC assessor analyzing student work for:
1. Originality concerns (potential AI-generated content)
2. Achievement of BTEC criteria

BTEC GRADING RULES:
- All P criteria must be met for Pass
- All P + all M criteria must be met for Merit  
- All P + all M + all D criteria must be met for Distinction
- Missing ANY P criterion = Fail
- The grade is limited by the lowest unmet criterion level

Assignment criteria to assess: ${criteriaList}

Respond with JSON only:
{
  "originalityScore": 0-100,
  "likelyAITool": "ChatGPT/Claude/None detected",
  "gradeEstimate": "Fail/Pass/Merit/Distinction",
  "criteriaResults": {
    "P1": "met/partial/not_met",
    "P2": "met/partial/not_met"
  },
  "flags": [
    {"type": "ai_content/vocabulary/structure/incomplete", "severity": "high/medium/low", "message": "description"}
  ],
  "authenticElements": ["element 1"],
  "summary": "2-3 sentence summary",
  "recommendations": ["recommendation 1"],
  "questionsForStudent": ["question 1"]
}`;

  const userPrompt = `Analyze this BTEC Level 3 Business student submission.

STUDENT CONTEXT:
- Course: ${studentContext?.course || 'Foundation Diploma'}
- Expected ability: Mid-range
- Assignment: ${assignment?.name || 'Assignment'}
- Unit: ${assignment?.unitTitle || 'Business'}

PRELIMINARY ANALYSIS:
- Word count: ${localAnalysis.wordCount}
- AI indicator phrases found: ${localAnalysis.foundPhrases.map(p => `"${p.text}" (×${p.count})`).join(', ') || 'None'}
- Structural uniformity: ${localAnalysis.structuralUniformity}%

SUBMISSION TEXT:
---
${text.slice(0, 12000)}
${text.length > 12000 ? '\n[Truncated - full document is ' + localAnalysis.wordCount + ' words]' : ''}
---

Respond with JSON only.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.content?.[0]?.text) {
      let jsonText = data.content[0].text;
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const analysis = JSON.parse(jsonText);
      
      // Determine priority flag
      let priorityFlag = 'green';
      if (analysis.originalityScore < 80 || analysis.gradeEstimate === 'Fail') {
        priorityFlag = 'red';
      } else if (analysis.originalityScore < 90 || analysis.gradeEstimate === 'Pass') {
        priorityFlag = 'yellow';
      }
      
      return {
        ...analysis,
        priorityFlag,
        localAnalysis,
        wordCount: localAnalysis.wordCount,
        status: 'complete'
      };
    }
    
    throw new Error('Unexpected response format');
    
  } catch (error) {
    console.error('Analysis error:', error);
    
    // Fallback to local analysis only
    let priorityFlag = 'yellow';
    if (localAnalysis.originalityScore < 80) {
      priorityFlag = 'red';
    } else if (localAnalysis.originalityScore >= 90) {
      priorityFlag = 'green';
    }
    
    return {
      originalityScore: localAnalysis.originalityScore,
      likelyAITool: localAnalysis.foundPhrases.filter(p => p.tool === 'ChatGPT').length > 2 ? 'Possibly ChatGPT' : 'Unknown',
      gradeEstimate: 'Requires manual review',
      criteriaResults: {},
      flags: localAnalysis.foundPhrases.slice(0, 5).map(p => ({
        type: 'ai_phrases',
        severity: p.weight >= 3 ? 'high' : p.weight >= 2 ? 'medium' : 'low',
        message: `AI indicator phrase "${p.text}" found ${p.count} time(s)`
      })),
      authenticElements: [],
      summary: `Local analysis only (AI analysis unavailable). Originality score: ${localAnalysis.originalityScore}%. Manual review recommended.`,
      recommendations: ['Manual review required', 'Discuss submission with student'],
      questionsForStudent: [],
      priorityFlag,
      localAnalysis,
      wordCount: localAnalysis.wordCount,
      status: 'complete',
      limitedAnalysis: true
    };
  }
}

// Calculate grade from criteria results
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
