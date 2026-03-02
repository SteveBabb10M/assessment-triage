// Document Forensics Module — v1
// Extracts formatting metadata from .docx files to detect copy-paste patterns
// Analyses: font origins, bold/normal inconsistencies, font transitions, spelling conventions
//
// Key insight: students who paste from ChatGPT/Gemini/Claude inherit the AI platform's
// default fonts (Segoe UI for ChatGPT, etc.) which differ from Word's defaults (Aptos/Calibri).
// This creates a forensic fingerprint that text-only analysis completely misses.

import JSZip from 'jszip';

// ─── Known AI Platform Font Signatures ──────────────────────
const AI_FONT_SIGNATURES = {
  'Segoe UI':       { platform: 'ChatGPT (web)', confidence: 'high', notes: 'Default rendering font for ChatGPT web interface' },
  'Söhne':          { platform: 'ChatGPT (web)', confidence: 'high', notes: 'OpenAI custom font, very strong indicator' },
  'Google Sans':    { platform: 'Google Gemini', confidence: 'high', notes: 'Google product font family' },
  'Roboto':         { platform: 'Google Gemini / Android', confidence: 'medium', notes: 'Google ecosystem default; could also be Android clipboard' },
  'Arial':          { platform: 'Multiple / Generic', confidence: 'low', notes: 'Common web font; weak signal alone but relevant with other markers' },
  'Helvetica Neue': { platform: 'Apple / Claude (web)', confidence: 'medium', notes: 'macOS/iOS default; also used by some AI interfaces on Mac' },
  'SF Pro':         { platform: 'Apple ecosystem', confidence: 'medium', notes: 'iOS/macOS system font — indicates paste from Safari-based AI' },
  'Consolas':       { platform: 'Code editor / AI code block', confidence: 'medium', notes: 'Monospace — may indicate pasted code blocks' },
  'Courier New':    { platform: 'Code editor / AI code block', confidence: 'medium', notes: 'Monospace — may indicate pasted code blocks' },
};

// Word default fonts across versions
const WORD_DEFAULT_FONTS = ['Aptos', 'Calibri', 'Times New Roman', 'Cambria'];

// ─── OOXML Namespace Helpers ────────────────────────────────

const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

function getElements(parent, tagName) {
  // getElementsByTagNameNS for the w: namespace
  return Array.from(parent.getElementsByTagNameNS(W_NS, tagName));
}

function getAttr(el, attrName) {
  // w:val attribute
  return el?.getAttributeNS(W_NS, attrName) || el?.getAttribute(`w:${attrName}`) || null;
}

// ─── Core Parser ────────────────────────────────────────────

