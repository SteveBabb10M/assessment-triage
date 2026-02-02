// Enhanced Analysis library - detailed reporting like the original Sahil analysis

const AI_INDICATORS = {
  highWeight: [
    { text: "all things considered", weight: 3, tool: "ChatGPT" },
    { text: "taking everything into consideration", weight: 3, tool: "ChatGPT" },
    { text: "delve into", weight: 3, tool: "ChatGPT" },
    { text: "navigate the complexities", weight: 3, tool: "ChatGPT" },
    { text: "foster a sense of", weight: 3, tool: "ChatGPT" },
    { text: "tapestry of", weight: 3, tool: "ChatGPT" },
    { text: "dynamic interplay", weight: 3, tool: "ChatGPT" },
    { text: "multifaceted approach", weight: 3, tool: "ChatGPT" },
    { text: "in today's rapidly evolving", weight: 3, tool: "ChatGPT" },
    { text: "it's worth noting that", weight: 3, tool: "ChatGPT" },
  ],
  mediumWeight: [
    { text: "it is important to note", weight: 2, tool: "ChatGPT" },
    { text: "multifaceted", weight: 2, tool: "ChatGPT" },
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
    { text: "synergy", weight: 2, tool: "Generic" },
    { text: "paradigm", weight: 2, tool: "ChatGPT" },
    { text: "in essence", weight: 2, tool: "ChatGPT" },
    { text: "plays a crucial role", weight: 2, tool: "ChatGPT" },
    { text: "ever-evolving", weight: 2, tool: "ChatGPT" },
    { text: "comprehensive approach", weight: 2, tool: "ChatGPT" },
    { text: "strategic alignment", weight: 2, tool: "ChatGPT" },
    { text: "stakeholder engagement", weight: 2, tool: "ChatGPT" },
  ],
  lowWeight: [
    { text: "leverage", weight: 1, tool: "Generic" },
    { text: "robust", weight: 1, tool: "Generic" },
    { text: "seamless", weight: 1, tool: "Generic" },
    { text: "cutting-edge", weight: 1, tool: "Generic" },
    { text: "notwithstanding", weight: 1, tool: "Generic" },
    { text: "in conclusion", weight: 1, tool: "Generic" },
    { text: "to summarize", weight: 1, tool: "Generic" },
    { text: "ultimately", weight: 1, tool: "Generic" },
  ]
};

// Get all indicators as flat array
function getAllIndicators() {
  return [
    ...AI_INDICATORS.highWeight,
    ...AI_INDICATORS.mediumWeight,
    ...AI_INDICATORS.lowWeight
  ];
}

// Find phrases with context (surrounding text)
function findPhrasesWithContext(text, phrase, contextChars = 60) {
  const results = [];
  const lowerText = text.toLowerCase();
  const lowerPhrase = phrase.toLowerCase();
  let startIndex = 0;
  
  while (true) {
    const index = lowerText.indexOf(lowerPhrase, startIndex);
    if (index === -1) break;
    
    const contextStart = Math.max(0, index - contextChars);
    const contextEnd = Math.min(text.length, index + phrase.length + contextChars);
    
    let context = text.slice(contextStart, contextEnd);
    if (contextStart > 0) context = '...' + context;
    if (contextEnd < text.length) context = context + '...';
    
    results.push({
      phrase: text.slice(index, index + phrase.length),
      context: context,
      position: index
    });
    
    startIndex = index + 1;
  }
  
  return results;
}

// Analyze vocabulary sophistication
function analyzeVocabulary(text) {
  const sophisticatedWords = [
    'compartmentalised', 'paradigm', 'synergy', 'dichotomy', 'juxtaposition',
    'proliferation', 'substantiate', 'corroborate', 'ameliorate', 'exacerbate',
    'unprecedented', 'methodology', 'encompassing', 'multifarious', 'quintessential',
    'contemporaneous', 'heterogeneous', 'homogeneous', 'ubiquitous', 'ephemeral'
  ];
  
  const found = [];
  const lowerText = text.toLowerCase();
  
  sophisticatedWords.forEach(word => {
    if (lowerText.includes(word)) {
      const contexts = findPhrasesWithContext(text, word, 40);
      if (contexts.length > 0) {
        found.push({
          word,
          count: contexts.length,
          contexts: contexts.slice(0, 2)
        });
      }
    }
  });
  
  const longWords = text.match(/\b\w{12,}\b/g) || [];
  const uniqueLongWords = [...new Set(longWords.map(w => w.toLowerCase()))];
  
  return {
    sophisticatedWords: found,
    longWordCount: longWords.length,
    uniqueLongWords: uniqueLongWords.slice(0, 10)
  };
}

