/**
 * Update Profile API Route
 * Updates user profile information
 * @file app/api/auth/update-profile/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Update User Profile
 * PATCH /api/auth/update-profile
 * Body: { fullName?: string, phone?: string, avatar?: string, bio?: string }
 */
export async function PATCH(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fullName, phone, avatar, bio } = body;

    // ========== Validation ==========

    if (fullName !== undefined) {
      if (typeof fullName !== 'string' || fullName.trim().length < 2) {
        return NextResponse.json(
          { message: 'Full name must be at least 2 characters', field: 'fullName' },
          { status: 400 }
        );
      }
    }

    if (phone !== undefined) {
      if (phone && !/^\+?[1-9]\d{1,14}$/.test(phone)) {
        return NextResponse.json(
          { message: 'Invalid phone number format', field: 'phone' },
          { status: 400 }
        );
      }
    }

    if (avatar !== undefined) {
      if (!avatar || !avatar.startsWith('data:image') && !avatar.startsWith('https://')) {
        return NextResponse.json(
          { message: 'Invalid avatar URL or data URI', field: 'avatar' },
          { status: 400 }
        );
      }
    }

    if (bio !== undefined) {
      if (typeof bio !== 'string' || bio.length > 500) {
        return NextResponse.json(
          { message: 'Bio must be 500 characters or less', field: 'bio' },
          { status: 400 }
        );
      }
    }

    // ========== Database Update (Simulated) ==========

    // In production:
    // const updates = [];
    // const params = [];
    // if (fullName !== undefined) {
    //   updates.push('full_name = ?');
    //   params.push(fullName);
    // }
    // if (phone !== undefined) {
    //   updates.push('phone = ?');
    //   params.push(phone);
    // }
    // ... etc
    // UPDATE users SET ...updates WHERE id = ?

    // ========== Response ==========

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        user: {
          fullName: fullName || 'User Name',
          phone: phone || null,
          avatar: avatar || null,
          bio: bio || null,
          updatedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/update-profile
 * Get current profile
 */
export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth_token')?.value;
    if (!authToken) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // In production, query database for user profile
    return NextResponse.json(
      {
        user: {
          id: 'user_123',
          email: 'user@example.com',
          fullName: 'User Name',
          phone: null,
          avatar: null,
          bio: null,
          isEmailVerified: true,
          walletAddress: null,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { message: 'Failed to get profile' },
      { status: 500 }
    );
  }
}