export async function extractDocForensics(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const documentXml = await zip.file('word/document.xml')?.async('string');
  
  if (!documentXml) {
    return { error: 'Could not read document.xml from .docx', sections: [], summary: null };
  }

  // Also try to read styles.xml for default font info
  const stylesXml = await zip.file('word/styles.xml')?.async('string');
  
  const { DOMParser } = await import('xmldom');
  const parser = new DOMParser();
  const doc = parser.parseFromString(documentXml, 'text/xml');
  
  // Get document default font from styles
  let documentDefaultFont = null;
  if (stylesXml) {
    const stylesDoc = parser.parseFromString(stylesXml, 'text/xml');
    const docDefaults = getElements(stylesDoc, 'rPrDefault')[0];
    if (docDefaults) {
      const rFonts = getElements(docDefaults, 'rFonts')[0];
      if (rFonts) {
        documentDefaultFont = getAttr(rFonts, 'ascii') || getAttr(rFonts, 'hAnsi') || getAttr(rFonts, 'cs');
      }
    }
  }

  // Parse all paragraphs with their runs
  const paragraphs = getElements(doc, 'p');
  const sections = [];
  
  for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
    const para = paragraphs[pIdx];
    const runs = getElements(para, 'r');
    
    if (runs.length === 0) continue;
    
    const runDetails = [];
    let paraText = '';
    let paraBoldChars = 0;
    let paraNormalChars = 0;
    const paraFonts = new Map(); // font -> character count
    let paraNoProofCount = 0;
    let paraLangTags = new Map(); // lang -> count
    
    // Get paragraph-level rsid (creation revision ID)
    const paraRsid = para.getAttributeNS(W_NS, 'rsidR') || para.getAttribute('w:rsidR') || null;
    
    for (const run of runs) {
      // Get text content
      const textEls = getElements(run, 't');
      const text = textEls.map(t => t.textContent || '').join('');
      if (!text) continue;
      
      paraText += text;
      
      // Get run properties
      const rPr = getElements(run, 'rPr')[0];
      
      // Font detection
      let fontName = null;
      if (rPr) {
        const rFonts = getElements(rPr, 'rFonts')[0];
        if (rFonts) {
          fontName = getAttr(rFonts, 'ascii') || getAttr(rFonts, 'hAnsi') || getAttr(rFonts, 'cs');
        }
        
        // noProof detection (spell check suppressed — common in pasted content)
        const noProofEl = getElements(rPr, 'noProof')[0];
        if (noProofEl) paraNoProofCount++;
        
        // Language tag detection
        const langEl = getElements(rPr, 'lang')[0];
        if (langEl) {
          const langVal = getAttr(langEl, 'val');
          if (langVal) paraLangTags.set(langVal, (paraLangTags.get(langVal) || 0) + 1);
        }
      }
      const effectiveFont = fontName || documentDefaultFont || 'Unknown';
      
      // Bold detection
      let isBold = false;
      if (rPr) {
        const boldEl = getElements(rPr, 'b')[0];
        if (boldEl) {
          const boldVal = getAttr(boldEl, 'val');
          // <w:b/> means bold; <w:b w:val="0"/> means not bold
          isBold = boldVal !== '0' && boldVal !== 'false';
        }
      }
      
      // Font size
      let fontSize = null;
      if (rPr) {
        const szEl = getElements(rPr, 'sz')[0];
        if (szEl) {
          fontSize = parseInt(getAttr(szEl, 'val') || '0') / 2; // OOXML stores half-points
        }
      }
      
      // Track stats
      const charCount = text.length;
      if (isBold) paraBoldChars += charCount;
      else paraNormalChars += charCount;
      
      paraFonts.set(effectiveFont, (paraFonts.get(effectiveFont) || 0) + charCount);
      
      runDetails.push({ text, font: effectiveFont, bold: isBold, fontSize });
    }
    
    if (!paraText.trim()) continue;
    
    sections.push({
      index: pIdx,
      text: paraText.trim(),
      charCount: paraText.length,
      boldChars: paraBoldChars,
      normalChars: paraNormalChars,
      boldPercentage: paraText.length > 0 ? Math.round((paraBoldChars / paraText.length) * 100) : 0,
      fonts: Object.fromEntries(paraFonts),
      dominantFont: [...paraFonts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown',
      isHeading: paraText.length < 80 && paraBoldChars > paraNormalChars,
      rsid: paraRsid,
      noProofCount: paraNoProofCount,
      langTags: Object.fromEntries(paraLangTags),
      runCount: runDetails.length,
      avgCharsPerRun: runDetails.length > 0 ? Math.round(paraText.length / runDetails.length) : 0,
      runs: runDetails,
    });
  }

  // ─── Build Forensic Analysis ──────────────────────────────

  return buildForensicReport(sections, documentDefaultFont, zip);
}

// ─── Report Builder ─────────────────────────────────────────

