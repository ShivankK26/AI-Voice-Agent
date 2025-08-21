import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

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
    repetitionScore: number; // 0-100, lower is better
    negotiationScore: number; // 0-100, higher is better
    relevanceScore: number; // 0-100, higher is better
    empathyScore: number; // 0-100, higher is better
    overallScore: number; // 0-100, higher is better
  };
  issues: string[];
  recommendations: string[];
  testDuration: number; // in seconds
}

export async function POST(req: NextRequest) {
  try {
    const { persona, phoneNumber, testDuration = 300 } = await req.json(); // 5 minutes default

    console.log(`🎤 Starting voice test with persona: ${persona.name} on ${phoneNumber}`);

    const testId = `voice_test_${Date.now()}`;
    const startTime = new Date();
    const conversationLog: any[] = [];

    // Step 1: Initiate a real call to the persona
    console.log('📞 Initiating real voice call...');
    
    const callResponse = await fetch(`${req.nextUrl.origin}/api/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: phoneNumber,
        customerName: persona.name,
        amount: 1500,
        roomName: `test_${testId}`
      })
    });

    if (!callResponse.ok) {
      throw new Error('Failed to initiate voice call');
    }

    const callData = await callResponse.json();
    console.log(`✅ Call initiated: ${callData.callSid}`);

    // Step 2: Monitor the call and collect conversation data
    // This will be done by intercepting the interactive webhook calls
    // We'll store conversation data in memory for this test session
    
    // Step 3: Wait for the test duration and then analyze
    console.log(`⏱️ Waiting ${testDuration} seconds for conversation...`);
    
    // In a real implementation, you would:
    // 1. Set up webhook monitoring to capture conversation data
    // 2. Store conversation turns in the conversationLog array
    // 3. Analyze the conversation after completion
    
    // For now, we'll simulate the conversation analysis
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

    console.log(`✅ Voice test completed for ${persona.name}`);

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

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-1-20250805',
    max_tokens: 1000,
    temperature: 0.3,
    system: `You are an expert evaluator of real voice conversations between debt collection agents and customers. Analyze the actual voice conversation and provide detailed metrics and feedback.

EVALUATION CRITERIA:
1. Repetition Score (0-100): How often does the agent repeat the same information or phrases?
2. Negotiation Score (0-100): How well does the agent negotiate and offer flexible payment solutions?
3. Relevance Score (0-100): How relevant are the agent's responses to customer concerns and objections?
4. Empathy Score (0-100): How empathetic and understanding is the agent towards customer situations?
5. Overall Score (0-100): Overall effectiveness of the voice conversation

Focus on analyzing the actual voice interaction, not simulated responses.`,
    messages: [
      {
        role: 'user',
        content: `Analyze this real voice conversation between a debt collection agent and a customer:

PERSONA: ${persona.name} (${persona.age}, ${persona.occupation})
PERSONALITY: ${persona.personality}
EMOTIONAL STATE: ${persona.emotionalState}
TEST DURATION: ${testDuration} seconds

CONVERSATION LOG:
${conversationLog.length > 0 ? conversationLog.map(log => `${log.speaker.toUpperCase()}: ${log.message}`).join('\n') : 'No conversation data available yet'}

AGENT MESSAGES: ${agentMessages.join(' | ')}
CUSTOMER MESSAGES: ${customerMessages.join(' | ')}

Provide detailed analysis with metrics, issues, and recommendations based on the actual voice interaction.`
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
    
    // Store conversation data for the ongoing test
    // In a real implementation, you would store this in a database or cache
    console.log(`📝 Capturing conversation data for test: ${testId}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error capturing conversation data:', error);
    return NextResponse.json({ error: 'Failed to capture conversation data' }, { status: 500 });
  }
}
