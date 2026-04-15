/**
 * Mock Analytics Metrics Endpoint
 * Prevents 404 errors in console
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    totalInteractions: 0,
    avgResponseTime: 0,
    satisfactionScore: 0,
    topIntents: [],
  });
}