async function buildForensicReport(sections, documentDefaultFont, zip) {
  const bodySections = sections.filter(s => !s.isHeading && s.charCount > 40);
  
  if (bodySections.length === 0) {
    return {
      documentDefaultFont,
      sections,
      summary: { riskLevel: 'unknown', message: 'Insufficient body text for forensic analysis' },
      fontProfile: {},
      boldPattern: {},
      transitions: [],
      spellingConvention: null,
      forensicFlags: [],
    };
  }

  // ── Font Profile ──
  const globalFontMap = new Map();
  for (const section of bodySections) {
    for (const [font, chars] of Object.entries(section.fonts)) {
      globalFontMap.set(font, (globalFontMap.get(font) || 0) + chars);
    }
  }
  
  const totalChars = [...globalFontMap.values()].reduce((a, b) => a + b, 0);
  const fontProfile = {};
  for (const [font, chars] of globalFontMap.entries()) {
    const percentage = Math.round((chars / totalChars) * 100);
    const isWordDefault = WORD_DEFAULT_FONTS.includes(font);
    const aiSignature = AI_FONT_SIGNATURES[font] || null;
    fontProfile[font] = { characters: chars, percentage, isWordDefault, aiSignature };
  }

  // ── Font Transitions (section-to-section font changes) ──
  const transitions = [];
  for (let i = 1; i < sections.length; i++) {
    const prev = sections[i - 1];
    const curr = sections[i];
    if (prev.dominantFont !== curr.dominantFont && curr.charCount > 20) {
      transitions.push({
        fromParagraph: prev.index,
        toParagraph: curr.index,
        fromFont: prev.dominantFont,
        toFont: curr.dominantFont,
        fromText: prev.text.substring(0, 60) + (prev.text.length > 60 ? '...' : ''),
        toText: curr.text.substring(0, 60) + (curr.text.length > 60 ? '...' : ''),
        significance: categoriseTransition(prev.dominantFont, curr.dominantFont),
      });
    }
  }

  // ── Bold Pattern Analysis ──
  const boldSections = bodySections.filter(s => s.boldPercentage > 80);
  const normalSections = bodySections.filter(s => s.boldPercentage < 20);
  const mixedSections = bodySections.filter(s => s.boldPercentage >= 20 && s.boldPercentage <= 80);
  
  // Detect bold/normal toggle pattern (indicates separate paste operations)
  const togglePattern = detectBoldToggles(bodySections);
  
  const boldPattern = {
    boldBodySections: boldSections.length,
    normalBodySections: normalSections.length,
    mixedBodySections: mixedSections.length,
    totalBodySections: bodySections.length,
    toggleCount: togglePattern.toggleCount,
    toggleDetails: togglePattern.details,
    isConsistent: boldSections.length === 0 || normalSections.length === 0,
    concern: !( boldSections.length === 0 || normalSections.length === 0 )
      ? 'Body text alternates between bold and normal — consistent with multiple paste operations from different sources'
      : null,
  };

  // ── Spelling Convention Detection ──
  const allText = sections.map(s => s.text).join(' ');
  const spellingConvention = detectSpellingConvention(allText);

  // ── Rsid (Revision Save ID) Paste Block Detection ──
  // Each editing session in Word gets a unique rsid. When content is pasted,
  // all pasted paragraphs share the same rsid. Large consecutive blocks of
  // the same rsid indicate a single paste operation.
  const rsidAnalysis = analyseRsidBlocks(sections);

  // ── Run Fragmentation Analysis ──
  // When text is pasted from web sources (including AI), it often carries
  // per-word or per-phrase formatting, creating many small runs.
  // Typed text produces fewer, longer runs.
  const runFragmentation = analyseRunFragmentation(bodySections);

  // ── noProof / Language Tag Analysis ──
  // noProof markers suppress spell checking — common when content is pasted
  // with explicit language tagging from external sources.
  const proofingAnalysis = analyseProofingMarkers(bodySections);

  // ── Theme Font Check ──
  // Check if AI platform fonts appear in the document theme (unusual for student docs)
  const themeFontConcern = await checkThemeFonts(zip);

  // ── Compile Forensic Flags ──
  const forensicFlags = [];
  
  // Flag 1: Non-Word fonts detected
  const nonWordFonts = Object.entries(fontProfile).filter(([font, info]) => !info.isWordDefault && info.percentage > 5);
  for (const [font, info] of nonWordFonts) {
    const sig = info.aiSignature;
    if (sig) {
      forensicFlags.push({
        type: 'ai_platform_font',
        severity: sig.confidence === 'high' ? 'high' : 'medium',
        flag: `AI platform font detected: ${font}`,
        detail: `${font} (${info.percentage}% of body text) — ${sig.notes}. Likely source: ${sig.platform}.`,
        evidence: `${info.characters} characters in ${font}, covering ${info.percentage}% of body text`,
      });
    } else if (info.percentage > 10) {
      forensicFlags.push({
        type: 'unexpected_font',
        severity: 'low',
        flag: `Non-standard font: ${font}`,
        detail: `${font} found in ${info.percentage}% of text. Not a known AI signature but not a Word default either.`,
        evidence: `${info.characters} characters`,
      });
    }
  }

  // Flag 2: Multiple font sources
  const significantFonts = Object.entries(fontProfile).filter(([_, info]) => info.percentage > 10);
  if (significantFonts.length > 1) {
    forensicFlags.push({
      type: 'multiple_font_sources',
      severity: significantFonts.length > 2 ? 'high' : 'medium',
      flag: `${significantFonts.length} distinct font sources detected`,
      detail: `Document uses ${significantFonts.map(([f, i]) => `${f} (${i.percentage}%)`).join(', ')}. Multiple fonts indicate content assembled from different environments.`,
      evidence: `${significantFonts.length} fonts each covering >10% of text`,
    });
  }

  // Flag 3: Font transitions
  const highSigTransitions = transitions.filter(t => t.significance === 'high');
  if (highSigTransitions.length > 0) {
    forensicFlags.push({
      type: 'font_transitions',
      severity: 'high',
      flag: `${highSigTransitions.length} significant font transition(s) detected`,
      detail: highSigTransitions.map(t => 
        `Font changes from ${t.fromFont} to ${t.toFont} at paragraph ${t.toParagraph}: "${t.toText}"`
      ).join('; '),
      evidence: `${transitions.length} total transitions, ${highSigTransitions.length} high-significance`,
    });
  }

  // Flag 4: Bold/normal inconsistency
  if (boldPattern.concern) {
    forensicFlags.push({
      type: 'bold_inconsistency',
      severity: boldPattern.toggleCount >= 3 ? 'high' : 'medium',
      flag: `Bold/normal toggle pattern: ${boldPattern.toggleCount} switches in body text`,
      detail: boldPattern.concern + `. ${boldPattern.boldBodySections} bold sections, ${boldPattern.normalBodySections} normal sections.`,
      evidence: boldPattern.toggleDetails.join('; '),
    });
  }

  // Flag 5: American English in UK context
  if (spellingConvention && spellingConvention.dominant === 'American' && spellingConvention.americanCount > 0) {
    forensicFlags.push({
      type: 'spelling_convention',
      severity: spellingConvention.americanCount >= 3 ? 'medium' : 'low',
      flag: 'American English spellings detected (UK institution)',
      detail: `Found ${spellingConvention.americanCount} American spelling(s): ${spellingConvention.americanExamples.join(', ')}. ChatGPT defaults to American English. Gateway College students would typically use British English.`,
      evidence: spellingConvention.americanExamples.join(', '),
    });
  }

  // Flag 6: Rsid paste blocks — large blocks of consecutive paragraphs sharing the same rsid
  if (rsidAnalysis.largestBlock >= 4) {
    forensicFlags.push({
      type: 'rsid_paste_block',
      severity: rsidAnalysis.largestBlock >= 6 ? 'high' : 'medium',
      flag: `Large paste block detected: ${rsidAnalysis.largestBlock} consecutive paragraphs share same revision ID`,
      detail: `${rsidAnalysis.largestBlock} paragraphs were created in a single operation (rsid ${rsidAnalysis.largestBlockRsid}), consistent with pasting a large block of AI-generated content. ` +
        `Document has ${rsidAnalysis.totalContentParas} content paragraphs across ${rsidAnalysis.uniqueRsids} editing sessions.`,
      evidence: rsidAnalysis.blockDetails.filter(b => b.size >= 3).map(b => 
        `Block of ${b.size}: "${b.preview}"`
      ).join('; '),
    });
  }

  // Flag 7: Run fragmentation — very low chars/run indicates web-pasted content
  if (runFragmentation.concern) {
    forensicFlags.push({
      type: 'run_fragmentation',
      severity: runFragmentation.avgCharsPerRun < 10 ? 'medium' : 'low',
      flag: `High run fragmentation: avg ${runFragmentation.avgCharsPerRun} chars/run`,
      detail: runFragmentation.concern,
      evidence: `${runFragmentation.totalRuns} runs across ${runFragmentation.totalParas} body paragraphs (${runFragmentation.totalChars} total chars)`,
    });
  }

  // Flag 8: noProof markers clustering with AI fonts
  if (proofingAnalysis.concern) {
    forensicFlags.push({
      type: 'proofing_suppressed',
      severity: 'low',
      flag: `Spell-check suppression detected: ${proofingAnalysis.totalNoProof} noProof markers`,
      detail: proofingAnalysis.concern,
      evidence: proofingAnalysis.detail,
    });
  }

  // Flag 9: AI platform font in document theme
  if (themeFontConcern) {
    forensicFlags.push({
      type: 'theme_font_anomaly',
      severity: 'medium',
      flag: `AI platform font found in document theme: ${themeFontConcern.font}`,
      detail: `${themeFontConcern.font} appears as a theme font, suggesting the document was created or heavily modified in an environment using this font. ${themeFontConcern.notes}`,
      evidence: `Theme font: ${themeFontConcern.font}`,
    });
  }

  // ── Overall Risk Level ──
  const highFlags = forensicFlags.filter(f => f.severity === 'high').length;
  const medFlags = forensicFlags.filter(f => f.severity === 'medium').length;
  
  let riskLevel, riskMessage;
  if (highFlags >= 2 || (highFlags >= 1 && medFlags >= 2)) {
    riskLevel = 'high';
    riskMessage = 'Document forensics indicate strong evidence of content assembled from external AI source(s). Multiple formatting signatures detected.';
  } else if (highFlags >= 1 || medFlags >= 2) {
    riskLevel = 'medium';
    riskMessage = 'Document forensics show some formatting inconsistencies that may indicate external content sources. Recommend correlating with vocabulary analysis.';
  } else if (medFlags >= 1 || forensicFlags.length > 0) {
    riskLevel = 'low';
    riskMessage = 'Minor formatting observations noted. Alone these are not conclusive but may support other indicators.';
  } else {
    riskLevel = 'clean';
    riskMessage = 'No significant formatting anomalies detected. Document appears to have been composed in a single environment.';
  }

  return {
    documentDefaultFont,
    fontProfile,
    boldPattern,
    transitions,
    spellingConvention,
    rsidAnalysis,
    runFragmentation,
    proofingAnalysis,
    themeFontConcern,
    forensicFlags,
    summary: { riskLevel, message: riskMessage, flagCount: forensicFlags.length, highSeverity: highFlags, mediumSeverity: medFlags },
    sections, // Full section data for detailed inspection
  };
}

