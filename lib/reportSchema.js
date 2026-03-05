// Report Schema — v3 (PDF Support)
//
// The report is EVIDENCE for a professional decision.
// It does not make recommendations, suggest next steps, or provide student feedback.
// It presents findings and shows its working so a teacher can make a reasoned decision
// and defend that decision to an examining body.
//
// Three-phase architecture:
//   Phase 1: Document forensics (mechanical, deterministic) — DOCX ONLY
//   Phase 2: Reasoning and pattern analysis (AI, contextualised by Phase 1 lens or content-only for PDF)
//   Phase 3: Report assembly (structured, consistent, persistent)

import { calculateForensicDivisor } from './docForensics.js';

// ─── Report Builder ─────────────────────────────────────────

export function buildReport(metadata, forensicsData, aiAnalysisResult) {
  const reportToken = crypto.randomUUID();
  const now = new Date().toISOString();
  const isPdf = metadata.fileType === 'pdf';

  // Phase 1: Forensic assessment — skipped for PDF
  const forensicScore = (!isPdf && forensicsData) ? calculateForensicDivisor(forensicsData) : { divisor: 1.0, weights: [], total: 0 };
  const forensics = isPdf ? buildPdfForensicsSection() : buildForensicsSection(forensicsData, forensicScore);

  // Phase 2: AI analysis results
  const oa = aiAnalysisResult?.originalityAssessment || {};
  const ha = aiAnalysisResult?.holisticAssessment || {};

  // Triage classification
  const classification = aiAnalysisResult?.triageClassification || 'CHECK (Amber)';
  const priorityFlag = aiAnalysisResult?.priorityFlag || 'yellow';

  return {
    reportToken,
    reportVersion: 3,
    generatedAt: now,

    // ── Metadata ──
    metadata: {
      studentName: metadata.studentName,
      cohortId: metadata.cohortId || null,
      unitNumber: metadata.unitNumber,
      unitTitle: metadata.unitTitle,
      assignmentName: metadata.assignmentName || null,
      criteria: metadata.criteria || [],
      wordCount: metadata.wordCount,
      submittedAt: metadata.submittedAt || null,
      isAdHoc: metadata.isAdHoc,
      fileType: metadata.fileType || 'docx',
    },

    // ── Triage Classification ──
    triage: {
      classification,
      priorityFlag,
      triageReason: aiAnalysisResult?.triageReason || null,
      originalityScore: oa.originalityScore ?? 0,
      forensicIntegrity: forensics.integrity,
      aiLikelihood: oa.confidenceLevel || 'Low',
      probableTool: oa.likelyAITool || null,
    },

    // ── Document Forensics (Phase 1) ──
    // Single qualifier + contextual summary for teachers.
    // Full flag data stored for detailed view if needed.
    // For PDF: explicit "not applicable" message.
    forensics,

    // ── Originality Assessment (Phase 2) ──
    // Evidence-based analysis showing the working.
    originality: {
      verdict: oa.overallVerdict || 'Unknown',
      score: oa.originalityScore ?? 0,
      confidence: oa.confidenceLevel || 'Low',
      tool: oa.likelyAITool || null,
      toolReasoning: oa.likelyAIToolReasoning || null,
      summary: oa.summary || '',

      // Detailed evidence sections
      humanizerMarkers: oa.humanizerMarkers || [],
      directAIMarkers: oa.directAIMarkers || [],
      authenticIndicators: oa.authenticIndicators || [],
      vocabularyFlags: oa.vocabularyFlags || [],
      copyPasteIndicators: oa.copyPasteIndicators || [],
      researchQualityNotes: oa.researchQualityNotes || null,
    },

    // ── Criteria Assessment (Phase 2, standard submissions only) ──
    // What evidence is present, what's missing, provisional grade. No feedback.
    criteriaAssessment: metadata.isAdHoc ? null : {
      overview: ha.documentOverview || null,
      overallGrade: ha.overallGrade || 'Referral',
      gradeJustification: ha.gradeJustification || '',
      conditionalNote: ha.conditionalNote || null,
      criteria: (ha.criteriaAssessments || []).map(ca => ({
        criterion: ca.criterion,
        title: ca.criterionTitle || '',
        evidencePresent: ca.evidencePresent || '',
        gaps: ca.gaps || '',
        grade: ca.provisionalGrade || 'Not evidenced',
        notes: ca.notes || '',
      })),
    },

    // ── Verification Questions ──
    // Specific to the submission content. For teacher use if they choose.
    verificationQuestions: aiAnalysisResult?.verificationQuestions || [],
  };
}

// ─── PDF Forensics Section ──────────────────────────────────
// Clear, explicit message that forensics are not applicable for PDFs.

function buildPdfForensicsSection() {
  return {
    integrity: 'Not applicable',
    integrityScore: null,
    documentCharacter: null,
    organicismScore: null,
    context: 'This submission was uploaded as a PDF file. Document forensic analysis (font declarations, editing session patterns, bold patterns, paste detection) is only available for .docx files. The originality assessment for this submission is based on content and visual analysis only.',
    flags: [],
    raw: null,
    fileType: 'pdf',
  };
}

