import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    status: 'ready'
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Test webhook received:', body);
    
    return NextResponse.json({ 
      message: 'Test webhook received successfully',
      received: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json({ error: 'Failed to process test webhook' }, { status: 500 });
  }
}