// ─── Helper Functions ───────────────────────────────────────

function analyseRsidBlocks(sections) {
  // Group consecutive paragraphs by rsid to identify paste blocks
  const contentSections = sections.filter(s => s.charCount > 20);
  const blocks = [];
  let currentRsid = null;
  let currentBlock = [];
  
  for (const section of contentSections) {
    if (section.rsid === currentRsid && currentRsid !== null) {
      currentBlock.push(section);
    } else {
      if (currentBlock.length > 0) {
        blocks.push({
          rsid: currentRsid,
          size: currentBlock.length,
          preview: currentBlock[0].text.substring(0, 60) + (currentBlock[0].text.length > 60 ? '...' : ''),
          totalChars: currentBlock.reduce((sum, s) => sum + s.charCount, 0),
          fonts: [...new Set(currentBlock.map(s => s.dominantFont))],
        });
      }
      currentRsid = section.rsid;
      currentBlock = [section];
    }
  }
  // Don't forget the last block
  if (currentBlock.length > 0) {
    blocks.push({
      rsid: currentRsid,
      size: currentBlock.length,
      preview: currentBlock[0].text.substring(0, 60) + (currentBlock[0].text.length > 60 ? '...' : ''),
      totalChars: currentBlock.reduce((sum, s) => sum + s.charCount, 0),
      fonts: [...new Set(currentBlock.map(s => s.dominantFont))],
    });
  }
  
  const largestBlock = blocks.reduce((max, b) => b.size > max.size ? b : max, { size: 0, rsid: null });
  const uniqueRsids = new Set(contentSections.map(s => s.rsid).filter(Boolean)).size;
  
  return {
    totalContentParas: contentSections.length,
    uniqueRsids,
    largestBlock: largestBlock.size,
    largestBlockRsid: largestBlock.rsid,
    blockDetails: blocks.filter(b => b.size >= 2),
    rsidToParaRatio: contentSections.length > 0 ? Math.round((uniqueRsids / contentSections.length) * 100) / 100 : 0,
  };
}

