import { NextResponse } from 'next/server';
import { analyzeSubmission } from '../../../lib/analysis';
import { getAssignmentById } from '../../../data/units';

// This endpoint receives submissions from Power Automate
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Expected payload from Power Automate:
    // {
    //   studentName: "Student 1",
    //   studentId: "student1",  
    //   assignmentId: "unit1-ab",
    //   fileName: "submission.docx",
    //   fileContent: "<base64 encoded file content>",
    //   fileUrl: "https://sharepoint.com/..." (optional, for reference)
    // }

    const { studentName, studentId, assignmentId, fileName, fileContent, fileUrl } = body;

    if (!fileContent && !fileUrl) {
      return NextResponse.json({ 
        error: 'No file content provided' 
      }, { status: 400 });
    }

    if (!studentId || !assignmentId) {
      return NextResponse.json({ 
        error: 'Missing studentId or assignmentId' 
      }, { status: 400 });
    }

    let extractedText = '';

    // If base64 content provided, decode and extract text
    if (fileContent) {
      try {
        // Decode base64
        const buffer = Buffer.from(fileContent, 'base64');
        
        // For .docx files, we'd need mammoth on the server side
        // For now, assume text or simple extraction
        // In production, you'd use mammoth or similar
        
        // Simple check if it's a docx (starts with PK)
        if (buffer[0] === 0x50 && buffer[1] === 0x4B) {
          // It's a zip/docx file - would need mammoth
          // For POC, return error asking for text extraction on client
          return NextResponse.json({
            error: 'Server-side .docx extraction not implemented in POC. Use the Setup > Test Upload page instead.',
            suggestion: 'Extract text client-side and call /api/analyze directly'
          }, { status: 400 });
        } else {
          // Assume it's plain text
          extractedText = buffer.toString('utf-8');
        }
      } catch (err) {
        return NextResponse.json({ 
          error: 'Failed to decode file content: ' + err.message 
        }, { status: 400 });
      }
    }

    // Get assignment info
    const assignment = getAssignmentById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ 
        error: 'Assignment not found: ' + assignmentId 
      }, { status: 400 });
    }

    // If we have text, analyze it
    if (extractedText) {
      const result = await analyzeSubmission(extractedText, assignment, {
        course: assignment.course === 'extended' ? 'Extended Diploma' : 'Foundation Diploma',
        ability: 'mid'
      });

      // In production, you'd:
      // 1. Save to database
      // 2. Send Teams notification
      // 3. Return success

      return NextResponse.json({
        success: true,
        studentId,
        studentName,
        assignmentId,
        fileName,
        analysis: result,
        message: 'Submission received and analyzed'
      });
    }

    // If we only have a URL, we'd need to fetch from SharePoint
    // This requires Microsoft Graph API authentication
    return NextResponse.json({
      success: true,
      pending: true,
      studentId,
      assignmentId,
      fileName,
      fileUrl,
      message: 'Submission received. File URL noted for processing.'
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ 
      error: error.message || 'Webhook processing failed' 
    }, { status: 500 });
  }
}

// Handle GET for health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    endpoint: 'Assessment Triage Webhook',
    usage: 'POST with studentId, assignmentId, and fileContent (base64)'
  });
}
