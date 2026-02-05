// API endpoint: /api/webhook
// Receives submissions from Power Automate when students submit via Teams Forms

import { NextResponse } from 'next/server';
import { analyzeSubmission, extractTextFromDocx } from '../../../lib/analysis.js';
import { addSubmission, updateSubmission, classifyRAG } from '../../../data/submissions.js';
import { getStudentByName } from '../../../data/demo.js';

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required fields
    const { studentName, studentEmail, assignmentId, fileName, fileContent } = body;

    if (!studentName || !assignmentId || !fileContent) {
      return NextResponse.json(
        { error: 'Missing required fields: studentName, assignmentId, fileContent' },
        { status: 400 }
      );
    }

    // Look up student
    const student = getStudentByName(studentName);
    const studentId = student ? student.id : studentName.toLowerCase().replace(/\s+/g, '-');

    // Create submission record
    const submission = addSubmission({
      studentId,
      studentName: student ? student.displayName : studentName,
      studentEmail: studentEmail || '',
      assignmentId,
      fileName: fileName || 'submission.docx',
      status: 'analysing'
    });

    // Extract text from document
    let text;
    try {
      text = await extractTextFromDocx(fileContent);
    } catch (extractError) {
      updateSubmission(submission.id, {
        status: 'error',
        error: 'Could not extract text from document'
      });
      return NextResponse.json(
        { error: 'Could not extract text from document', submissionId: submission.id },
        { status: 422 }
      );
    }

    // Run analysis
    try {
      const analysis = await analyzeSubmission({
        text,
        assignmentId,
        studentName: student ? student.displayName : studentName
      });

      // Update submission with results
      updateSubmission(submission.id, {
        status: 'complete',
        originalityScore: analysis.originalityScore,
        estimatedGrade: analysis.estimatedGrade,
        rag: analysis.rag,
        analysis,
        wordCount: analysis.wordCount
      });

      // Return summary for Teams notification
      return NextResponse.json({
        success: true,
        submissionId: submission.id,
        summary: {
          student: student ? student.displayName : studentName,
          assignment: analysis.assignmentTitle,
          unit: `Unit ${analysis.unitNumber}: ${analysis.unitTitle}`,
          rag: analysis.rag,
          originalityScore: analysis.originalityScore,
          estimatedGrade: analysis.estimatedGrade,
          flagCount: analysis.originalityFlags ? analysis.originalityFlags.length : 0,
          overallSummary: analysis.overallSummary,
          reportUrl: `/dashboard/submission/${submission.id}`
        }
      });

    } catch (analysisError) {
      updateSubmission(submission.id, {
        status: 'error',
        error: analysisError.message
      });
      return NextResponse.json(
        { error: 'Analysis failed', details: analysisError.message, submissionId: submission.id },
        { status: 500 }
      );
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request', details: error.message },
      { status: 400 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Assessment Triage Webhook',
    cohort: 'Y2-BS1',
    timestamp: new Date().toISOString()
  });
}