function analyseRunFragmentation(bodySections) {
  // Low chars/run indicates content pasted from web (carries per-word formatting)
  // High chars/run indicates content typed directly in Word
  const totalRuns = bodySections.reduce((sum, s) => sum + s.runCount, 0);
  const totalChars = bodySections.reduce((sum, s) => sum + s.charCount, 0);
  const avgCharsPerRun = totalRuns > 0 ? Math.round(totalChars / totalRuns) : 0;
  
  let concern = null;
  if (avgCharsPerRun < 8 && totalRuns > 50) {
    concern = `Very high run fragmentation (avg ${avgCharsPerRun} chars/run). Web-pasted content typically carries per-word or per-phrase formatting, creating many small text runs. Typed text produces longer, fewer runs. This level of fragmentation is consistent with content pasted from a web-based AI interface.`;
  } else if (avgCharsPerRun < 15 && totalRuns > 30) {
    concern = `Moderate run fragmentation (avg ${avgCharsPerRun} chars/run). Some sections may contain pasted content with inherited formatting. Consider alongside other indicators.`;
  }
  
  // Also check per-section fragmentation to identify which sections are pasted
  const sectionFragmentation = bodySections.map(s => ({
    index: s.index,
    avgCharsPerRun: s.avgCharsPerRun,
    font: s.dominantFont,
    preview: s.text.substring(0, 50),
  })).filter(s => s.avgCharsPerRun < 10 && s.avgCharsPerRun > 0);
  
  return {
    totalRuns,
    totalParas: bodySections.length,
    totalChars,
    avgCharsPerRun,
    concern,
    fragmentedSections: sectionFragmentation,
  };
}

