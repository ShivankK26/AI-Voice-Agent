import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const client = twilio(process.env.ACCOUNT_SID!, process.env.AUTH_TOKEN!);

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber } = await req.json();
    
    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    console.log('🧪 SIMPLE TEST CALL to:', phoneNumber);

    // Create a very simple TwiML
    const twiml = new twilio.twiml.VoiceResponse();
    
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, 'Hello! This is a simple test call. If you can hear this, the basic call system is working.');

    // Make the call
    const call = await client.calls.create({
      twiml: twiml.toString(),
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER!,
      statusCallback: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://19601fac91e0.ngrok-free.app'}/api/call/status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST'
    });

    console.log('✅ Simple test call created:', call.sid);

    return NextResponse.json({
      success: true,
      callSid: call.sid,
      status: call.status,
      message: 'Simple test call initiated'
    });

  } catch (error) {
    console.error('❌ Simple test call error:', error);
    return NextResponse.json(
      { error: 'Failed to make test call', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
