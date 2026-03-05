import { NextResponse } from 'next/server';
import { analyzeSubmission } from '../../../lib/analysis';
import { addSubmission } from '../../../data/submissions';
import { getStudentById } from '../../../data/staff';
import { getAssignmentById } from '../../../data/units';
import { getCurrentUser } from '../../../lib/auth';
import { extractDocForensics } from '../../../lib/docForensics';

// Force dynamic rendering (uses cookies)
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // Get current user for uploader tracking
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const formData = await request.formData();
    const file = formData.get('file');
    const studentId = formData.get('studentId');
    const assignmentId = formData.get('assignmentId');

    if (!file || !studentId || !assignmentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const student = getStudentById(studentId);
    const assignment = getAssignmentById(assignmentId);
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name || '';
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    const isDocx = fileName.toLowerCase().endsWith('.docx');

    if (!isPdf && !isDocx) {
      return NextResponse.json({ error: 'Unsupported file type. Please upload a .docx or .pdf file.' }, { status: 400 });
    }

    let forensicsData = null;
    let text = '';
    let pdfBase64 = null;

    if (isDocx) {
      // ── DOCX path: full forensics + text extraction ──
      try {
        forensicsData = await extractDocForensics(buffer);
        console.log(`[Forensics] ${fileName}: risk=${forensicsData.summary?.riskLevel}, flags=${forensicsData.forensicFlags?.length || 0}`);
      } catch (err) {
        console.warn('[Forensics] Extraction failed, continuing without:', err.message);
      }

      try {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } catch (err) {
        return NextResponse.json({ error: 'Failed to read document: ' + err.message }, { status: 400 });
      }

      if (!text || text.trim().length < 50) {
        return NextResponse.json({ error: 'Document appears empty or too short' }, { status: 400 });
      }

    } else {
      // ── PDF path: no forensics, send PDF directly to Claude ──
      // Convert buffer to base64 for the Claude API document input
      pdfBase64 = buffer.toString('base64');

      // Basic validation: check file isn't empty or too small
      if (buffer.length < 500) {
        return NextResponse.json({ error: 'PDF appears empty or corrupted' }, { status: 400 });
      }

      // Attempt basic text extraction for word count and local analysis fallback
      // This is best-effort — the primary analysis uses the visual PDF via Claude
      try {
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(buffer);
        text = pdfData.text || '';
        console.log(`[PDF] ${fileName}: extracted ${text.split(/\s+/).length} words for local analysis`);
      } catch (err) {
        console.warn('[PDF] Text extraction failed — Claude will work from visual PDF only:', err.message);
        text = ''; // Local analysis will be minimal, but Claude still sees the full PDF
      }
    }

    // Run analysis — pass file type and PDF base64 when applicable
    const analysis = await analyzeSubmission(
      text,
      student.name,
      assignmentId,
      null,               // adHocUnitNumber
      user.name,          // uploaderName
      student.cohortId,   // studentCohortId
      forensicsData,      // null for PDF
      isPdf ? 'pdf' : 'docx',  // fileType
      pdfBase64           // null for docx
    );

    // Create submission record with uploader info
    const submissionId = `sub-${Date.now()}`;
    const submission = {
      id: submissionId,
      studentId,
      assignmentId,
      fileName,
      fileType: isPdf ? 'pdf' : 'docx',
      submittedAt: new Date().toISOString(),
      status: 'complete',
      reviewed: false,
      ...analysis,
    };

    // Add submission with uploader email
    await addSubmission(submission, user.email);

    return NextResponse.json({
      success: true,
      submissionId,
      student: student.name,
      assignment: `Unit ${assignment.unitNumber}: ${assignment.unitTitle} — ${assignment.name}`,
      priorityFlag: analysis.priorityFlag,
      originalityScore: analysis.originalityScore,
      gradeEstimate: analysis.gradeEstimate,
      forensicRisk: isPdf ? 'not_applicable' : (forensicsData?.summary?.riskLevel || 'unavailable'),
      fileType: isPdf ? 'pdf' : 'docx',
      uploadedBy: user.email
    });
  } catch (err) {
    console.error('Analysis error:', err);
    return NextResponse.json({ error: err.message || 'Analysis failed' }, { status: 500 });
  }
}
