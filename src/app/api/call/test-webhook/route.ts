import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    console.log('🧪 WEBHOOK TEST RECEIVED:', {
      formData: Object.fromEntries(formData.entries()),
      timestamp: new Date().toISOString()
    });

    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, 'Webhook test successful! The interactive system is working.');

    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'application/xml',
      },
    });

  } catch (error) {
    console.error('Webhook test error:', error);
    return NextResponse.json({ error: 'Webhook test failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    status: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString()
  });
}
