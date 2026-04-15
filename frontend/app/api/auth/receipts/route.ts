/**
 * Auth API: Get User Receipts
 * Returns all receipts for authenticated user
 * @file app/api/auth/receipts\route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAuthToken } from '@/lib/auth/utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId, valid } = verifyAuthToken(token);
    if (!valid || !userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user to find wallet
    const { data: user } = await supabase
      .from('users')
      .select('wallet_address')
      .eq('id', userId)
      .single();

    if (!user || !user.wallet_address) {
      return NextResponse.json({
        success: true,
        receipts: [],
      });
    }

    // Get receipts by wallet address
    const { data: receipts, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('wallet_address', user.wallet_address)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Auth/Receipts] Error:', error);
      return NextResponse.json({
        success: true,
        receipts: [],
      });
    }

    return NextResponse.json({
      success: true,
      receipts: receipts || [],
    });
  } catch (error) {
    console.error('[Auth/Receipts] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
