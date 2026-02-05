import { NextResponse } from 'next/server';
import { analyzeSubmission } from '../../../lib/analysis';
import { addSubmission } from '../../../data/submissions';
import { getStudentById, STUDENTS } from '../../../data/staff';
import { getAssignmentById } from '../../../data/units';

export async function POST(request) {
  try {
    const body = await request.json();
    const { studentId, studentName, assignmentId, fileName, fileContent, fileUrl } = body;

    // Resolve student — by ID or by name lookup
    let student = studentId ? getStudentById(studentId) : null;
    if (!student && studentName) {
      student = STUDENTS.find(s => s.name.toLowerCase() === studentName.toLowerCase());
    }
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    const assignment = getAssignmentById(assignmentId);
    if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });

    // If we have file content (base64), decode and process
    if (fileContent) {
      const mammoth = require('mammoth');
      const buffer = Buffer.from(fileContent, 'base64');
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;

      if (!text || text.trim().length < 50) {
        return NextResponse.json({ error: 'Document appears empty or too short' }, { status: 400 });
      }

      const analysis = await analyzeSubmission(text, student.name, assignmentId);
      const submissionId = `sub-${Date.now()}`;
      const submission = {
        id: submissionId,
        studentId: student.id,
        assignmentId,
        fileName: fileName || 'submission.docx',
        submittedAt: new Date().toISOString(),
        status: 'complete',
        reviewed: false,
        ...analysis,
      };

      addSubmission(submission);

      return NextResponse.json({
        success: true,
        submissionId,
        studentName: student.name,
        assignmentId,
        fileName,
        priorityFlag: analysis.priorityFlag,
        message: 'Submission received and analyzed',
      });
    }

    // If only URL, note for later processing
    return NextResponse.json({
      success: true,
      pending: true,
      studentId: student.id,
      assignmentId,
      fileName,
      fileUrl,
      message: 'Submission received. File URL noted for processing.',
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: err.message || 'Webhook processing failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'Assessment Triage Webhook',
    usage: 'POST with studentId, assignmentId, and fileContent (base64)',
  });
}
