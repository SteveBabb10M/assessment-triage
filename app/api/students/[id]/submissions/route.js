import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../../lib/auth';
import { getSubmissionsByStudent } from '../../../../../data/submissions';
import { getStudentById } from '../../../../../data/staff';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = params;
    const student = getStudentById(id);

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    const submissions = await getSubmissionsByStudent(id);

    // For non-sysadmin, filter to only their uploads
    const filtered = user.role === 'sysadmin'
      ? submissions
      : submissions.filter(s => s.uploadedBy === user.email);

    return NextResponse.json({ student, submissions: filtered });

  } catch (error) {
    console.error('Error fetching student submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student submissions' },
      { status: 500 }
    );
  }
}
