import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// TEMPORARY DEBUG ENDPOINT - REMOVE AFTER TESTING
export async function GET() {
  const diagnostics = {
    supabaseUrl: process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL.substring(0, 30)}...` : 'NOT SET',
    supabaseKeySet: !!process.env.SUPABASE_ANON_KEY,
    supabaseKeyLength: process.env.SUPABASE_ANON_KEY?.length || 0,
    clientCreated: !!supabase,
  };

  // Test the connection if client exists
  if (supabase) {
    try {
      const { data, error, count } = await supabase
        .from('submissions')
        .select('id, uploaded_by, priority_flag, status', { count: 'exact' })
        .limit(5);

      diagnostics.dbConnected = !error;
      diagnostics.dbError = error ? error.message : null;
      diagnostics.dbErrorCode = error ? error.code : null;
      diagnostics.rowCount = count;
      diagnostics.sampleRows = data?.map(r => ({ id: r.id, uploaded_by: r.uploaded_by, flag: r.priority_flag, status: r.status })) || [];
    } catch (err) {
      diagnostics.dbConnected = false;
      diagnostics.dbException = err.message;
    }
  }

  return NextResponse.json(diagnostics);
}
