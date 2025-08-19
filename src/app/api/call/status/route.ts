import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Extract call information from Twilio webhook
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const callDuration = formData.get('CallDuration') as string;
    const timestamp = formData.get('Timestamp') as string;

    console.log('Call Status Update:', {
      callSid,
      callStatus,
      from,
      to,
      callDuration,
      timestamp
    });

    // Handle different call statuses
    switch (callStatus) {
      case 'initiated':
        console.log(`Call ${callSid} initiated to ${to}`);
        break;
      case 'ringing':
        console.log(`Call ${callSid} is ringing at ${to}`);
        break;
      case 'answered':
        console.log(`Call ${callSid} was answered by ${to}`);
        break;
      case 'completed':
        console.log(`Call ${callSid} completed. Duration: ${callDuration} seconds`);
        break;
      case 'failed':
        console.log(`Call ${callSid} failed`);
        break;
      case 'busy':
        console.log(`Call ${callSid} - number ${to} is busy`);
        break;
      case 'no-answer':
        console.log(`Call ${callSid} - no answer from ${to}`);
        break;
      default:
        console.log(`Call ${callSid} status: ${callStatus}`);
    }

    // Return TwiML response (required by Twilio)
    const response = new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <!-- Status webhook processed -->
      </Response>`,
      {
        headers: {
          'Content-Type': 'application/xml',
        },
      }
    );

    return response;

  } catch (error) {
    console.error('Error processing call status webhook:', error);
    
    // Return error response
    const response = new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <!-- Error processing webhook -->
      </Response>`,
      {
        status: 500,
        headers: {
          'Content-Type': 'application/xml',
        },
      }
    );

    return response;
  }
}
