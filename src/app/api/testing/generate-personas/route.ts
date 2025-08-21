import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface Persona {
  id: string;
  name: string;
  age: number;
  occupation: string;
  financialSituation: string;
  defaultReason: string;
  personality: string;
  communicationStyle: string;
  objections: string[];
  emotionalState: string;
  conversationScript: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { count = 5 } = await req.json();

    console.log('🎭 Generating loan defaulter personas for testing...');

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-1-20250805',
      max_tokens: 2000,
      temperature: 0.8,
      system: `You are an expert in creating realistic loan defaulter personas for testing debt collection voice agents. Generate diverse personas with different backgrounds, reasons for defaulting, and communication styles.

Each persona should include:
- Realistic personal details (name, age, occupation)
- Financial situation and reason for defaulting
- Personality traits and communication style
- Common objections they would raise
- Emotional state during debt collection calls
- Sample conversation responses they would give

Make the personas diverse and realistic to thoroughly test the voice agent's capabilities.`,
      messages: [
        {
          role: 'user',
          content: `Generate ${count} diverse loan defaulter personas for testing a debt collection voice agent. Return the response as a valid JSON array with each persona having the following structure:
{
  "id": "unique_id",
  "name": "Full Name",
  "age": number,
  "occupation": "job title",
  "financialSituation": "description of current financial state",
  "defaultReason": "why they defaulted on the loan",
  "personality": "personality traits",
  "communicationStyle": "how they communicate",
  "objections": ["objection1", "objection2", "objection3"],
  "emotionalState": "emotional state during calls",
  "conversationScript": ["response1", "response2", "response3"]
}`
        }
      ]
    });

    const aiResponse = response.content[0]?.type === 'text' ? response.content[0].text : '';
    
    // Parse the JSON response
    let personas: Persona[];
    try {
      // Extract JSON from the response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        personas = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing personas:', parseError);
      // Fallback personas
      personas = generateFallbackPersonas(count);
    }

    console.log(`✅ Generated ${personas.length} personas for testing`);

    return NextResponse.json({
      success: true,
      personas,
      count: personas.length
    });

  } catch (error) {
    console.error('Error generating personas:', error);
    return NextResponse.json(
      { error: 'Failed to generate personas', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function generateFallbackPersonas(count: number): Persona[] {
  const basePersonas: Persona[] = [
    {
      id: 'persona_1',
      name: 'John Smith',
      age: 35,
      occupation: 'Construction Worker',
      financialSituation: 'Recently laid off, struggling with bills',
      defaultReason: 'Lost job due to construction slowdown',
      personality: 'Frustrated but willing to work things out',
      communicationStyle: 'Direct and honest',
      objections: ['I don\'t have the money right now', 'Can you give me more time?', 'I\'m looking for work'],
      emotionalState: 'Stressed but cooperative',
      conversationScript: ['I understand I owe money, but I\'m in a tough spot', 'I\'m actively looking for work', 'Can we work out a payment plan?']
    },
    {
      id: 'persona_2',
      name: 'Maria Rodriguez',
      age: 28,
      occupation: 'Single Mother',
      financialSituation: 'Living paycheck to paycheck with medical bills',
      defaultReason: 'Medical emergency for child',
      personality: 'Defensive and overwhelmed',
      communicationStyle: 'Emotional and sometimes confrontational',
      objections: ['I have to take care of my kids first', 'Medical bills are more important', 'You don\'t understand my situation'],
      emotionalState: 'Overwhelmed and defensive',
      conversationScript: ['My child\'s health comes first', 'I\'m doing the best I can', 'You\'re not being fair to me']
    },
    {
      id: 'persona_3',
      name: 'David Chen',
      age: 42,
      occupation: 'Small Business Owner',
      financialSituation: 'Business struggling, personal finances mixed with business',
      defaultReason: 'Business downturn affecting personal finances',
      personality: 'Prideful but realistic about situation',
      communicationStyle: 'Professional but frustrated',
      objections: ['My business is struggling', 'I\'m working on turning things around', 'Can you work with me on this?'],
      emotionalState: 'Frustrated but hopeful',
      conversationScript: ['I\'m working hard to turn my business around', 'I want to pay this debt', 'Can we find a solution that works for both of us?']
    }
  ];

  return basePersonas.slice(0, Math.min(count, basePersonas.length));
}
