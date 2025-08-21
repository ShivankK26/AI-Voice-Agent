import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  console.log('🎤 INTERACTIVE WEBHOOK RECEIVED');
  
  try {
    const formData = await req.formData();
    const speechResult = formData.get('SpeechResult') as string;
    const confidence = formData.get('Confidence') as string;
    const callSid = formData.get('CallSid') as string;

    console.log('📝 SPEECH DATA:', {
      speechResult,
      confidence,
      callSid,
      timestamp: new Date().toISOString()
    });

    // Create TwiML response
    const twiml = new twilio.twiml.VoiceResponse();

    if (speechResult && parseFloat(confidence) > 0.3) {
      // User spoke and we understood them
      console.log('✅ Speech detected:', speechResult);
      
      try {
        // Get AI response from Claude
        const response = await anthropic.messages.create({
          model: 'claude-opus-4-1-20250805',
          max_tokens: 200,
          temperature: 0.7,
          system: `You are Sarah, a professional debt collection agent from First National Bank. You are calling about an overdue credit card payment of $1,250.00. Be polite, professional, and helpful. Keep responses concise and natural for phone conversation. Don't be too pushy, but be firm about the payment.`,
          messages: [
            {
              role: 'user',
              content: `Customer said: "${speechResult}". Respond naturally as a debt collection agent. Keep your response under 2 sentences.`
            }
          ]
        });

        const aiResponse = response.content[0]?.type === 'text' ? response.content[0].text : 'I understand. Let me help you with payment options.';

        console.log('🤖 AI RESPONSE:', aiResponse);

        // Speak the AI response
        twiml.say({
          voice: 'alice',
          language: 'en-US'
        }, aiResponse);
        
        // Continue conversation
        const gather = twiml.gather({
          input: ['speech'],
          timeout: 8,
          speechTimeout: 'auto',
          action: 'https://b2048dbae7ec.ngrok-free.app/api/call/interactive',
          method: 'POST'
        });

        gather.say({
          voice: 'alice',
          language: 'en-US'
        }, 'Please let me know your preference for payment arrangements.');

      } catch (aiError) {
        console.error('🤖 AI ERROR:', aiError);
        
        // Fallback response if AI fails
        twiml.say({
          voice: 'alice',
          language: 'en-US'
        }, 'I understand you said: ' + speechResult + '. Let me help you with payment options for your outstanding balance of $1,250.00. We can arrange for a full payment or set up a payment plan. What would you prefer?');
        
        // Continue conversation
        const gather = twiml.gather({
          input: ['speech'],
          timeout: 8,
          speechTimeout: 'auto',
          action: 'https://b2048dbae7ec.ngrok-free.app/api/call/interactive',
          method: 'POST'
        });

        gather.say({
          voice: 'alice',
          language: 'en-US'
        }, 'Please let me know your preference for payment arrangements.');
      }

    } else {
      // No speech detected
      console.log('❌ No speech detected or low confidence');
      
      twiml.say({
        voice: 'alice',
        language: 'en-US'
      }, 'I didn\'t catch that clearly. You have an outstanding balance of $1,250.00. Would you like to make a full payment or set up a payment plan?');
      
      // Try again
      const gather = twiml.gather({
        input: ['speech'],
        timeout: 8,
        speechTimeout: 'auto',
        action: 'https://b2048dbae7ec.ngrok-free.app/api/call/interactive',
        method: 'POST'
      });

      gather.say({
        voice: 'alice',
        language: 'en-US'
      }, 'Please let me know how you would like to proceed.');
    }

    // End call gracefully
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, 'Thank you for your time. Please call us back when you are ready to discuss payment arrangements. Have a great day.');

    console.log('📤 SENDING TWIML RESPONSE');
    
    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'application/xml',
      },
    });

  } catch (error) {
    console.error('💥 ERROR IN INTERACTIVE CALL:', error);
    
    // Simple fallback response
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, 'I apologize for the technical difficulties. Please call us back later. Thank you.');
    
    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}
