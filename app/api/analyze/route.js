import { NextResponse } from 'next/server';
import { analyzeSubmission } from '../../../lib/analysis';
import { getAssignmentById } from '../../../data/units';
import { getStudentById } from '../../../data/demo';

export async function POST(request) {
  try {
    const body = await request.json();
    const { submissionId, text, assignmentId, studentId } = body;

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Get assignment and student info for context
    const assignment = assignmentId ? getAssignmentById(assignmentId) : null;
    const student = studentId ? getStudentById(studentId) : null;
    
    const studentContext = {
      course: student?.course === 'extended' ? 'Extended Diploma' : 'Foundation Diploma',
      ability: 'mid'
    };

    // Perform analysis
    const result = await analyzeSubmission(text, assignment, studentContext);

    return NextResponse.json({
      submissionId,
      ...result
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ 
      error: error.message || 'Analysis failed' 
    }, { status: 500 });
  }
}
