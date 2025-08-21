import { NextRequest, NextResponse } from 'next/server';
import { testTracker } from '../../lib/test-tracker';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const testId = searchParams.get('testId');
    const callSid = searchParams.get('callSid');

    console.log('🔍 TestTracker Debug:', { action, testId, callSid });

    switch (action) {
      case 'start':
        if (testId) {
          testTracker.startTest(testId);
          return NextResponse.json({ 
            success: true, 
            message: `Started test: ${testId}`,
            activeTests: testTracker.getActiveTests()
          });
        }
        break;

      case 'map':
        if (testId && callSid) {
          testTracker.mapCallToTest(callSid, testId);
          return NextResponse.json({ 
            success: true, 
            message: `Mapped call ${callSid} to test ${testId}`,
            isTracked: testTracker.isCallTracked(callSid)
          });
        }
        break;

      case 'check':
        if (callSid) {
          return NextResponse.json({ 
            success: true, 
            isTracked: testTracker.isCallTracked(callSid),
            activeTests: testTracker.getActiveTests()
          });
        }
        break;

      case 'status':
        return NextResponse.json({ 
          success: true, 
          activeTests: testTracker.getActiveTests(),
          trackerType: typeof testTracker
        });
        break;

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action. Use: start, map, check, or status' 
        });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Missing parameters' 
    });

  } catch (error) {
    console.error('TestTracker Debug Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
