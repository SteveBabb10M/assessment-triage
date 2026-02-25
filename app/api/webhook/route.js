import { NextResponse } from 'next/server';
import { analyzeSubmission } from '../../../lib/analysis';
import { addSubmission, addUnmatchedSubmission } from '../../../data/submissions';
import { getStudentById, STUDENTS, getCohortById } from '../../../data/staff';
import { getAssignmentById, UNITS } from '../../../data/units';

// ─── Flexible Assignment Title Parser ───────────────────────
// Extracts unit number and (optionally) assignment letter from various formats
// Case insensitive, handles abbreviations, ignores punctuation
// 
// Returns:
//   { unitNumber, assignmentLetter, isAdHoc: false } — full match
//   { unitNumber, assignmentLetter: null, isAdHoc: true } — unit only (ad hoc)
//   null — no unit number found (unmatched)
//
function parseAssignmentTitle(title) {
  if (!title) return null;
  
  const normalised = title.toLowerCase().trim();
  
  // Extract unit number: "unit 4", "u4", "unit4"
  const unitMatch = normalised.match(/u(?:nit)?\s*(\d+)/i);
  if (!unitMatch) return null; // No unit number = unmatched
  const unitNumber = parseInt(unitMatch[1], 10);
  
  // Extract assignment letter(s): "assignment a", "ass a", "a", "ab", "a&b"
  // Look for patterns after the unit number
  const afterUnit = normalised.slice(unitMatch.index + unitMatch[0].length);
  
  // Try "assignment X" or "ass X" first
  let assignmentMatch = afterUnit.match(/(?:ass(?:ignment)?)\s*([a-e](?:\s*[&+]\s*[a-e])?)/i);
  
  // If not found, try standalone letter at end: "unit 4a" or "unit 4 a"
  if (!assignmentMatch) {
    assignmentMatch = afterUnit.match(/^\s*[-:.]?\s*([a-e](?:\s*[&+]\s*[a-e])?)(?:\s|$)/i);
  }
  
  // If no assignment letter found, this is an ad hoc submission
  if (!assignmentMatch) {
    return {
      unitNumber,
      assignmentLetter: null,
      isAdHoc: true,
      originalTitle: title.trim(),
    };
  }
  
  // Normalise assignment identifier: "a&b" -> "ab", "a + b" -> "ab"
  let assignmentId = assignmentMatch[1].replace(/[\s&+]/g, '').toLowerCase();
  
  return {
    unitNumber,
    assignmentLetter: assignmentId, // e.g. "a", "ab", "cd"
    isAdHoc: false,
  };
}

