import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const envCheck = {
      // Twilio Configuration
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER ? '✅ Set' : '❌ Missing',
      ACCOUNT_SID: process.env.ACCOUNT_SID ? '✅ Set' : '❌ Missing',
      AUTH_TOKEN: process.env.AUTH_TOKEN ? '✅ Set' : '❌ Missing',
      
      // Webhook Configuration
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'https://19601fac91e0.ngrok-free.app',
      
      // Anthropic AI
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing',
      
      // LiveKit Configuration
      LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY ? '✅ Set' : '❌ Missing',
      LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET ? '✅ Set' : '❌ Missing',
      LIVEKIT_URL: process.env.LIVEKIT_URL ? '✅ Set' : '❌ Missing',
      
      timestamp: new Date().toISOString()
    };

    console.log('🔍 Environment Check:', envCheck);

    return NextResponse.json(envCheck);

  } catch (error) {
    console.error('Environment check error:', error);
    return NextResponse.json({ error: 'Environment check failed' }, { status: 500 });
  }
}
