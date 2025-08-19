import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const speechResult = formData.get('SpeechResult') as string;
    const confidence = formData.get('Confidence') as string;
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;

    console.log('🎤 SPEECH RECEIVED:', {
      speechResult,
      confidence,
      callSid,
      callStatus,
      timestamp: new Date().toISOString()
    });

    // Create TwiML response
    const twiml = new twilio.twiml.VoiceResponse();

    if (speechResult && parseFloat(confidence) > 0.3) {
      // User spoke and we understood them (lowered confidence threshold)
      try {
        // Get AI response from Claude
        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
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

        // Continue the conversation
        const gather = twiml.gather({
          input: ['speech'],
          timeout: 8,
          speechTimeout: 'auto',
          action: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/call/interactive`,
          method: 'POST',
          actionOnEmptyResult: true
        });

        gather.say({
          voice: 'alice',
          language: 'en-US'
        }, 'Please let me know if you have any questions about payment arrangements.');

        // End call if no response
        twiml.say({
          voice: 'alice',
          language: 'en-US'
        }, 'Thank you for your time. Please call us back when you are ready to discuss payment arrangements. Have a great day.');

      } catch (aiError) {
        console.error('AI Error:', aiError);
        twiml.say({
          voice: 'alice',
          language: 'en-US'
        }, 'I apologize for the technical difficulties. Please call us back later. Thank you.');
      }
    } else {
      // No speech detected or low confidence
      twiml.say({
        voice: 'alice',
        language: 'en-US'
      }, 'I didn\'t catch that. Could you please repeat? We have several payment options available to help you resolve your account.');
      
      // Try to gather input again
      const gather = twiml.gather({
        input: ['speech'],
        timeout: 8,
        speechTimeout: 'auto',
        action: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/call/interactive`,
        method: 'POST',
        actionOnEmptyResult: true
      });

      gather.say({
        voice: 'alice',
        language: 'en-US'
      }, 'Please let me know if you would like to discuss payment arrangements.');

      // End call if no response
      twiml.say({
        voice: 'alice',
        language: 'en-US'
      }, 'Thank you for your time. Please call us back when you are ready to discuss payment arrangements. Have a great day.');
    }

    return new NextResponse(twiml.toString(), {
      headers: {
        'Content-Type': 'application/xml',
      },
    });

  } catch (error) {
    console.error('Error in interactive call:', error);
    
    // Fallback response
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
