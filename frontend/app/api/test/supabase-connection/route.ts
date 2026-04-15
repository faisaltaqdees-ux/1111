import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  console.log('[SupabaseTest] Starting connection test...');
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  
  console.log('[SupabaseTest] Environment:', {
    url: url ? 'SET' : 'NOT SET',
    key: key ? 'SET' : 'NOT SET',
  });

  if (!url || !key) {
    return NextResponse.json({
      success: false,
      message: 'Missing Supabase env vars',
      details: { url: !!url, key: !!key }
    }, { status: 500 });
  }

  try {
    const supabase = createClient(url, key);
    
    console.log('[SupabaseTest] Created Supabase client, testing connection...');

    // Try to ping by counting rows
    const { data, error, count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('[SupabaseTest] Query error:', error);
      return NextResponse.json({
        success: false,
        message: 'Database query failed',
        error: error.message,
        errorCode: error.code,
      }, { status: 500 });
    }

    console.log('[SupabaseTest] Connection successful!', { count });

    return NextResponse.json({
      success: true,
      message: 'Supabase connection working!',
      transactionCount: count,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[SupabaseTest] Exception:', err);
    return NextResponse.json({
      success: false,
      message: 'Connection test failed',
      error: err?.message || String(err),
      stack: err?.stack,
    }, { status: 500 });
  }
}
