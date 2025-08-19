import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Extract recording information from Twilio webhook
    const callSid = formData.get('CallSid') as string;
    const recordingSid = formData.get('RecordingSid') as string;
    const recordingStatus = formData.get('RecordingStatus') as string;
    const recordingUrl = formData.get('RecordingUrl') as string;
    const recordingDuration = formData.get('RecordingDuration') as string;
    const timestamp = formData.get('Timestamp') as string;

    console.log('Recording Status Update:', {
      callSid,
      recordingSid,
      recordingStatus,
      recordingUrl,
      recordingDuration,
      timestamp
    });

    // Handle recording status
    if (recordingStatus === 'completed') {
      console.log(`Recording ${recordingSid} completed for call ${callSid}`);
      console.log(`Recording URL: ${recordingUrl}`);
      console.log(`Recording Duration: ${recordingDuration} seconds`);
      
      // Here you could:
      // 1. Store the recording URL in your database
      // 2. Send it to your analytics system
      // 3. Process the recording for compliance
      // 4. Send notifications to supervisors
    }

    // Return TwiML response (required by Twilio)
    const response = new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <!-- Recording webhook processed -->
      </Response>`,
      {
        headers: {
          'Content-Type': 'application/xml',
        },
      }
    );

    return response;

  } catch (error) {
    console.error('Error processing recording webhook:', error);
    
    // Return error response
    const response = new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <!-- Error processing recording webhook -->
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
