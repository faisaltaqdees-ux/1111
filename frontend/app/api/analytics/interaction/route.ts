/**
 * Mock Analytics Interaction Endpoint
 * Prevents 404 errors in console
 */

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return NextResponse.json({ success: true });
}