// Match parsed title to actual assignment in our system
// Uses student's cohort to determine which course's Unit X to use
function matchAssignment(parsed, cohortId) {
  if (!parsed) return null;
  
  const cohort = getCohortById(cohortId);
  if (!cohort) return null;
  
  // Find the unit with this number for this course
  const unit = Object.values(UNITS).find(
    u => u.number === parsed.unitNumber && u.course === cohort.course
  );
  if (!unit) return null;
  
  // Find the assignment within the unit
  // Assignment IDs are like "unit4-a", "unit4-ab", "unit22-bc"
  const expectedId = `${unit.id}-${parsed.assignmentLetter}`;
  const assignment = unit.assignments.find(a => a.id === expectedId);
  
  // If exact match fails, try partial match (e.g. "a" matching "unit4-ab" for combined assignments)
  if (!assignment && parsed.assignmentLetter.length === 1) {
    const partialMatch = unit.assignments.find(a => 
      a.id.endsWith(`-${parsed.assignmentLetter}`) || 
      a.id.includes(parsed.assignmentLetter)
    );
    if (partialMatch) return partialMatch.id;
  }
  
  return assignment ? assignment.id : null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      studentId, 
      studentName, 
      assignmentId,      // Direct assignment ID (from manual/test upload)
      assignmentTitle,   // From Teams Assignment title (parsed)
      fileName, 
      fileContent, 
      fileUrl,
      className          // Optional: Teams class name for logging
    } = body;

    // ─── Resolve Student ───
    let student = studentId ? getStudentById(studentId) : null;
    if (!student && studentName) {
      // Try exact match first
      student = STUDENTS.find(s => s.name.toLowerCase() === studentName.toLowerCase());
      // Try partial match (surname: firstname format)
      if (!student) {
        student = STUDENTS.find(s => 
          s.name.toLowerCase().includes(studentName.toLowerCase()) ||
          studentName.toLowerCase().includes(s.name.split(':')[0].toLowerCase())
        );
      }
    }
    
    if (!student) {
      // Store as unmatched for manual resolution
      addUnmatchedSubmission({
        id: `unmatched-${Date.now()}`,
        type: 'unknown_student',
        studentName: studentName || 'Unknown',
        assignmentTitle: assignmentTitle || assignmentId || 'Unknown',
        fileName,
        receivedAt: new Date().toISOString(),
        reason: `Student "${studentName}" not found in system`,
      });
      return NextResponse.json({ 
        success: false, 
        unmatched: true,
        error: 'Student not found',
        message: 'Submission saved to unmatched queue for manual resolution'
      }, { status: 202 });
    }

    // ─── Resolve Assignment ───
    let resolvedAssignmentId = assignmentId;
    let isAdHoc = false;
    let adHocUnitNumber = null;
    let adHocTitle = null;
    
    // If we have a title from Teams instead of direct ID, parse it
    if (!resolvedAssignmentId && assignmentTitle) {
      const parsed = parseAssignmentTitle(assignmentTitle);
      
      if (parsed) {
        if (parsed.isAdHoc) {
          // Ad hoc submission — unit number only, no specific assignment
          // Verify the unit exists for this student's cohort
          const cohort = getCohortById(student.cohortId);
          const unit = cohort ? Object.values(UNITS).find(
            u => u.number === parsed.unitNumber && u.course === cohort.course
          ) : null;
          
          if (!unit) {
            // Unit doesn't exist for this cohort
            addUnmatchedSubmission({
              id: `unmatched-${Date.now()}`,
              type: 'unknown_assignment',
              studentId: student.id,
              studentName: student.name,
              cohortId: student.cohortId,
              assignmentTitle: assignmentTitle,
              fileName,
              receivedAt: new Date().toISOString(),
              reason: `Unit ${parsed.unitNumber} not found for ${cohort?.course || 'unknown'} course`,
            });
            return NextResponse.json({ 
              success: false, 
              unmatched: true,
              error: 'Unit not found for this cohort',
              message: 'Submission saved to unmatched queue'
            }, { status: 202 });
          }
          
          // Valid ad hoc submission
          isAdHoc = true;
          adHocUnitNumber = parsed.unitNumber;
          adHocTitle = parsed.originalTitle || assignmentTitle;
          // We'll process this below without a specific assignment ID
          
        } else {
          // Standard submission with unit + assignment letter
          resolvedAssignmentId = matchAssignment(parsed, student.cohortId);
        }
      }
    }
    
    // If not ad hoc and still no assignment ID, it's unmatched
    if (!isAdHoc && !resolvedAssignmentId) {
      addUnmatchedSubmission({
        id: `unmatched-${Date.now()}`,
        type: 'unknown_assignment',
        studentId: student.id,
        studentName: student.name,
        cohortId: student.cohortId,
        assignmentTitle: assignmentTitle || 'Unknown',
        fileName,
        fileContent: fileContent ? '[stored]' : null,
        fileUrl,
        receivedAt: new Date().toISOString(),
        reason: `Could not parse assignment from title "${assignmentTitle}"`,
      });
      return NextResponse.json({ 
        success: false, 
        unmatched: true,
        student: student.name,
        error: 'Assignment not matched — title must include Unit number',
        message: 'Submission saved to unmatched queue for manual assignment'
      }, { status: 202 });
    }

    // Get assignment details (only for non-ad-hoc)
    const assignment = resolvedAssignmentId ? getAssignmentById(resolvedAssignmentId) : null;
    if (!isAdHoc && !assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // ─── Process File Content ───
    if (fileContent) {
      const mammoth = require('mammoth');
      const buffer = Buffer.from(fileContent, 'base64');
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;

      if (!text || text.trim().length < 50) {
        return NextResponse.json({ error: 'Document appears empty or too short' }, { status: 400 });
      }

      // Run analysis — ad hoc gets originality-only, standard gets full analysis
      const analysis = await analyzeSubmission(
        text, 
        student.name, 
        isAdHoc ? null : resolvedAssignmentId,
        isAdHoc ? adHocUnitNumber : null
      );
      
      const submissionId = `sub-${Date.now()}`;
      const cohort = getCohortById(student.cohortId);
      const unit = isAdHoc 
        ? Object.values(UNITS).find(u => u.number === adHocUnitNumber && u.course === cohort?.course)
        : null;
      
      const submission = {
        id: submissionId,
        studentId: student.id,
        assignmentId: resolvedAssignmentId || null,
        fileName: fileName || 'submission.docx',
        submittedAt: new Date().toISOString(),
        status: 'complete',
        reviewed: false,
        teamsAssignmentTitle: assignmentTitle,
        isAdHoc,
        adHocTitle: isAdHoc ? adHocTitle : null,
        adHocUnitNumber: isAdHoc ? adHocUnitNumber : null,
        adHocUnitId: unit?.id || null,
        ...analysis,
      };

      addSubmission(submission);

      return NextResponse.json({
        success: true,
        submissionId,
        studentName: student.name,
        cohort: student.cohortId,
        assignment: isAdHoc 
          ? `Unit ${adHocUnitNumber} (Ad hoc: ${adHocTitle})`
          : `Unit ${assignment.unitNumber}: ${assignment.unitTitle} — ${assignment.name}`,
        isAdHoc,
        parsedFrom: assignmentTitle || null,
        priorityFlag: analysis.priorityFlag,
        message: isAdHoc 
          ? 'Ad hoc submission received — originality analysis complete (no criteria assessment)'
          : 'Submission received and analyzed',
      });
    }

    // If only URL, note for later processing
    return NextResponse.json({
      success: true,
      pending: true,
      studentId: student.id,
      assignmentId: resolvedAssignmentId,
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