function analyseProofingMarkers(bodySections) {
  // noProof markers suppress spell checking. While not conclusive alone,
  // high counts clustering in sections with AI fonts strengthen the case.
  const totalNoProof = bodySections.reduce((sum, s) => sum + s.noProofCount, 0);
  
  // Check if noProof clusters with AI fonts
  const aiFontSections = bodySections.filter(s => AI_FONT_SIGNATURES[s.dominantFont]);
  const aiFontNoProof = aiFontSections.reduce((sum, s) => sum + s.noProofCount, 0);
  const nonAiFontSections = bodySections.filter(s => !AI_FONT_SIGNATURES[s.dominantFont]);
  const nonAiFontNoProof = nonAiFontSections.reduce((sum, s) => sum + s.noProofCount, 0);
  
  // Collect language tags across all sections
  const allLangTags = new Map();
  for (const s of bodySections) {
    for (const [lang, count] of Object.entries(s.langTags)) {
      allLangTags.set(lang, (allLangTags.get(lang) || 0) + count);
    }
  }
  
  let concern = null;
  let detail = `Total noProof markers: ${totalNoProof}. Language tags: ${[...allLangTags.entries()].map(([l, c]) => `${l} (×${c})`).join(', ') || 'none'}.`;
  
  if (totalNoProof > 20 && aiFontNoProof > nonAiFontNoProof) {
    concern = `High noProof marker count (${totalNoProof}) clustering in AI-font sections (${aiFontNoProof} in AI font sections vs ${nonAiFontNoProof} in Word font sections). This pattern occurs when content is pasted with explicit language tagging from web sources.`;
  }
  
  return { totalNoProof, aiFontNoProof, nonAiFontNoProof, langTags: Object.fromEntries(allLangTags), concern, detail };
}

async function checkThemeFonts(zip) {
  // Check if AI platform fonts appear in the document theme
  // This is unusual for student-created documents
  try {
    const themeXml = await zip.file('word/theme/theme1.xml')?.async('string');
    if (!themeXml) return null;
    
    // Look for AI platform fonts in theme
    for (const [fontName, sig] of Object.entries(AI_FONT_SIGNATURES)) {
      if (sig.confidence === 'high' && themeXml.includes(`typeface="${fontName}"`)) {
        return {
          font: fontName,
          platform: sig.platform,
          notes: `${fontName} is set as a document theme font. This is atypical for a student document created in Word — it suggests the document template or environment has been influenced by ${sig.platform}.`,
        };
      }
    }
  } catch (e) {
    // Theme check is non-critical
  }
  return null;
}

