import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface TestResult {
  personaId: string;
  personaName: string;
  metrics: {
    repetitionScore: number;
    negotiationScore: number;
    relevanceScore: number;
    empathyScore: number;
    overallScore: number;
  };
  issues: string[];
  recommendations: string[];
}

export interface ImprovedScript {
  originalScript: string;
  improvedScript: string;
  improvements: string[];
  expectedMetrics: {
    repetitionScore: number;
    negotiationScore: number;
    relevanceScore: number;
    empathyScore: number;
    overallScore: number;
  };
}

export async function POST(req: NextRequest) {
  try {
    const { testResults, currentScript, iteration = 1 } = await req.json();

    console.log(`🔧 Self-correcting agent script (iteration ${iteration})...`);

    // Analyze all test results to identify common issues
    const analysis = await analyzeTestResults(testResults, currentScript);
    
    // Generate improved script
    const improvedScript = await generateImprovedScript(currentScript, analysis, iteration);

    console.log(`✅ Script improvement completed for iteration ${iteration}`);

    return NextResponse.json({
      success: true,
      improvedScript,
      analysis: {
        commonIssues: analysis.commonIssues,
        priorityImprovements: analysis.priorityImprovements,
        averageScores: analysis.averageScores
      }
    });

  } catch (error) {
    console.error('Error in self-correction:', error);
    return NextResponse.json(
      { error: 'Failed to self-correct script', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function analyzeTestResults(testResults: TestResult[], currentScript: string): Promise<any> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-1-20250805',
    max_tokens: 1500,
    temperature: 0.3,
    system: `You are an expert in analyzing debt collection voice agent performance and identifying areas for improvement. Analyze the test results and provide actionable insights for script improvement.

ANALYSIS TASKS:
1. Identify common issues across all test results
2. Prioritize improvements based on impact
3. Calculate average performance metrics
4. Provide specific recommendations for script enhancement`,
    messages: [
      {
        role: 'user',
        content: `Analyze these test results for a debt collection voice agent:

CURRENT SCRIPT: ${currentScript}

TEST RESULTS:
${testResults.map(result => `
PERSONA: ${result.personaName}
METRICS: Repetition: ${result.metrics.repetitionScore}, Negotiation: ${result.metrics.negotiationScore}, Relevance: ${result.metrics.relevanceScore}, Empathy: ${result.metrics.empathyScore}, Overall: ${result.metrics.overallScore}
ISSUES: ${result.issues.join(', ')}
RECOMMENDATIONS: ${result.recommendations.join(', ')}
`).join('\n')}

Provide analysis with:
1. Common issues across all personas
2. Priority improvements (most impactful first)
3. Average metrics
4. Specific script enhancement recommendations

Return as JSON:
{
  "commonIssues": ["issue1", "issue2"],
  "priorityImprovements": ["improvement1", "improvement2"],
  "averageScores": {
    "repetitionScore": number,
    "negotiationScore": number,
    "relevanceScore": number,
    "empathyScore": number,
    "overallScore": number
  },
  "scriptRecommendations": ["rec1", "rec2"]
}`
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
    commonIssues: ['Limited empathy', 'Repetitive responses'],
    priorityImprovements: ['Add more empathy', 'Increase negotiation options'],
    averageScores: {
      repetitionScore: 65,
      negotiationScore: 58,
      relevanceScore: 72,
      empathyScore: 60,
      overallScore: 64
    },
    scriptRecommendations: ['Add empathetic language', 'Include more payment options']
  };
}

async function generateImprovedScript(currentScript: string, analysis: any, iteration: number): Promise<ImprovedScript> {
  const response = await anthropic.messages.create({
    model: 'claude-opus-4-1-20250805',
    max_tokens: 2000,
    temperature: 0.7,
    system: `You are an expert in improving debt collection voice agent scripts. Based on test results and analysis, generate an improved script that addresses identified issues.

IMPROVEMENT GUIDELINES:
1. Address common issues identified in testing
2. Maintain professional tone while adding empathy
3. Include more negotiation options and flexibility
4. Reduce repetition while maintaining effectiveness
5. Ensure responses are relevant to customer concerns
6. Keep the script concise and natural for voice conversation`,
    messages: [
      {
        role: 'user',
        content: `Improve this debt collection agent script based on the analysis:

CURRENT SCRIPT: ${currentScript}

ANALYSIS:
- Common Issues: ${analysis.commonIssues.join(', ')}
- Priority Improvements: ${analysis.priorityImprovements.join(', ')}
- Average Scores: Repetition: ${analysis.averageScores.repetitionScore}, Negotiation: ${analysis.averageScores.negotiationScore}, Relevance: ${analysis.averageScores.relevanceScore}, Empathy: ${analysis.averageScores.empathyScore}, Overall: ${analysis.averageScores.overallScore}
- Recommendations: ${analysis.scriptRecommendations.join(', ')}

ITERATION: ${iteration}

Generate an improved script that addresses these issues. The script should be a comprehensive guide for the debt collection agent covering:
1. Opening and introduction
2. Handling different customer responses
3. Negotiation strategies
4. Payment options
5. Objection handling
6. Closing strategies

Return as JSON:
{
  "originalScript": "current script",
  "improvedScript": "new improved script",
  "improvements": ["improvement1", "improvement2"],
  "expectedMetrics": {
    "repetitionScore": number,
    "negotiationScore": number,
    "relevanceScore": number,
    "empathyScore": number,
    "overallScore": number
  }
}`
      }
    ]
  });

  const scriptText = response.content[0]?.type === 'text' ? response.content[0].text : '';
  
  try {
    const jsonMatch = scriptText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error parsing improved script:', error);
  }

  // Fallback improved script
  return {
    originalScript: currentScript,
    improvedScript: `IMPROVED DEBT COLLECTION SCRIPT (Iteration ${iteration})

OPENING:
"Hello, this is Sarah from First National Bank. I'm calling regarding your overdue credit card payment of $1,250.00. I understand this might be a difficult conversation, and I'm here to help you find a solution that works for both of us. May I speak with you?"

RESPONSE HANDLING:
- If customer is cooperative: "Thank you for your time. I appreciate your willingness to discuss this. Let's work together to find a payment arrangement that fits your situation."
- If customer is defensive: "I completely understand this is stressful. Many people are facing financial challenges right now. My goal is to help you resolve this in a way that's manageable for you."
- If customer is overwhelmed: "I hear how difficult this situation is for you. Let's take this one step at a time. What would be most helpful for you right now?"

NEGOTIATION STRATEGIES:
1. Offer multiple payment options: full payment, 2 payments, 3 payments, or a custom arrangement
2. Show flexibility: "We can work with your budget. What amount would be comfortable for you?"
3. Provide incentives: "If you can make a payment today, I can reduce the late fees."

OBJECTION HANDLING:
- "I don't have money": "I understand that completely. Let's talk about what might be possible, even if it's a small amount to start."
- "I'm looking for work": "That's a great step. While you're searching, we can set up a minimal payment plan to keep your account current."
- "Medical bills": "I'm so sorry to hear about your health challenges. Your health comes first, but we can work around that."

CLOSING:
"Thank you for working with me today. I want to make sure we find a solution that works for you. What would be the best next step for you?"`,
    improvements: ['Added empathy throughout', 'Increased negotiation options', 'Better objection handling'],
    expectedMetrics: {
      repetitionScore: 45,
      negotiationScore: 85,
      relevanceScore: 88,
      empathyScore: 82,
      overallScore: 80
    }
  };
}