// Analyze document structure
function analyzeStructure(text) {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 50);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  const paragraphLengths = paragraphs.map(p => p.length);
  const avgLength = paragraphLengths.reduce((a, b) => a + b, 0) / paragraphLengths.length || 0;
  
  let similarLengthCount = 0;
  paragraphLengths.forEach(len => {
    if (Math.abs(len - avgLength) < avgLength * 0.25) {
      similarLengthCount++;
    }
  });
  
  const uniformityScore = paragraphs.length > 2 
    ? (similarLengthCount / paragraphs.length * 100).toFixed(0)
    : 0;

  const formulaicPatterns = [];
  
  const starterWords = paragraphs.map(p => p.trim().split(/\s+/).slice(0, 3).join(' ').toLowerCase());
  const starterCounts = {};
  starterWords.forEach(s => {
    starterCounts[s] = (starterCounts[s] || 0) + 1;
  });
  
  Object.entries(starterCounts).forEach(([starter, count]) => {
    if (count >= 3) {
      formulaicPatterns.push({
        type: 'Repetitive paragraph starts',
        pattern: `"${starter}..." appears ${count} times`,
        concern: 'AI often uses repetitive structural patterns'
      });
    }
  });

  const sectionPattern = paragraphs.filter(p => 
    p.toLowerCase().includes('in conclusion') || 
    p.toLowerCase().includes('to summarize') ||
    p.toLowerCase().includes('overall,')
  ).length;
  
  if (sectionPattern >= 3) {
    formulaicPatterns.push({
      type: 'Repetitive conclusions',
      pattern: `${sectionPattern} sections end with summary phrases`,
      concern: 'Each section follows identical intro-analysis-conclusion pattern'
    });
  }

  return {
    paragraphCount: paragraphs.length,
    sentenceCount: sentences.length,
    avgParagraphLength: Math.round(avgLength),
    avgSentenceLength: Math.round(text.split(/\s+/).length / sentences.length),
    uniformityScore,
    formulaicPatterns
  };
}

// Check for copy-paste errors
function findCopyPasteErrors(text) {
  const errors = [];
  
  const suspiciousPatterns = [
    { pattern: /Qatar\s+Telecom/gi, type: 'Out of context reference' },
    { pattern: /\[.*?\]/g, type: 'Unreplaced placeholder' },
    { pattern: /INSERT\s+\w+\s+HERE/gi, type: 'Template marker' },
    { pattern: /Company\s+X|Business\s+Y/gi, type: 'Generic placeholder' },
  ];
  
  suspiciousPatterns.forEach(({ pattern, type }) => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const contexts = findPhrasesWithContext(text, match, 50);
        if (contexts.length > 0) {
          errors.push({
            type,
            found: match,
            context: contexts[0].context
          });
        }
      });
    }
  });
  
  return errors;
}

// Identify sections of the document
function identifySections(text) {
  const sections = [];
  const lines = text.split('\n');
  let currentSection = { title: 'Introduction', content: '', startLine: 0 };
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (
      (trimmed.length < 100 && trimmed.length > 3) &&
      (
        /^[A-Z][^.!?]*$/.test(trimmed) ||
        /^(?:P\d|M\d|D\d|Task|Section|Part|Learning\s+Aim)/i.test(trimmed) ||
        /^[\d.]+\s+[A-Z]/.test(trimmed)
      )
    ) {
      if (currentSection.content.trim()) {
        sections.push(currentSection);
      }
      currentSection = { title: trimmed, content: '', startLine: index };
    } else {
      currentSection.content += line + '\n';
    }
  });
  
  if (currentSection.content.trim()) {
    sections.push(currentSection);
  }
  
  return sections;
}

