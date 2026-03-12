// Student Feedback Document Generator
//
// Generates a .docx file containing ONLY student-appropriate feedback:
// - Header with student/unit/assignment info
// - Overall provisional grade
// - Criteria assessment table (criterion, evidence, gaps, grade)
// - Recommended next steps
//
// DELIBERATELY EXCLUDES:
// - Originality assessment (score, verdict, markers, forensics)
// - Triage classification
// - Verification questions
// - Document integrity / forensic analysis
// - AI tool identification
//
// This ensures students receive actionable feedback without a roadmap
// for gaming the detection system on resubmission.

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, HeadingLevel,
  LevelFormat
} from 'docx';

// ─── Colour Constants ────────────────────────────────────────
const TEAL = '0D9488';
const ORANGE = 'F59E0B';
const PURPLE = '7C3AED';
const RED = 'EF4444';
const GREY = '64748B';
const LIGHT_GREY = 'F1F5F9';
const WHITE = 'FFFFFF';
const BLACK = '1E293B';

function gradeColourHex(grade) {
  if (!grade) return GREY;
  const g = grade.toLowerCase();
  if (g.includes('distinction')) return PURPLE;
  if (g.includes('merit')) return ORANGE;
  if (g.includes('pass')) return TEAL;
  if (g.includes('referral') || g.includes('fail')) return RED;
  // T Level bands
  if (g.includes('band 3-4') || g.includes('strong')) return PURPLE;
  if (g.includes('band 2-3') || g.includes('competent')) return ORANGE;
  if (g.includes('band 1-2') || g.includes('developing')) return 'F97316';
  if (g.includes('band 1') || g.includes('limited')) return RED;
  if (g.includes('below band')) return 'DC2626';
  return GREY;
}

function criteriaStatusColour(grade) {
  if (!grade) return { bg: LIGHT_GREY, text: GREY };
  if (grade === 'Met') return { bg: 'DCFCE7', text: '166534' };
  if (grade === 'Partially met') return { bg: 'FEF3C7', text: '92400E' };
  if (grade === 'Not yet met') return { bg: 'FEE2E2', text: '991B1B' };
  return { bg: LIGHT_GREY, text: GREY }; // Not evidenced
}

// ─── Shared Table Helpers ────────────────────────────────────

const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' };
const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function headerCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: '1E293B', type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: 'center',
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, font: 'Arial', size: 18, color: WHITE })],
    })],
  });
}

function bodyCell(text, width, opts = {}) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    children: [new Paragraph({
      children: [new TextRun({
        text: text || '—',
        font: 'Arial',
        size: 18,
        color: opts.color || '374151',
        bold: opts.bold || false,
      })],
    })],
  });
}

// ─── Document Builder ────────────────────────────────────────

