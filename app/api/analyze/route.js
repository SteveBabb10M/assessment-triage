import { NextResponse } from 'next/server';
import { analyzeSubmission } from '../../../lib/analysis';
import { addSubmission } from '../../../data/submissions';
import { getStudentById } from '../../../data/staff';
import { getAssignmentById } from '../../../data/units';
import { getCurrentUser } from '../../../lib/auth';

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

    // Extract text from docx
    let text = '';
    try {
      const mammoth = require('mammoth');
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } catch (err) {
      return NextResponse.json({ error: 'Failed to read document: ' + err.message }, { status: 400 });
    }

    if (!text || text.trim().length < 50) {
      return NextResponse.json({ error: 'Document appears empty or too short' }, { status: 400 });
    }

    // Run analysis
    const analysis = await analyzeSubmission(text, student.name, assignmentId);

    // Create submission record with uploader info
    const submissionId = `sub-${Date.now()}`;
    const submission = {
      id: submissionId,
      studentId,
      assignmentId,
      fileName: file.name,
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
      uploadedBy: user.email
    });
  } catch (err) {
    console.error('Analysis error:', err);
    return NextResponse.json({ error: err.message || 'Analysis failed' }, { status: 500 });
  }
}
