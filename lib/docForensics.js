// Document Forensics Module — v2
//
// Purpose: Assess the forensic character of a .docx submission to determine
// whether it was BUILT (authored organically) or PLACED (assembled/pasted
// from external sources).
//
// This module provides the LENS through which the text analysis views the
// submission. It does not detect AI use — it assesses document integrity
// and construction character.
//
// A built document has the archaeology of its own construction visible:
//   - Formatting variations reflecting decisions made at different times
//   - Style inconsistencies natural to incremental authoring
//   - Granular interaction with content
//
// A placed document has been handled as an object:
//   - Uniform formatting regardless of content type
//   - Whole-document or large-block operations
//   - Absence of the organic variation expected from engaged authoring
//
// Detection layers 1-10 are unchanged from v1.
// Layer 11: Formatting organicism — measures organic variation across the document.

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
  
  // Read document properties (author, dates, editing time)
  let documentProperties = null;
  try {
    const coreXml = await zip.file('docProps/core.xml')?.async('string');
    const appXml = await zip.file('docProps/app.xml')?.async('string');
    documentProperties = parseDocumentProperties(coreXml, appXml);
  } catch (e) { /* non-critical */ }

  // Read settings.xml for global rsid count (total editing sessions recorded)
  let settingsRsidCount = null;
  try {
    const settingsXml = await zip.file('word/settings.xml')?.async('string');
    if (settingsXml) {
      const rsidsBlock = settingsXml.match(/<w:rsids>([\s\S]*?)<\/w:rsids>/);
      if (rsidsBlock) {
        const rsidValues = rsidsBlock[1].match(/w:val="[0-9A-Fa-f]+"/g);
        settingsRsidCount = rsidValues ? rsidValues.length : 0;
      }
    }
  } catch (e) { /* non-critical */ }
  
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
    const paraRsidRPr = para.getAttributeNS(W_NS, 'rsidRPr') || para.getAttribute('w:rsidRPr') || null;
    
    // Get paragraph-level formatting properties for organicism analysis
    const pPr = getElements(para, 'pPr')[0];
    let paraAlignment = null;
    let paraSpacingBefore = null;
    let paraSpacingAfter = null;
    let paraIndent = null;
    if (pPr) {
      const jcEl = getElements(pPr, 'jc')[0];
      if (jcEl) paraAlignment = getAttr(jcEl, 'val');
      const spacingEl = getElements(pPr, 'spacing')[0];
      if (spacingEl) {
        paraSpacingBefore = getAttr(spacingEl, 'before');
        paraSpacingAfter = getAttr(spacingEl, 'after');
      }
      const indEl = getElements(pPr, 'ind')[0];
      if (indEl) paraIndent = getAttr(indEl, 'left') || getAttr(indEl, 'firstLine');
    }
    
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
      rsidRPr: paraRsidRPr,
      noProofCount: paraNoProofCount,
      langTags: Object.fromEntries(paraLangTags),
      runCount: runDetails.length,
      avgCharsPerRun: runDetails.length > 0 ? Math.round(paraText.length / runDetails.length) : 0,
      runs: runDetails,
      alignment: paraAlignment,
      spacingBefore: paraSpacingBefore,
      spacingAfter: paraSpacingAfter,
      indent: paraIndent,
    });
  }

  // ─── Build Forensic Analysis ──────────────────────────────

  return buildForensicReport(sections, documentDefaultFont, zip, documentProperties, settingsRsidCount);
}

// ─── Report Builder ─────────────────────────────────────────