// Perform local analysis
export function performLocalAnalysis(text) {
  const allIndicators = getAllIndicators();
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  
  const foundPhrases = [];
  let totalWeight = 0;
  
  allIndicators.forEach(indicator => {
    const contexts = findPhrasesWithContext(text, indicator.text, 50);
    if (contexts.length > 0) {
      foundPhrases.push({
        ...indicator,
        count: contexts.length,
        contexts: contexts.slice(0, 3)
      });
      totalWeight += indicator.weight * contexts.length;
    }
  });
  
  foundPhrases.sort((a, b) => (b.weight * b.count) - (a.weight * a.count));
  
  const vocabulary = analyzeVocabulary(text);
  const structure = analyzeStructure(text);
  const copyPasteErrors = findCopyPasteErrors(text);
  const sections = identifySections(text);
  
  let originalityScore = 100;
  originalityScore -= totalWeight * 1.5;
  originalityScore -= vocabulary.sophisticatedWords.length * 3;
  originalityScore -= parseInt(structure.uniformityScore) * 0.15;
  originalityScore -= copyPasteErrors.length * 10;
  originalityScore = Math.max(0, Math.min(100, Math.round(originalityScore)));

  return {
    wordCount,
    foundPhrases,
    totalIndicatorWeight: totalWeight,
    vocabulary,
    structure,
    copyPasteErrors,
    sections,
    originalityScore
  };
}

