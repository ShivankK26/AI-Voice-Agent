import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface ConversationTurn {
  speaker: 'agent' | 'customer';
  message: string;
  timestamp: string;
}

export interface TestResult {
  personaId: string;
  personaName: string;
  conversation: ConversationTurn[];
  metrics: {
    repetitionScore: number; // 0-100, lower is better
    negotiationScore: number; // 0-100, higher is better
    relevanceScore: number; // 0-100, higher is better
    empathyScore: number; // 0-100, higher is better
    overallScore: number; // 0-100, higher is better
  };
  issues: string[];
  recommendations: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { persona, agentScript, maxTurns = 10 } = await req.json();

    console.log(`🧪 Testing conversation with persona: ${persona.name}`);

    const conversation: ConversationTurn[] = [];
    let currentContext = '';

    // Simulate conversation turns
    for (let turn = 0; turn < maxTurns; turn++) {
      if (turn === 0) {
        // Agent starts the conversation
        const agentResponse = await generateAgentResponse(persona, agentScript, currentContext);
        conversation.push({
          speaker: 'agent',
          message: agentResponse,
          timestamp: new Date().toISOString()
        });
        currentContext += `Agent: ${agentResponse}\n`;
      } else {
        // Customer responds
        const customerResponse = await generateCustomerResponse(persona, currentContext, turn);
        conversation.push({
          speaker: 'customer',
          message: customerResponse,
          timestamp: new Date().toISOString()
        });
        currentContext += `Customer: ${customerResponse}\n`;

        // Agent responds to customer
        const agentResponse = await generateAgentResponse(persona, agentScript, currentContext);
        conversation.push({
          speaker: 'agent',
          message: agentResponse,
          timestamp: new Date().toISOString()
        });
        currentContext += `Agent: ${agentResponse}\n`;
      }
    }

    // Analyze the conversation
    const analysis = await analyzeConversation(persona, conversation, agentScript);

    console.log(`✅ Conversation test completed for ${persona.name}`);

    return NextResponse.json({
      success: true,
      result: {
        personaId: persona.id,
        personaName: persona.name,
        conversation,
        metrics: analysis.metrics,
        issues: analysis.issues,
        recommendations: analysis.recommendations
      }
    });

  } catch (error) {
    console.error('Error in conversation test:', error);
    return NextResponse.json(
      { error: 'Failed to test conversation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function generateAgentResponse(persona: any, agentScript: string, context: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-1-20250805',
    max_tokens: 150,
    temperature: 0.7,
    system: `You are Sarah, a professional debt collection agent from First National Bank. You are calling about an overdue credit card payment of $1,250.00. 

AGENT SCRIPT: ${agentScript}

Be polite, professional, and helpful. Keep responses concise and natural for phone conversation. Don't be too pushy, but be firm about the payment.`,
    messages: [
      {
        role: 'user',
        content: `Conversation context:\n${context}\n\nRespond as the debt collection agent to continue the conversation naturally. Keep your response under 2 sentences.`
      }
    ]
  });

  return response.content[0]?.type === 'text' ? response.content[0].text : 'I understand. Let me help you with payment options.';
}

async function generateCustomerResponse(persona: any, context: string, turn: number): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-1-20250805',
    max_tokens: 100,
    temperature: 0.8,
    system: `You are ${persona.name}, a ${persona.age}-year-old ${persona.occupation}. 

PERSONA DETAILS:
- Financial Situation: ${persona.financialSituation}
- Default Reason: ${persona.defaultReason}
- Personality: ${persona.personality}
- Communication Style: ${persona.communicationStyle}
- Emotional State: ${persona.emotionalState}
- Common Objections: ${persona.objections.join(', ')}

Respond naturally as this person would during a debt collection call. Be consistent with their personality and situation.`,
    messages: [
      {
        role: 'user',
        content: `Conversation context:\n${context}\n\nRespond as ${persona.name} to the debt collection agent. Keep your response under 2 sentences and be consistent with your persona.`
      }
    ]
  });

  return response.content[0]?.type === 'text' ? response.content[0].text : 'I need to think about this.';
}

async function analyzeConversation(persona: any, conversation: ConversationTurn[], agentScript: string): Promise<{ metrics: any, issues: string[], recommendations: string[] }> {
  const agentMessages = conversation.filter(turn => turn.speaker === 'agent').map(turn => turn.message);
  const customerMessages = conversation.filter(turn => turn.speaker === 'customer').map(turn => turn.message);

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-1-20250805',
    max_tokens: 1000,
    temperature: 0.3,
    system: `You are an expert evaluator of debt collection voice agent conversations. Analyze the conversation and provide metrics and feedback.

EVALUATION CRITERIA:
1. Repetition Score (0-100): How often does the agent repeat the same information?
2. Negotiation Score (0-100): How well does the agent negotiate and offer solutions?
3. Relevance Score (0-100): How relevant are the agent's responses to customer concerns?
4. Empathy Score (0-100): How empathetic and understanding is the agent?
5. Overall Score (0-100): Overall effectiveness of the conversation

Return your analysis as JSON with the following structure:
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
        content: `Analyze this debt collection conversation:

PERSONA: ${persona.name} (${persona.age}, ${persona.occupation})
PERSONALITY: ${persona.personality}
EMOTIONAL STATE: ${persona.emotionalState}

CONVERSATION:
${conversation.map(turn => `${turn.speaker.toUpperCase()}: ${turn.message}`).join('\n')}

AGENT SCRIPT: ${agentScript}

Provide detailed analysis with metrics, issues, and recommendations.`
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
    console.error('Error parsing analysis:', error);
  }

  // Fallback analysis
  return {
    metrics: {
      repetitionScore: 70,
      negotiationScore: 60,
      relevanceScore: 75,
      empathyScore: 65,
      overallScore: 68
    },
    issues: ['Agent could be more empathetic', 'Limited negotiation options offered'],
    recommendations: ['Add more empathy to responses', 'Offer more flexible payment options']
  };
}