function categoriseTransition(fromFont, toFont) {
  const fromIsWord = WORD_DEFAULT_FONTS.includes(fromFont);
  const toIsWord = WORD_DEFAULT_FONTS.includes(toFont);
  const fromIsAI = AI_FONT_SIGNATURES[fromFont]?.confidence === 'high';
  const toIsAI = AI_FONT_SIGNATURES[toFont]?.confidence === 'high';
  
  // Word default → AI font = high significance (typed intro, pasted body)
  if (fromIsWord && toIsAI) return 'high';
  // AI font → Word default = high significance (pasted section ends, typing resumes)
  if (fromIsAI && toIsWord) return 'high';
  // AI font → different AI font = high (multiple AI sources)
  if (fromIsAI && toIsAI && fromFont !== toFont) return 'high';
  // Any other non-trivial change
  if (fromFont !== toFont) return 'medium';
  return 'low';
}

function detectBoldToggles(bodySections) {
  let toggleCount = 0;
  const details = [];
  let prevBold = null;
  
  for (const section of bodySections) {
    const isBold = section.boldPercentage > 80;
    const isNormal = section.boldPercentage < 20;
    
    if (prevBold !== null) {
      if ((prevBold && isNormal) || (!prevBold && isBold)) {
        toggleCount++;
        details.push(
          `Toggle at P${section.index}: ${prevBold ? 'BOLD→normal' : 'normal→BOLD'} — "${section.text.substring(0, 50)}..."`
        );
      }
    }
    
    if (isBold || isNormal) prevBold = isBold;
  }
  
  return { toggleCount, details };
}

function detectSpellingConvention(text) {
  const pairs = [
    { american: 'behavior', british: 'behaviour' },
    { american: 'minimize', british: 'minimise' },
    { american: 'realize', british: 'realise' },
    { american: 'organize', british: 'organise' },
    { american: 'analyze', british: 'analyse' },
    { american: 'color', british: 'colour' },
    { american: 'favor', british: 'favour' },
    { american: 'honor', british: 'honour' },
    { american: 'center', british: 'centre' },
    { american: 'defense', british: 'defence' },
    { american: 'license', british: 'licence' },
    { american: 'practice', british: 'practise' }, // as verb
    { american: 'catalog', british: 'catalogue' },
    { american: 'program', british: 'programme' },
    { american: 'fulfill', british: 'fulfil' },
    { american: 'traveled', british: 'travelled' },
    { american: 'canceled', british: 'cancelled' },
    { american: 'labeled', british: 'labelled' },
    { american: 'optimization', british: 'optimisation' },
    { american: 'utilization', british: 'utilisation' },
  ];
  
  const lower = text.toLowerCase();
  let americanCount = 0, britishCount = 0;
  const americanExamples = [], britishExamples = [];
  
  for (const pair of pairs) {
    // Use word boundary matching to avoid false positives
    const amRegex = new RegExp(`\\b${pair.american}\\b`, 'gi');
    const brRegex = new RegExp(`\\b${pair.british}\\b`, 'gi');
    const amMatches = lower.match(amRegex);
    const brMatches = lower.match(brRegex);
    
    if (amMatches) {
      americanCount += amMatches.length;
      americanExamples.push(`"${pair.american}" (×${amMatches.length})`);
    }
    if (brMatches) {
      britishCount += brMatches.length;
      britishExamples.push(`"${pair.british}" (×${brMatches.length})`);
    }
  }
  
  if (americanCount === 0 && britishCount === 0) return null;
  
  return {
    dominant: americanCount > britishCount ? 'American' : americanCount < britishCount ? 'British' : 'Mixed',
    americanCount,
    britishCount,
    americanExamples,
    britishExamples,
    concern: americanCount > 0 && britishCount === 0
      ? 'Exclusively American spellings — atypical for UK students; ChatGPT defaults to American English'
      : americanCount > britishCount
        ? 'Majority American spellings — unusual for UK institution'
        : null,
  };
}

