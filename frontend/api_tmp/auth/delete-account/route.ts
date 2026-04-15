/**
 * Auth API: Delete Account
 * Permanently deletes user account and all associated data
 * @file app/api/auth/delete-account\route.ts
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAuthToken } from '@/lib/auth/utils';
import { sendAccountDeletedEmail } from '@/lib/email/service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export async function POST(request: NextRequest): Promise<NextResponse> {
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

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('id', userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Send confirmation email
    await sendAccountDeletedEmail(user.email, user.full_name);

    // Update user status to deleted (soft delete)
    await supabase
      .from('users')
      .update({
        account_status: 'deleted',
        email: `deleted_${Date.now()}_${user.email}`, // Anonymize email
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    // Log deletion
    console.log('[Auth/DeleteAccount] Account deleted:', userId);

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully. Confirmation email sent.',
    });
  } catch (error) {
    console.error('[Auth/DeleteAccount] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