export async function generateStudentFeedback(sub) {
  // Resolve data sources (same logic as the report page)
  const report = sub.report || null;
  const criteria = report?.criteriaAssessment || null;
  const meta = report?.metadata || {};
  const nextSteps = report?.recommendedNextSteps || sub.recommendedNextSteps || [];

  const studentName = sub.student?.name || meta.studentName || 'Unknown Student';
  const unitTitle = sub.unitTitle || meta.unitTitle || '';
  const assignmentName = sub.assignmentName || meta.assignmentName || '';
  const cohortName = sub.cohortName || meta.cohortId || '';
  const wordCount = sub.wordCount || meta.wordCount || 0;
  const overallGrade = criteria?.overallGrade || sub.holisticAssessment?.overallGrade || sub.gradeEstimate || 'Not assessed';
  const gradeJustification = criteria?.gradeJustification || sub.holisticAssessment?.gradeJustification || '';
  const conditionalNote = criteria?.conditionalNote || sub.holisticAssessment?.conditionalNote || '';
  const overview = criteria?.overview || sub.holisticAssessment?.documentOverview || '';

  // Resolve criteria assessments (BTEC or T Level grids)
  const criteriaAssessments = criteria?.criteria || sub.holisticAssessment?.criteriaAssessments || [];
  const gridAssessments = criteria?.gridAssessments || sub.holisticAssessment?.gridAssessments || [];
  const isTLevel = gridAssessments.length > 0;
  const totalMark = criteria?.totalEstimatedMark ?? sub.holisticAssessment?.totalEstimatedMark ?? null;
  const maxMarks = criteria?.maxMarks ?? sub.holisticAssessment?.maxMarks ?? null;

  const children = [];

  // ── Title ──
  children.push(new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text: 'Assessment Feedback', font: 'Arial', size: 36, bold: true, color: BLACK })],
  }));

  // ── Student / Unit / Assignment info ──
  children.push(new Paragraph({
    spacing: { after: 40 },
    children: [
      new TextRun({ text: 'Student: ', font: 'Arial', size: 22, color: GREY }),
      new TextRun({ text: studentName, font: 'Arial', size: 22, bold: true, color: BLACK }),
    ],
  }));
  children.push(new Paragraph({
    spacing: { after: 40 },
    children: [
      new TextRun({ text: 'Unit: ', font: 'Arial', size: 22, color: GREY }),
      new TextRun({ text: unitTitle, font: 'Arial', size: 22, color: BLACK }),
    ],
  }));
  if (assignmentName && !sub.isAdHoc) {
    children.push(new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: 'Assignment: ', font: 'Arial', size: 22, color: GREY }),
        new TextRun({ text: assignmentName, font: 'Arial', size: 22, color: BLACK }),
      ],
    }));
  }
  if (cohortName) {
    children.push(new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({ text: 'Cohort: ', font: 'Arial', size: 22, color: GREY }),
        new TextRun({ text: cohortName, font: 'Arial', size: 22, color: BLACK }),
      ],
    }));
  }
  children.push(new Paragraph({
    spacing: { after: 200 },
    children: [
      new TextRun({ text: `${wordCount.toLocaleString()} words`, font: 'Arial', size: 18, color: GREY }),
      new TextRun({ text: `  •  Generated ${new Date().toLocaleDateString('en-GB')}`, font: 'Arial', size: 18, color: GREY }),
    ],
  }));

  // ── Horizontal rule ──
  children.push(new Paragraph({
    spacing: { after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'E2E8F0', space: 1 } },
    children: [],
  }));

  // ── Overall Grade ──
  const gradeColor = gradeColourHex(overallGrade);
  children.push(new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({ text: 'Overall Provisional Grade: ', font: 'Arial', size: 24, color: GREY }),
      new TextRun({ text: overallGrade, font: 'Arial', size: 28, bold: true, color: gradeColor }),
    ],
  }));
  if (gradeJustification) {
    children.push(new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ text: gradeJustification, font: 'Arial', size: 20, color: '475569' })],
    }));
  }
  if (conditionalNote) {
    children.push(new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ text: `⚠ ${conditionalNote}`, font: 'Arial', size: 20, color: '92400E', bold: true })],
    }));
  }

  children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));

  // ── Document Overview ──
  if (overview) {
    children.push(new Paragraph({
      spacing: { after: 60 },
      children: [new TextRun({ text: 'Summary', font: 'Arial', size: 24, bold: true, color: BLACK })],
    }));
    children.push(new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text: overview, font: 'Arial', size: 20, color: '374151' })],
    }));
  }

  // ── T Level Grid Assessments ──
  if (isTLevel && gridAssessments.length > 0) {
    children.push(new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: 'Mark Breakdown', font: 'Arial', size: 24, bold: true, color: BLACK })],
    }));

    // Content width: A4 with 1" margins = 9026 DXA
    const colWidths = [3200, 1200, 1200, 3426]; // grid, band, mark, justification
    const headerRow = new TableRow({
      children: [
        headerCell('Marking Grid', colWidths[0]),
        headerCell('Band', colWidths[1]),
        headerCell('Mark', colWidths[2]),
        headerCell('Justification', colWidths[3]),
      ],
    });

    const bodyRows = gridAssessments.map((ga, i) => new TableRow({
      children: [
        bodyCell(ga.gridName, colWidths[0], { bold: true }),
        bodyCell(`Band ${ga.bestFitBand}`, colWidths[1], { fill: 'E0F2FE', color: '0369A1' }),
        bodyCell(`${ga.estimatedMark} / ${ga.maxMarks}`, colWidths[2], { bold: true, color: TEAL }),
        bodyCell(ga.justification || '', colWidths[3]),
      ],
    }));

    // Total row
    bodyRows.push(new TableRow({
      children: [
        bodyCell('Total', colWidths[0], { bold: true, fill: LIGHT_GREY }),
        bodyCell('', colWidths[1], { fill: LIGHT_GREY }),
        bodyCell(`${totalMark} / ${maxMarks}`, colWidths[2], { bold: true, color: TEAL, fill: LIGHT_GREY }),
        bodyCell('', colWidths[3], { fill: LIGHT_GREY }),
      ],
    }));

    children.push(new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: colWidths,
      rows: [headerRow, ...bodyRows],
    }));

    children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  }

  // ── BTEC Criteria Assessment Table ──
  if (!isTLevel && criteriaAssessments.length > 0) {
    children.push(new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: 'Criteria Assessment', font: 'Arial', size: 24, bold: true, color: BLACK })],
    }));

    // A4 content width = 9026 DXA
    const colWidths = [900, 3000, 3000, 1126]; // criterion, evidence, gaps, grade
    const headerRow = new TableRow({
      children: [
        headerCell('Criterion', colWidths[0]),
        headerCell('Evidence Present', colWidths[1]),
        headerCell('Gaps', colWidths[2]),
        headerCell('Grade', colWidths[3]),
      ],
    });

    const bodyRows = criteriaAssessments.map(ca => {
      const grade = ca.provisionalGrade || ca.grade || 'Not evidenced';
      const sc = criteriaStatusColour(grade);
      return new TableRow({
        children: [
          bodyCell(ca.criterion, colWidths[0], { bold: true }),
          bodyCell(ca.evidencePresent || ca.evidence || '', colWidths[1]),
          bodyCell(ca.gaps || '', colWidths[2], { color: 'DC2626' }),
          bodyCell(grade, colWidths[3], { fill: sc.bg, color: sc.text, bold: true }),
        ],
      });
    });

    children.push(new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: colWidths,
      rows: [headerRow, ...bodyRows],
    }));

    children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  }

  // ── Recommended Next Steps ──
  if (nextSteps.length > 0) {
    children.push(new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: 'Recommended Next Steps', font: 'Arial', size: 24, bold: true, color: '166534' })],
    }));

    nextSteps.forEach((step, i) => {
      // Criterion + status header
      children.push(new Paragraph({
        spacing: { before: i > 0 ? 160 : 0, after: 40 },
        children: [
          new TextRun({ text: step.criterion, font: 'Arial', size: 22, bold: true, color: BLACK }),
          new TextRun({ text: `  (${step.currentStatus})`, font: 'Arial', size: 18, color: GREY }),
        ],
      }));

      // Advice text
      children.push(new Paragraph({
        spacing: { after: 80 },
        indent: { left: 360 },
        children: [new TextRun({ text: step.whatToDoNext, font: 'Arial', size: 20, color: '374151' })],
      }));
    });

    children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  }

  // ── Footer disclaimer ──
  children.push(new Paragraph({
    spacing: { before: 200 },
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0', space: 1 } },
    children: [],
  }));
  children.push(new Paragraph({
    spacing: { before: 100 },
    children: [new TextRun({
      text: 'This feedback is generated from automated assessment analysis and provides provisional grades only. Final grades are subject to internal verification and moderation. If you have questions about this feedback, please speak to your teacher.',
      font: 'Arial', size: 16, color: GREY, italics: true,
    })],
  }));

  // ── Build document ──
  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Arial', size: 20 } } },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

// ─── Browser Download Helper ─────────────────────────────────

export async function downloadStudentFeedback(sub) {
  const buffer = await generateStudentFeedback(sub);
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const studentName = (sub.student?.name || sub.report?.metadata?.studentName || 'Student').replace(/\s+/g, '_');
  const unitTitle = (sub.unitTitle || sub.report?.metadata?.unitTitle || 'Unit').replace(/\s+/g, '_');
  a.href = url;
  a.download = `Feedback_${studentName}_${unitTitle}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
