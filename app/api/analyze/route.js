import { NextResponse } from 'next/server';
import { analyzeSubmission } from '../../../lib/analysis';
import { addSubmission } from '../../../data/submissions';
import { getStudentById } from '../../../data/staff';
import { getAssignmentById } from '../../../data/units';

export async function POST(request) {
  try {
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

    // Create submission record
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

    addSubmission(submission);

    return NextResponse.json({
      success: true,
      submissionId,
      student: student.name,
      assignment: `Unit ${assignment.unitNumber}: ${assignment.unitTitle} — ${assignment.name}`,
      priorityFlag: analysis.priorityFlag,
      originalityScore: analysis.originalityScore,
      gradeEstimate: analysis.gradeEstimate,
    });
  } catch (err) {
    console.error('Analysis error:', err);
    return NextResponse.json({ error: err.message || 'Analysis failed' }, { status: 500 });
  }
}