async function buildForensicReport(sections, documentDefaultFont, zip, documentProperties, settingsRsidCount) {
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

  // ── Formatting Organicism Analysis ──
  const organicism = analyseOrganicism(sections, bodySections, rsidAnalysis);

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
        flag: `External platform font detected: ${font}`,
        detail: `${font} (${info.percentage}% of body text) — ${sig.notes}. Probable source: ${sig.platform}.`,
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
  if (rsidAnalysis.largestBlock >= 6) {
    forensicFlags.push({
      type: 'rsid_paste_block',
      severity: rsidAnalysis.largestBlock >= 6 ? 'high' : 'medium',
      flag: `Large paste block detected: ${rsidAnalysis.largestBlock} consecutive paragraphs share same revision ID`,
      detail: `${rsidAnalysis.largestBlock} paragraphs were created in a single operation (rsid ${rsidAnalysis.largestBlockRsid}), consistent with pasting a large block of content rather than typing incrementally. ` +
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

  // Flag 10: Low settings.xml rsid count relative to word count
  // A genuine document built over time accumulates many rsids; a paste-assembled doc has fewer
  if (settingsRsidCount !== null && documentProperties?.wordCount) {
    const rsidPerHundredWords = (settingsRsidCount / Math.max(documentProperties.wordCount, 1)) * 100;
    if (settingsRsidCount < 80 && documentProperties.wordCount > 800 && rsidPerHundredWords < 8) {
      forensicFlags.push({
        type: 'low_editing_complexity',
        severity: 'low',
        flag: `Low editing complexity: ${settingsRsidCount} revision IDs for ${documentProperties.wordCount} words`,
        detail: `Only ${settingsRsidCount} editing sessions recorded for a ${documentProperties.wordCount}-word document (${rsidPerHundredWords.toFixed(1)} sessions per 100 words). Documents built through genuine extended writing typically accumulate more editing sessions. This may indicate content was assembled from pre-written blocks rather than composed incrementally.`,
        evidence: `${settingsRsidCount} rsids, ${documentProperties.wordCount} words`,
      });
    }
  }

  // Flag 11: Low formatting organicism
  if (organicism.score <= 15 && bodySections.length >= 8) {
    forensicFlags.push({
      type: 'low_organicism',
      severity: organicism.score <= 5 ? 'high' : 'medium',
      flag: `Very low formatting variation across ${bodySections.length} body paragraphs`,
      detail: organicism.summary,
      evidence: organicism.details.join('; '),
    });
  }

  // ── Document Character Assessment ──
  const character = assessDocumentCharacter(forensicFlags, organicism, fontProfile, boldPattern, rsidAnalysis, transitions, settingsRsidCount, documentProperties, bodySections);

  const riskLevelMap = {
    'organic': 'clean',
    'indeterminate': 'low',
    'uniform': 'medium',
    'assembled': 'high',
    'placed': 'high',
  };

  return {
    documentDefaultFont,
    documentProperties,
    settingsRsidCount,
    fontProfile,
    boldPattern,
    transitions,
    spellingConvention,
    rsidAnalysis,
    runFragmentation,
    proofingAnalysis,
    themeFontConcern,
    forensicFlags,
    organicism,
    character,
    summary: {
      riskLevel: riskLevelMap[character.level] || 'low',
      message: character.summary,
      documentCharacter: character.level,
      flagCount: forensicFlags.length,
      highSeverity: forensicFlags.filter(f => f.severity === 'high').length,
      mediumSeverity: forensicFlags.filter(f => f.severity === 'medium').length,
    },
    sections,
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


function parseDocumentProperties(coreXml, appXml) {
  const props = {};
  if (coreXml) {
    const cm = (p) => { const m = coreXml.match(p); return m ? m[1] : null; };
    props.creator = cm(/<dc:creator>([^<]*)<\/dc:creator>/);
    props.lastModifiedBy = cm(/<cp:lastModifiedBy>([^<]*)<\/cp:lastModifiedBy>/);
    props.created = cm(/<dcterms:created[^>]*>([^<]*)<\/dcterms:created>/);
    props.modified = cm(/<dcterms:modified[^>]*>([^<]*)<\/dcterms:modified>/);
    if (props.created && props.modified) {
      try { props.elapsedMinutes = Math.round((new Date(props.modified) - new Date(props.created)) / 60000); } catch(e) {}
    }
  }
  if (appXml) {
    const am = (t) => { const m = appXml.match(new RegExp('<' + t + '>(\d+)</' + t + '>')); return m ? parseInt(m[1]) : null; };
    props.totalTime = am('TotalTime');
    props.pages = am('Pages');
    props.wordCount = am('Words');
    props.paragraphCount = am('Paragraphs');
    const an = appXml.match(/<Application>([^<]+)<\/Application>/);
    props.application = an ? an[1] : null;
  }
  return props;
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

  // Document properties context
  if (forensics.documentProperties) {
    const dp = forensics.documentProperties;
    prompt += '\nDocument properties:\n';
    if (dp.creator) prompt += `- Author: ${dp.creator}\n`;
    if (dp.created && dp.modified) prompt += `- Created: ${dp.created}, Last modified: ${dp.modified}\n`;
    if (dp.elapsedMinutes !== undefined) prompt += `- Time span (created to modified): ${dp.elapsedMinutes} minutes\n`;
    if (dp.totalTime) prompt += `- Total editing time (Word-reported): ${dp.totalTime} minutes\n`;
    if (dp.wordCount) prompt += `- Word count (metadata): ${dp.wordCount}\n`;
  }
  if (forensics.settingsRsidCount) {
    prompt += `- Total editing sessions in settings.xml: ${forensics.settingsRsidCount}\n`;
  }
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


// ═══════════════════════════════════════════════════════════════
//  FORMATTING ORGANICISM ANALYSIS
//  Score 0-100: 0-10 = virtually no variation, 51-100 = organic
// ═══════════════════════════════════════════════════════════════

function analyseOrganicism(allSections, bodySections, rsidAnalysis) {
  if (bodySections.length < 4) {
    return { score: 50, summary: 'Document too short for meaningful organicism assessment.', details: ['Fewer than 4 body paragraphs'], dimensions: {} };
  }

  const dimensions = {};
  const details = [];
  let totalPoints = 0;
  let maxPoints = 0;

  // Dimension 1: Font variety (0-15)
  {
    const bodyFonts = new Set(bodySections.map(s => s.dominantFont));
    const fontCount = bodyFonts.size;
    let pts;
    if (fontCount === 1) { pts = 5; details.push('Single font throughout body - neutral'); }
    else if (fontCount === 2) { pts = 10; details.push('2 fonts in body text - some variation'); }
    else { pts = 15; details.push(fontCount + ' fonts in body text - varied'); }
    dimensions.fontVariety = { points: pts, max: 15 };
    totalPoints += pts; maxPoints += 15;
  }

  // Dimension 2: Bold usage pattern (0-20)
  {
    const boldPcts = bodySections.map(s => s.boldPercentage);
    const allBold = boldPcts.filter(p => p > 80).length;
    const allNormal = boldPcts.filter(p => p < 20).length;
    const selective = boldPcts.filter(p => p >= 20 && p <= 80).length;
    const totalBody = bodySections.length;
    let pts;
    if (allBold === totalBody) { pts = 0; details.push('Entire body is bold (' + totalBody + ' paragraphs) - uniform formatting applied as single operation'); }
    else if (allNormal === totalBody) { pts = 8; details.push('Entire body is unformatted (no bold) - minimal formatting engagement'); }
    else if (selective > 0 || (allBold > 0 && allNormal > 0 && allBold < totalBody * 0.8)) { pts = 20; details.push('Mixed bold: ' + allBold + ' bold, ' + allNormal + ' normal, ' + selective + ' mixed - selective formatting'); }
    else { pts = 5; details.push('Bold pattern suggests limited formatting engagement'); }
    dimensions.boldPattern = { points: pts, max: 20 };
    totalPoints += pts; maxPoints += 20;
  }

  // Dimension 3: Font size variation (0-15)
  {
    const allSizes = new Set();
    for (const s of bodySections) { for (const r of s.runs) { if (r.fontSize) allSizes.add(r.fontSize); } }
    const sizeCount = allSizes.size;
    let pts;
    if (sizeCount <= 1) { pts = 7; details.push(sizeCount === 0 ? 'No explicit font sizes - defaults throughout' : 'Single font size - uniform'); }
    else if (sizeCount === 2) { pts = 12; details.push('2 font sizes - some structural differentiation'); }
    else { pts = 15; details.push(sizeCount + ' font sizes - active formatting decisions'); }
    dimensions.fontSizeVariation = { points: pts, max: 15 };
    totalPoints += pts; maxPoints += 15;
  }

  // Dimension 4: Rsid diversity (0-20)
  {
    const ratio = rsidAnalysis.rsidToParaRatio;
    const uniqueRsids = rsidAnalysis.uniqueRsids;
    const totalParas = rsidAnalysis.totalContentParas;
    let pts;
    if (totalParas < 5) { pts = 10; details.push('Too few paragraphs for rsid diversity assessment'); }
    else if (ratio >= 0.7) { pts = 20; details.push('High rsid diversity: ' + uniqueRsids + '/' + totalParas + ' (' + ratio + ') - incremental authoring'); }
    else if (ratio >= 0.4) { pts = 14; details.push('Moderate rsid diversity: ' + uniqueRsids + '/' + totalParas + ' (' + ratio + ')'); }
    else if (ratio >= 0.2) { pts = 7; details.push('Low rsid diversity: ' + uniqueRsids + '/' + totalParas + ' (' + ratio + ') - large block insertion'); }
    else { pts = 2; details.push('Very low rsid diversity: ' + uniqueRsids + '/' + totalParas + ' (' + ratio + ') - consistent with pasted content'); }
    dimensions.rsidDiversity = { points: pts, max: 20 };
    totalPoints += pts; maxPoints += 20;
  }

  // Dimension 5: Formatting operation granularity (0-15)
  {
    const rprValues = bodySections.map(s => s.rsidRPr).filter(Boolean);
    const uniqueRPr = new Set(rprValues).size;
    const totalWithRPr = rprValues.length;
    let pts;
    if (totalWithRPr === 0) { pts = 8; details.push('No paragraph-level formatting operations recorded'); }
    else if (uniqueRPr === 1 && totalWithRPr > 5) {
      pts = 0;
      const pctCovered = Math.round((totalWithRPr / bodySections.length) * 100);
      details.push('Single formatting operation applied to ' + totalWithRPr + '/' + bodySections.length + ' paragraphs (' + pctCovered + '%) - whole-document sweep');
    }
    else if (uniqueRPr <= 2 && totalWithRPr > 8) { pts = 3; details.push('Only ' + uniqueRPr + ' formatting operations across ' + totalWithRPr + ' paragraphs - very limited granularity'); }
    else {
      const rprRatio = totalWithRPr > 0 ? uniqueRPr / totalWithRPr : 0;
      if (rprRatio > 0.5) { pts = 15; details.push(uniqueRPr + ' distinct formatting ops across ' + totalWithRPr + ' paras - granular'); }
      else if (rprRatio > 0.25) { pts = 10; details.push(uniqueRPr + ' formatting ops across ' + totalWithRPr + ' paras - moderate'); }
      else { pts = 5; details.push(uniqueRPr + ' formatting ops across ' + totalWithRPr + ' paras - limited'); }
    }
    dimensions.formattingGranularity = { points: pts, max: 15 };
    totalPoints += pts; maxPoints += 15;
  }

  // Dimension 6: Structural formatting (0-15)
  {
    const alignments = new Set(bodySections.map(s => s.alignment).filter(Boolean));
    const spacings = new Set(bodySections.map(s => (s.spacingBefore || '') + '|' + (s.spacingAfter || '')).filter(s => s !== '|'));
    const indents = new Set(bodySections.map(s => s.indent).filter(Boolean));
    let pts = 0;
    const feats = [];
    if (alignments.size > 1) { pts += 5; feats.push(alignments.size + ' alignment styles'); }
    if (spacings.size > 1) { pts += 5; feats.push(spacings.size + ' spacing configs'); }
    if (indents.size > 0) { pts += 5; feats.push(indents.size + ' indentation(s)'); }
    details.push(feats.length > 0 ? 'Structural formatting: ' + feats.join(', ') : 'No structural formatting variation - uniform layout');
    dimensions.structuralFormatting = { points: pts, max: 15 };
    totalPoints += pts; maxPoints += 15;
  }

  const score = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 50;
  let summary;
  if (score <= 10) summary = 'This document shows virtually no formatting variation across ' + bodySections.length + ' body paragraphs. Formatting has been applied uniformly, consistent with content placed into the document rather than built incrementally. A student who produced this content through their own understanding would typically interact with the document at a more granular level.';
  else if (score <= 25) summary = 'This document shows very limited formatting variation across ' + bodySections.length + ' body paragraphs. The formatting is more consistent than would typically be expected from a student building a document over time.';
  else if (score <= 50) summary = 'This document shows some formatting variation but less than might be expected for a ' + bodySections.length + '-paragraph document. Not conclusive in either direction.';
  else summary = 'This document shows formatting variation consistent with organic authoring - multiple formatting decisions at different points, suggesting engaged authorship.';

  return { score, summary, details, dimensions, totalPoints, maxPoints };
}

// ═══════════════════════════════════════════════════════════════
//  DOCUMENT CHARACTER ASSESSMENT
//  Synthesises all forensic observations into a holistic characterisation.
//  Levels: organic, indeterminate, uniform, assembled, placed
// ═══════════════════════════════════════════════════════════════

function assessDocumentCharacter(flags, organicism, fontProfile, boldPattern, rsidAnalysis, transitions, settingsRsidCount, documentProperties, bodySections) {
  const sourceEvidence = [];
  const constructionEvidence = [];
  const organicismEvidence = [];

  const aiFontFlags = flags.filter(f => f.type === 'ai_platform_font');
  if (aiFontFlags.length > 0) {
    const totalAIPct = Object.values(fontProfile).filter(v => v.aiSignature && v.aiSignature.confidence === 'high').reduce((sum, v) => sum + v.percentage, 0);
    sourceEvidence.push({ weight: totalAIPct >= 70 ? 3 : totalAIPct >= 40 ? 2 : 1, finding: aiFontFlags.map(f => f.detail).join(' ') });
  }
  const transitionFlags = flags.filter(f => f.type === 'font_transitions');
  if (transitionFlags.length > 0) sourceEvidence.push({ weight: 2, finding: transitionFlags[0].detail });
  const themeFlags = flags.filter(f => f.type === 'theme_font_anomaly');
  if (themeFlags.length > 0) sourceEvidence.push({ weight: 1, finding: themeFlags[0].detail });
  const spellingFlags = flags.filter(f => f.type === 'spelling_convention' && f.severity !== 'low');
  if (spellingFlags.length > 0) sourceEvidence.push({ weight: 1, finding: spellingFlags[0].detail });

  const pasteFlags = flags.filter(f => f.type === 'rsid_paste_block');
  if (pasteFlags.length > 0) constructionEvidence.push({ weight: rsidAnalysis.largestBlock >= 10 ? 3 : 2, finding: pasteFlags[0].detail });
  const boldFlags = flags.filter(f => f.type === 'bold_inconsistency');
  if (boldFlags.length > 0) constructionEvidence.push({ weight: boldPattern.toggleCount >= 3 ? 2 : 1, finding: boldFlags[0].detail });
  const complexityFlags = flags.filter(f => f.type === 'low_editing_complexity');
  if (complexityFlags.length > 0) constructionEvidence.push({ weight: 1, finding: complexityFlags[0].detail });
  const fragFlags = flags.filter(f => f.type === 'run_fragmentation');
  if (fragFlags.length > 0) constructionEvidence.push({ weight: 1, finding: fragFlags[0].detail });
  const proofFlags = flags.filter(f => f.type === 'proofing_suppressed');
  if (proofFlags.length > 0) constructionEvidence.push({ weight: 0.5, finding: proofFlags[0].detail });

  const organicismFlags = flags.filter(f => f.type === 'low_organicism');
  if (organicismFlags.length > 0) {
    organicismEvidence.push({ weight: organicism.score <= 5 ? 3 : organicism.score <= 15 ? 2 : 1, finding: organicism.summary });
  }

  const sourceWeight = sourceEvidence.reduce((sum, e) => sum + e.weight, 0);
  const constructionWeight = constructionEvidence.reduce((sum, e) => sum + e.weight, 0);
  const organicismWeight = organicismEvidence.reduce((sum, e) => sum + e.weight, 0);
  const totalWeight = sourceWeight + constructionWeight + organicismWeight;
  const orgScore = organicism?.score ?? 50;

  let level;
  if (totalWeight >= 6 || (sourceWeight >= 3 && constructionWeight >= 2)) level = 'placed';
  else if (totalWeight >= 4 || (sourceWeight >= 2 && organicismWeight >= 1) || (constructionWeight >= 2 && organicismWeight >= 2)) level = 'assembled';
  else if (organicismWeight >= 2 || (orgScore <= 20 && bodySections.length >= 10)) level = 'uniform';
  else if (totalWeight >= 1) level = 'indeterminate';
  else level = 'organic';

  const allFindings = [...sourceEvidence, ...constructionEvidence, ...organicismEvidence];
  const keyFindings = allFindings.sort((a, b) => b.weight - a.weight).slice(0, 3).map(e => e.finding).join(' ');

  let summary;
  if (level === 'placed') summary = 'This document's forensic character is inconsistent with organic student authorship. ' + keyFindings + ' These are objective properties of the document file that cannot be altered by text-modification tools.';
  else if (level === 'assembled') summary = 'This document shows characteristics of content assembled from external sources rather than authored incrementally. ' + keyFindings + ' The text-level analysis should consider whether the intellectual content is consistent with this construction pattern.';
  else if (level === 'uniform') summary = 'This document shows unusually uniform formatting across ' + bodySections.length + ' body paragraphs (organicism score: ' + orgScore + '/100). ' + organicismEvidence.map(e => e.finding).join(' ') + ' The absence of normal formatting variation is itself an observation. This does not confirm external sourcing but provides context for the text-level analysis.';
  else if (level === 'indeterminate') summary = 'Document forensics found some observations but insufficient evidence to characterise the document's construction with confidence. ' + keyFindings + ' The text-level analysis should assess on its own merits, noting these observations where relevant.';
  else summary = 'No forensic concerns identified. The document's formatting character is consistent with incremental authoring in a single environment.';

  return { level, summary, sourceWeight, constructionWeight, organicismWeight, totalWeight, sourceEvidence, constructionEvidence, organicismEvidence, organicismScore: orgScore };
}

// ─── Forensic Divisor Score ─────────────────────────────────
// Calculates a numerical divisor based on forensic flag weights.
// The divisor is applied to the AI-generated originality score:
//   adjustedScore = originalScore / divisor
//
// Evidence flags (near-conclusive) get higher weights.
// Likelihood flags (indicative) get lower weights.
// No flags = divisor of 1.0 (score unchanged).
//
// Weight scale:
//   EVIDENCE (direct proof of external source):
//     AI platform font detected (high confidence):  0.40
//     Font transition (Word default → AI font):     0.30
//     Bold/normal toggle pattern (3+ toggles):      0.25
//     Bold/normal toggle pattern (1-2 toggles):     0.15
//     AI font in document theme:                    0.15
//
//   LIKELIHOOD (supporting indicators):
//     Large paste block (6+ paragraphs):            0.20
//     Large paste block (4-5 paragraphs):           0.10
//     Multiple font sources:                        0.10
//     American spellings in UK context (3+):        0.10
//     American spellings in UK context (1-2):       0.05
//     High run fragmentation:                       0.05
//     Low editing complexity:                       0.05
//     Proofing suppression clustering:              0.05

export function calculateForensicDivisor(forensicsData) {
  if (!forensicsData || !forensicsData.forensicFlags) return { divisor: 1.0, weights: [], total: 0 };

  const flags = forensicsData.forensicFlags;
  const weights = [];

  for (const flag of flags) {
    let weight = 0;
    let label = flag.flag;

    switch (flag.type) {
      case 'ai_platform_font': {
        // Scale by percentage of text in AI font
        const pct = parseInt(flag.evidence?.match(/(\d+)%/)?.[1] || '0');
        if (pct >= 70) weight = 0.40;
        else if (pct >= 40) weight = 0.30;
        else if (pct >= 15) weight = 0.20;
        else weight = 0.10;
        break;
      }
      case 'font_transitions': {
        weight = flag.severity === 'high' ? 0.30 : 0.15;
        break;
      }
      case 'bold_inconsistency': {
        const toggles = forensicsData.boldPattern?.toggleCount || 0;
        weight = toggles >= 3 ? 0.25 : 0.15;
        break;
      }
      case 'theme_font_anomaly': {
        weight = 0.15;
        break;
      }
      case 'rsid_paste_block': {
        const blockSize = forensicsData.rsidAnalysis?.largestBlock || 0;
        weight = blockSize >= 6 ? 0.20 : 0.10;
        break;
      }
      case 'multiple_font_sources': {
        weight = 0.10;
        break;
      }
      case 'spelling_convention': {
        const count = forensicsData.spellingConvention?.americanCount || 0;
        weight = count >= 3 ? 0.10 : 0.05;
        break;
      }
      case 'run_fragmentation': {
        weight = 0.05;
        break;
      }
      case 'low_editing_complexity': {
        weight = 0.05;
        break;
      }
      case 'proofing_suppressed': {
        weight = 0.05;
        break;
      }
      case 'low_organicism': {
        const orgScore = forensicsData.organicism?.score ?? 50;
        weight = orgScore <= 5 ? 0.25 : orgScore <= 15 ? 0.15 : 0.05;
        break;
      }
      case 'unexpected_font': {
        weight = 0.02;
        break;
      }
      default: {
        weight = 0.02;
        break;
      }
    }

    if (weight > 0) {
      weights.push({ flag: label, type: flag.type, severity: flag.severity, weight });
    }
  }

  const total = weights.reduce((sum, w) => sum + w.weight, 0);
  // Divisor = 1 + total weight. So no flags = divide by 1 (unchanged).
  // Maximum realistic divisor ~2.5 (every flag firing at maximum).
  const divisor = 1 + total;

  return { divisor: Math.round(divisor * 100) / 100, weights, total: Math.round(total * 100) / 100 };
}