// ─── Forensics Section Builder ──────────────────────────────
// Produces a teacher-facing summary that contextualises the forensic findings
// without exposing the technical detail.

function buildForensicsSection(forensicsData, forensicScore) {
  if (!forensicsData || !forensicsData.summary) {
    return {
      integrity: 'Unknown',
      integrityScore: 0,
      context: 'Document formatting could not be analysed.',
      flags: [],
      raw: null,
      fileType: 'docx',
    };
  }

  const s = forensicsData.summary;
  const flags = forensicsData.forensicFlags || [];

  // Build the integrity qualifier
  let integrity, context;

  if (s.riskLevel === 'clean') {
    integrity = 'Consistent';
    context = 'No forensic concerns identified. The document\'s formatting character is consistent with incremental authoring in a single environment.';
  } else if (s.riskLevel === 'low') {
    integrity = 'Consistent';
    context = 'The document shows minor formatting variations within normal range. No significant indicators of external content.';
  } else if (s.riskLevel === 'medium') {
    integrity = 'Some concerns';
    context = forensicsData.character?.summary || buildContextSummary(forensicsData, flags, 'medium');
  } else {
    integrity = 'Atypical';
    context = forensicsData.character?.summary || buildContextSummary(forensicsData, flags, 'high');
  }

  return {
    integrity,
    integrityScore: Math.round(forensicScore.total * 100),
    documentCharacter: s.documentCharacter || null,
    organicismScore: forensicsData.organicism?.score ?? null,
    context,
    // Stored for detailed view but not primary display
    flags: forensicScore.weights,
    raw: {
      riskLevel: s.riskLevel,
      fontProfile: forensicsData.fontProfile,
      boldPattern: forensicsData.boldPattern,
      transitions: forensicsData.transitions?.slice(0, 10),
      rsidAnalysis: forensicsData.rsidAnalysis ? {
        totalContentParas: forensicsData.rsidAnalysis.totalContentParas,
        uniqueRsids: forensicsData.rsidAnalysis.uniqueRsids,
        largestBlock: forensicsData.rsidAnalysis.largestBlock,
      } : null,
      charrsidAnalysis: forensicsData.charrsidAnalysis || null,
      spellingConvention: forensicsData.spellingConvention,
      documentProperties: forensicsData.documentProperties || null,
    },
    fileType: 'docx',
  };
}

function buildContextSummary(forensicsData, flags, level) {
  const points = [];

  const aiFont = flags.find(f => f.type === 'ai_platform_font');
  if (aiFont) {
    const fontEntry = Object.entries(forensicsData.fontProfile || {}).find(([_, v]) => v.aiSignature);
    if (fontEntry) {
      const pct = fontEntry[1].percentage;
      const platform = fontEntry[1].aiSignature.platform;
      if (pct >= 70) {
        points.push(`The majority of this document (${pct}%) was created in a different application to Microsoft Word, with formatting consistent with ${platform}.`);
      } else {
        points.push(`A significant portion of this document (${pct}%) contains formatting consistent with content from ${platform}, while the remainder was written in Word.`);
      }
    }
  }

  const pasteBlock = flags.find(f => f.type === 'rsid_paste_block');
  const boldFlag = flags.find(f => f.type === 'bold_inconsistency');
  if (pasteBlock && forensicsData.rsidAnalysis?.largestBlock >= 6) {
    points.push(`${forensicsData.rsidAnalysis.largestBlock} consecutive paragraphs were inserted into the document in a single operation, rather than being typed incrementally.`);
  }
  if (boldFlag && forensicsData.boldPattern?.toggleCount >= 2) {
    points.push(`The document body alternates between different formatting styles ${forensicsData.boldPattern.toggleCount} times, consistent with content assembled from multiple separate sources.`);
  }

  const transition = (forensicsData.transitions || []).find(t => t.significance === 'high');
  if (transition) {
    points.push(`There is a clear change in document environment at paragraph ${transition.toParagraph}, where the formatting shifts from one application to another.`);
  }

  if (forensicsData.spellingConvention?.dominant === 'American' && forensicsData.spellingConvention.americanCount >= 2) {
    points.push(`The document uses American English spellings throughout, which is atypical for UK-based students and consistent with the default language settings of AI tools.`);
  }

  if (points.length === 0 && level === 'medium') {
    points.push(`The document shows formatting inconsistencies that suggest it was not created as a single continuous piece of work.`);
  }

  if (level === 'high') {
    return `This document shows atypical creation behaviour that is inconsistent with a student writing directly in Microsoft Word. ${points.join(' ')} These indicators are objective properties of the document file and cannot be altered by text-modification tools.`;
  }

  return `This document shows some inconsistencies in its creation history. ${points.join(' ')} These observations alone are not conclusive but provide context for the text-level analysis.`;
}
