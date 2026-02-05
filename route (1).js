// API endpoint: /api/analyze
// For manual upload testing via the Setup page

import { NextResponse } from 'next/server';
import { analyzeSubmission, extractTextFromDocx } from '../../../lib/analysis.js';
import { addSubmission, updateSubmission } from '../../../data/submissions.js';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const studentId = formData.get('studentId');
    const studentName = formData.get('studentName');
    const assignmentId = formData.get('assignmentId');

    if (!file || !studentId || !assignmentId) {
      return NextResponse.json(
        { error: 'Missing required fields: file, studentId, assignmentId' },
        { status: 400 }
      );
    }

    // Create submission record
    const submission = addSubmission({
      studentId,
      studentName: studentName || studentId,
      assignmentId,
      fileName: file.name,
      status: 'analysing'
    });

    // Read file content
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');

    // Extract text
    let text;
    try {
      text = await extractTextFromDocx(base64);
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
    const analysis = await analyzeSubmission({
      text,
      assignmentId,
      studentName: studentName || studentId
    });

    // Update submission
    updateSubmission(submission.id, {
      status: 'complete',
      originalityScore: analysis.originalityScore,
      estimatedGrade: analysis.estimatedGrade,
      rag: analysis.rag,
      analysis,
      wordCount: analysis.wordCount
    });

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      analysis
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Analysis failed', details: error.message },
      { status: 500 }
    );
  }
}