// Full analysis using Claude API
export async function analyzeSubmission(text, assignment, studentContext) {
  const localAnalysis = performLocalAnalysis(text);
  
  const criteriaList = assignment?.criteria?.join(', ') || 'P1, P2, M1, D1';
  
  const systemPrompt = `You are an expert BTEC assessor analyzing student work. Provide a DETAILED analysis similar to how an experienced teacher would review work for academic integrity and assessment.

BTEC GRADING RULES (CRITICAL):
- All P criteria must be met for Pass
- All P + all M criteria must be met for Merit  
- All P + all M + all D criteria must be met for Distinction
- Missing ANY P criterion = Fail (regardless of M or D achievement)
- The grade is LIMITED by the lowest unmet criterion level

Assignment being assessed: ${assignment?.unitTitle || 'Business Unit'} - ${assignment?.name || 'Assignment'}
Criteria to assess: ${criteriaList}

Student context:
- Course: ${studentContext?.course || 'BTEC Level 3 Business'}
- Expected ability level: Mid-range (typical BTEC student)

Respond with JSON containing these DETAILED sections:

{
  "originalityScore": 0-100,
  "originalityVerdict": "High concern / Moderate concern / Minor concern / Appears authentic",
  "likelyAITool": "ChatGPT / Claude / Multiple tools / None detected",
  "confidenceLevel": "High / Medium / Low",
  
  "detailedOriginalityAnalysis": {
    "summary": "2-3 sentence overview",
    "keyEvidence": [
      {
        "type": "AI Signature Phrases / Vocabulary Mismatch / Structural Pattern / Copy-Paste Error / Inconsistency",
        "severity": "High / Medium / Low",
        "description": "Detailed explanation",
        "examples": ["specific quote 1", "specific quote 2"],
        "whyItMatters": "Why this is concerning for a BTEC Level 3 student"
      }
    ],
    "authenticElements": [
      {
        "type": "Personal voice / Local knowledge / Spelling error / Informal language",
        "description": "What was found",
        "example": "specific quote or reference"
      }
    ]
  },
  
  "sectionAnalysis": [
    {
      "sectionTitle": "Section name or P1/M1 etc",
      "originalityAssessment": "Likely AI / Mixed / Likely authentic",
      "concerns": ["specific concern 1"],
      "positives": ["specific positive 1"]
    }
  ],
  
  "criteriaAssessment": {
    "P1": {
      "status": "Met / Partially Met / Not Met",
      "evidence": "What the student wrote that demonstrates this",
      "gaps": "What's missing or weak",
      "quote": "A specific quote showing achievement or lack thereof"
    }
  },
  
  "gradeEstimate": "Fail / Pass / Merit / Distinction",
  "gradeJustification": "Explanation of why this grade, referencing specific criteria",
  
  "recommendations": [
    {
      "priority": "High / Medium / Low",
      "action": "What the teacher should do",
      "reason": "Why this matters"
    }
  ],
  
  "questionsForStudent": [
    {
      "question": "Specific question to ask",
      "purpose": "What this will reveal",
      "expectedResponse": "What a genuine student might say vs what might indicate AI use"
    }
  ],
  
  "summary": "Overall 3-4 sentence summary suitable for a quick report"
}`;

  const userPrompt = `Analyze this BTEC Level 3 Business student submission in detail.

PRELIMINARY LOCAL ANALYSIS (for reference):
- Word count: ${localAnalysis.wordCount}
- AI indicator phrases found: ${localAnalysis.foundPhrases.slice(0, 10).map(p => `"${p.text}" (×${p.count})`).join(', ') || 'None'}
- Sophisticated vocabulary: ${localAnalysis.vocabulary.sophisticatedWords.map(w => w.word).join(', ') || 'None flagged'}
- Structural uniformity: ${localAnalysis.structure.uniformityScore}%
- Copy-paste errors detected: ${localAnalysis.copyPasteErrors.length > 0 ? localAnalysis.copyPasteErrors.map(e => e.found).join(', ') : 'None'}
- Sections identified: ${localAnalysis.sections.length}

FULL SUBMISSION TEXT:
---
${text.slice(0, 15000)}
${text.length > 15000 ? '\n\n[Document truncated - full document is ' + localAnalysis.wordCount + ' words]' : ''}
---

Provide detailed analysis with specific quotes and evidence. Be thorough - this will be used to have a conversation with the student.

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
        max_tokens: 6000,
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
    
    let priorityFlag = 'yellow';
    if (localAnalysis.originalityScore < 80) {
      priorityFlag = 'red';
    } else if (localAnalysis.originalityScore >= 90) {
      priorityFlag = 'green';
    }
    
    return {
      originalityScore: localAnalysis.originalityScore,
      originalityVerdict: localAnalysis.originalityScore < 80 ? 'Moderate concern' : 'Requires review',
      likelyAITool: localAnalysis.foundPhrases.filter(p => p.tool === 'ChatGPT').length > 2 ? 'Possibly ChatGPT' : 'Unknown',
      confidenceLevel: 'Low',
      
      detailedOriginalityAnalysis: {
        summary: `Local analysis only (AI analysis unavailable). Found ${localAnalysis.foundPhrases.length} AI indicator phrases with total weight of ${localAnalysis.totalIndicatorWeight}. Manual review recommended.`,
        keyEvidence: localAnalysis.foundPhrases.slice(0, 5).map(p => ({
          type: 'AI Signature Phrases',
          severity: p.weight >= 3 ? 'High' : p.weight >= 2 ? 'Medium' : 'Low',
          description: `Phrase "${p.text}" found ${p.count} time(s)`,
          examples: p.contexts.map(c => c.context),
          whyItMatters: `This phrase is commonly associated with ${p.tool} output`
        })),
        authenticElements: []
      },
      
      sectionAnalysis: localAnalysis.sections.map(s => ({
        sectionTitle: s.title,
        originalityAssessment: 'Requires manual review',
        concerns: [],
        positives: []
      })),
      
      criteriaAssessment: {},
      
      gradeEstimate: 'Requires manual review',
      gradeJustification: 'AI analysis unavailable - manual assessment required',
      
      recommendations: [
        { priority: 'High', action: 'Manual review required', reason: 'Automated AI analysis was unavailable' },
        { priority: 'Medium', action: 'Discuss submission with student', reason: `${localAnalysis.foundPhrases.length} AI indicator phrases detected` }
      ],
      
      questionsForStudent: localAnalysis.foundPhrases.slice(0, 3).map(p => ({
        question: `Can you explain what you meant by "${p.text}"?`,
        purpose: 'Check if student understands their own writing',
        expectedResponse: 'A genuine student would be able to explain in their own words'
      })),
      
      summary: `Local analysis detected ${localAnalysis.foundPhrases.length} AI indicator phrases. Originality score: ${localAnalysis.originalityScore}%. Full AI analysis unavailable - manual review strongly recommended.`,
      
      priorityFlag,
      localAnalysis,
      wordCount: localAnalysis.wordCount,
      status: 'complete',
      limitedAnalysis: true
    };
  }
}