// ─── Prompt Formatter ───────────────────────────────────────
// Formats forensic data into a concise summary for the Claude analysis prompt

export function formatForensicsForPrompt(forensics) {
  if (!forensics || forensics.error) {
    return '\nDOCUMENT FORENSICS: Unavailable (could not parse document formatting)\n';
  }

  const { summary, fontProfile, boldPattern, transitions, spellingConvention, rsidAnalysis, runFragmentation, proofingAnalysis, themeFontConcern, forensicFlags } = forensics;
  
  let prompt = '\nDOCUMENT FORENSICS ANALYSIS:\n';
  prompt += `Overall forensic risk: ${summary.riskLevel.toUpperCase()} — ${summary.message}\n`;
  
  if (forensics.documentDefaultFont) {
    prompt += `Document default font: ${forensics.documentDefaultFont}\n`;
  }

  // Font profile
  prompt += '\nFont sources detected:\n';
  for (const [font, info] of Object.entries(fontProfile)) {
    let line = `- ${font}: ${info.percentage}% of text (${info.characters} chars)`;
    if (info.isWordDefault) line += ' [Word default]';
    if (info.aiSignature) line += ` [⚠ AI SIGNATURE: ${info.aiSignature.platform}]`;
    prompt += line + '\n';
  }

  // Bold pattern
  if (boldPattern.concern) {
    prompt += `\nBold/normal pattern: ${boldPattern.boldBodySections} bold body sections, ${boldPattern.normalBodySections} normal body sections`;
    prompt += ` (${boldPattern.toggleCount} toggle switches — indicates ${boldPattern.toggleCount + 1} separate paste operations)\n`;
  }

  // Transitions
  if (transitions.length > 0) {
    prompt += `\nFont transitions (${transitions.length} detected):\n`;
    for (const t of transitions.slice(0, 5)) {
      prompt += `- P${t.fromParagraph}→P${t.toParagraph}: ${t.fromFont} → ${t.toFont} [${t.significance}] "${t.toText}"\n`;
    }
  }

  // Rsid paste block analysis
  if (rsidAnalysis && rsidAnalysis.largestBlock >= 3) {
    prompt += `\nPaste block analysis: Largest block = ${rsidAnalysis.largestBlock} consecutive paragraphs sharing same revision ID (single paste operation).`;
    prompt += ` Document has ${rsidAnalysis.totalContentParas} content paragraphs across ${rsidAnalysis.uniqueRsids} editing sessions.\n`;
    const bigBlocks = rsidAnalysis.blockDetails?.filter(b => b.size >= 3) || [];
    for (const b of bigBlocks) {
      prompt += `- Block of ${b.size} paragraphs [${b.fonts.join(', ')}]: "${b.preview}"\n`;
    }
  }

  // Run fragmentation
  if (runFragmentation?.concern) {
    prompt += `\nRun fragmentation: ${runFragmentation.avgCharsPerRun} avg chars/run across ${runFragmentation.totalRuns} runs. ${runFragmentation.concern}\n`;
  }

  // Spelling
  if (spellingConvention?.concern) {
    prompt += `\nSpelling convention: ${spellingConvention.concern}\n`;
    prompt += `American: ${spellingConvention.americanExamples.join(', ')}\n`;
    if (spellingConvention.britishExamples.length > 0) {
      prompt += `British: ${spellingConvention.britishExamples.join(', ')}\n`;
    }
  }

  // Key flags summary
  if (forensicFlags.length > 0) {
    prompt += `\n⚠ FORENSIC FLAGS (${forensicFlags.length}):\n`;
    for (const flag of forensicFlags) {
      prompt += `- [${flag.severity.toUpperCase()}] ${flag.flag}: ${flag.detail}\n`;
    }
  }

  prompt += '\nIMPORTANT: Incorporate document forensics findings into your originality assessment. Font and formatting evidence is a strong objective indicator — it cannot be faked by humanizer tools and students are typically unaware it exists. Weight forensic evidence heavily when it corroborates vocabulary or structural concerns.\n';

  return prompt;
}
