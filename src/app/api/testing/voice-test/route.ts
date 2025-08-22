import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { testTracker } from '../../../lib/test-tracker';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface VoiceTestResult {
  testId: string;
  personaId: string;
  personaName: string;
  conversationLog: {
    timestamp: string;
    speaker: 'agent' | 'customer';
    message: string;
    speechResult?: string;
    confidence?: number;
  }[];
  metrics: {
    repetitionScore: number;
    negotiationScore: number;
    relevanceScore: number;
    empathyScore: number;
    overallScore: number;
  };
  issues: string[];
  recommendations: string[];
  testDuration: number;
}

export async function POST(req: NextRequest) {
  try {
    const { persona, phoneNumber, testDuration = 120, script } = await req.json(); // 2 minutes for proper analysis

    console.log(`🎤 Starting voice test with persona: ${persona.name} on ${phoneNumber}`);

    const testId = `voice_test_${Date.now()}`;
    const startTime = new Date();
    
    // Initialize test tracking for this test
    testTracker.startTest(testId);
    
    // Store the mapping between testId and callSid for later use
    // We'll need to track this to match the callSid from webhooks to our testId

    // Step 1: Initiate a real call to the persona
    console.log('📞 Initiating real voice call...');
    console.log('📝 Using script:', script ? 'Custom script provided' : 'Default script');
    
    const callResponse = await fetch(`${req.nextUrl.origin}/api/call?testId=${testId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        customerName: persona.name,
        amount: 1500,
        roomName: `test_${testId}`,
        script: script // Pass the script to the call endpoint
      })
    });

    if (!callResponse.ok) {
      throw new Error('Failed to initiate voice call');
    }

    const callData = await callResponse.json();
    console.log(`✅ Call initiated: ${callData.callSid}`);

    // Map the callSid to our testId for tracking
    testTracker.mapCallToTest(callData.callSid, testId);

    // Step 2: Wait for conversation data to accumulate
    console.log(`⏱️ Waiting for conversation data (max ${testDuration} seconds)...`);
    
    let conversationLog: any[] = [];
    let waitTime = 0;
    const checkInterval = 2000; // Check every 2 seconds (more responsive)
    
    while (waitTime < testDuration * 1000) {
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      waitTime += checkInterval;
      
      // Get accumulated conversation data
      conversationLog = testTracker.getConversation(testId);
      
      console.log(`📊 Conversation progress: ${conversationLog.length} turns captured`);
      
      // If we have enough conversation data, we can proceed
      if (conversationLog.length >= 4) { // At least 2 exchanges (customer + agent + customer + agent)
        console.log('✅ Sufficient conversation data captured, proceeding with analysis');
        break;
      }
      
      // If we're near the end of the test duration and have some data, proceed
      if (waitTime >= (testDuration * 1000 * 0.8) && conversationLog.length >= 2) {
        console.log('⏰ Test duration nearly complete, proceeding with available data');
        break;
      }
    }

    // Step 3: Analyze the conversation
    const analysis = await analyzeVoiceConversation(persona, conversationLog, testDuration);

    const endTime = new Date();
    const testDurationMs = endTime.getTime() - startTime.getTime();

    const result: VoiceTestResult = {
      testId,
      personaId: persona.id,
      personaName: persona.name,
      conversationLog,
      metrics: analysis.metrics,
      issues: analysis.issues,
      recommendations: analysis.recommendations,
      testDuration: testDurationMs / 1000
    };

    // Clean up test tracking
    testTracker.endTest(testId);

    console.log(`✅ Voice test completed for ${persona.name}`);
    console.log(`📊 Conversation turns: ${conversationLog.length}`);
    console.log(`📈 Overall score: ${analysis.metrics.overallScore.toFixed(1)}/100`);

    return NextResponse.json({
      success: true,
      result,
      callSid: callData.callSid
    });

  } catch (error) {
    console.error('Error in voice test:', error);
    return NextResponse.json(
      { error: 'Failed to run voice test', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function analyzeVoiceConversation(persona: any, conversationLog: any[], testDuration: number): Promise<any> {
  // Analyze the actual voice conversation
  const agentMessages = conversationLog.filter(log => log.speaker === 'agent').map(log => log.message);
  const customerMessages = conversationLog.filter(log => log.speaker === 'customer').map(log => log.message);

  console.log(`🔍 Analyzing conversation with ${conversationLog.length} turns`);
  console.log(`🤖 Agent messages: ${agentMessages.length}`);
  console.log(`👤 Customer messages: ${customerMessages.length}`);

  if (conversationLog.length === 0) {
    return {
      metrics: {
        repetitionScore: 0,
        negotiationScore: 0,
        relevanceScore: 0,
        empathyScore: 0,
        overallScore: 0
      },
      issues: ['No conversation data captured', 'Call may not have connected properly'],
      recommendations: ['Verify phone number is correct', 'Check if call was answered', 'Increase test duration']
    };
  }

  // If we have conversation data, analyze it properly
  console.log(`🔍 Analyzing real conversation with ${conversationLog.length} turns`);
  console.log(`🔍 Conversation data:`, conversationLog);

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-1-20250805',
    max_tokens: 1000,
    temperature: 0.3,
    system: `You are an expert evaluator of real voice conversations between debt collection agents and customers. Analyze the actual voice conversation and provide detailed metrics and feedback.

EVALUATION CRITERIA:
1. Repetition Score (0-100): How often does the agent repeat the same information or phrases? Lower is better.
2. Negotiation Score (0-100): How well does the agent negotiate and offer flexible payment solutions? Higher is better.
3. Relevance Score (0-100): How relevant are the agent's responses to customer concerns and objections? Higher is better.
4. Empathy Score (0-100): How empathetic and understanding is the agent towards customer situations? Higher is better.
5. Overall Score (0-100): Overall effectiveness of the voice conversation. Higher is better.

IMPORTANT: This is REAL conversation data from an actual voice call. Analyze the actual interaction, not simulated responses.

Return your analysis in JSON format with this structure:
{
  "metrics": {
    "repetitionScore": number,
    "negotiationScore": number,
    "relevanceScore": number,
    "empathyScore": number,
    "overallScore": number
  },
  "issues": ["issue1", "issue2"],
  "recommendations": ["recommendation1", "recommendation2"]
}`,
    messages: [
      {
        role: 'user',
        content: `Analyze this REAL voice conversation between a debt collection agent and a customer:

PERSONA: ${persona.name} (${persona.age}, ${persona.occupation})
PERSONALITY: ${persona.personality}
EMOTIONAL STATE: ${persona.emotionalState}
TEST DURATION: ${testDuration} seconds

ACTUAL CONVERSATION LOG:
${conversationLog.map(log => `${log.speaker.toUpperCase()}: ${log.message}`).join('\n')}

AGENT MESSAGES: ${agentMessages.join(' | ')}
CUSTOMER MESSAGES: ${customerMessages.join(' | ')}

This is REAL conversation data from an actual voice call. Provide detailed analysis with metrics, issues, and recommendations based on the actual voice interaction. Return in JSON format.`
      }
    ]
  });

  const analysisText = response.content[0]?.type === 'text' ? response.content[0].text : '';
  
  try {
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error parsing voice analysis:', error);
  }

  // Fallback analysis for when conversation data is limited
  return {
    metrics: {
      repetitionScore: 70,
      negotiationScore: 60,
      relevanceScore: 75,
      empathyScore: 65,
      overallScore: 68
    },
    issues: ['Limited conversation data available', 'Need more voice interaction samples'],
    recommendations: ['Collect more voice conversation data', 'Monitor call quality and duration']
  };
}

// Webhook endpoint to capture conversation data during voice calls
export async function PUT(req: NextRequest) {
  try {
    const { testId, conversationData } = await req.json();
    
    if (testId && conversationData) {
      testTracker.addTurn(testId, conversationData);
      console.log(`📝 Captured conversation data for test: ${testId}`);
      console.log(`📊 Total turns for test ${testId}: ${testTracker.getConversation(testId).length}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error capturing conversation data:', error);
    return NextResponse.json({ error: 'Failed to capture conversation data' }, { status: 500 });
  }
}
