import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { 
      message, 
      conversationHistory, 
      customerName, 
      amount, 
      dueDate,
      callStage 
    } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build the system prompt for debt collection
    const systemPrompt = `You are Sarah, a professional debt collection agent from First National Bank. You are calling about an overdue credit card payment.

IMPORTANT GUIDELINES:
- Be polite, professional, and empathetic
- Never be aggressive or threatening
- Focus on helping the customer resolve their debt
- Offer flexible payment options
- Handle objections gracefully
- Follow debt collection compliance rules
- Keep responses concise and natural for voice conversation

CUSTOMER INFORMATION:
- Customer Name: ${customerName || 'Account Holder'}
- Outstanding Amount: $${amount || 1500}
- Due Date: ${dueDate || 'March 15th'}

CURRENT CALL STAGE: ${callStage || 'greeting'}

PAYMENT OPTIONS AVAILABLE:
1. Full payment today: $${amount || 1500}
2. 2 equal payments: $${Math.round((amount || 1500) / 2)} each over 30 days
3. 3 equal payments: $${Math.round((amount || 1500) / 3)} each over 60 days

CONVERSATION HISTORY:
${conversationHistory?.map((entry: any) => 
  `${entry.role === 'user' ? 'Customer' : 'Agent'}: ${entry.content}`
).join('\n') || 'No previous conversation'}

Respond naturally as if you're having a real phone conversation. Keep your response under 2-3 sentences for natural flow.`;

    // Create the conversation with Anthropic
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-1-20250805',
      max_tokens: 150,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    });

    const aiResponse = response.content[0]?.type === 'text' 
      ? response.content[0].text 
      : 'I apologize, but I need to connect you with a human representative.';

    return NextResponse.json({
      success: true,
      response: aiResponse,
      usage: {
        inputTokens: response.usage?.input_tokens,
        outputTokens: response.usage?.output_tokens
      }
    });

  } catch (error) {
    console.error('Error in AI conversation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process conversation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
