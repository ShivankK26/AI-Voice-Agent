import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// Initialize Twilio client
const client = twilio(
  process.env.ACCOUNT_SID!,
  process.env.AUTH_TOKEN!
);

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, customerName, amount, roomName } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate phone number format (International numbers)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Please provide a valid international phone number in format +[country code][number]' },
        { status: 400 }
      );
    }

    // Create a unique room name for this call
    const callRoomName = roomName || `debt-collection-${Date.now()}`;
    
    // Create TwiML for the call
    const twiml = new twilio.twiml.VoiceResponse();
    
    // Welcome message
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, 'Hello, this is Sarah from First National Bank. I am calling regarding your overdue credit card payment of $1,250.00. May I speak with you?');
    
    // Add a pause for response
    twiml.pause({ length: 2 });
    
    // Continue with debt collection script
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, 'I understand this may be a difficult situation. We have several payment options available to help you resolve this account. Would you like to discuss payment arrangements?');

    // Make the outbound call using Twilio
    const call = await client.calls.create({
      twiml: twiml.toString(),
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER!,
      statusCallback: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/call/status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST',
      record: true,
      recordingStatusCallback: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/call/recording`,
      recordingStatusCallbackEvent: ['completed']
    });

    return NextResponse.json({
      success: true,
      callSid: call.sid,
      roomName: callRoomName,
      status: call.status,
      message: `Call initiated to ${phoneNumber}`
    });

  } catch (error) {
    console.error('Error making outbound call:', error);
    return NextResponse.json(
      { error: 'Failed to initiate call', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Handle call status updates
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const callSid = searchParams.get('callSid');

    if (!callSid) {
      return NextResponse.json(
        { error: 'Call SID is required' },
        { status: 400 }
      );
    }

    // Get call details from Twilio
    const call = await client.calls(callSid).fetch();

    return NextResponse.json({
      callSid: call.sid,
      status: call.status,
      duration: call.duration,
      startTime: call.startTime,
      endTime: call.endTime,
      from: call.from,
      to: call.to,
      price: call.price,
      priceUnit: call.priceUnit
    });

  } catch (error) {
    console.error('Error fetching call status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call status' },
      { status: 500 }
    );
  }
}
