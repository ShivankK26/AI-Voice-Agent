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

    // Validate phone number format (US numbers)
    const phoneRegex = /^\+1\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Please provide a valid US phone number in format +1XXXXXXXXXX' },
        { status: 400 }
      );
    }

    // Create a unique room name for this call
    const callRoomName = roomName || `debt-collection-${Date.now()}`;
    
    // Create TwiML for the call
    const twiml = new twilio.twiml.VoiceResponse();
    
    // Connect the call to LiveKit SIP
    twiml.say({
      voice: 'alice'
    }, 'Connecting you to our debt collection agent.');
    
    // Connect to LiveKit SIP endpoint
    twiml.sip({
      username: process.env.LIVEKIT_API_KEY,
      password: process.env.LIVEKIT_API_SECRET,
      url: `sip:${process.env.SIP_URL?.replace('sip:', '')}?room=${callRoomName}&identity=debt-collection-agent`
    });

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
