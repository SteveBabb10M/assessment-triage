import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../lib/auth';
import { getSubmissionsForUser, getUploaderStats } from '../../../data/submissions';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get submissions filtered by user
    const submissions = getSubmissionsForUser(user.email, user.role);
    
    // Sysadmin also gets uploader stats
    const response = {
      submissions,
      total: submissions.length
    };
    
    if (user.role === 'sysadmin') {
      response.uploaderStats = getUploaderStats();
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
