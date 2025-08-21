import { NextRequest, NextResponse } from 'next/server';

export interface TestSession {
  sessionId: string;
  startTime: string;
  endTime?: string;
  iterations: TestIteration[];
  finalScript: string;
  improvementHistory: {
    iteration: number;
    averageScore: number;
    improvements: string[];
  }[];
}

export interface TestIteration {
  iteration: number;
  personas: any[];
  testResults: any[];
  script: string;
  averageScore: number;
  improvements: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { 
      maxIterations = 5, 
      targetScore = 85, 
      personasCount = 5,
      initialScript = "You are Sarah, a professional debt collection agent from First National Bank. You are calling about an overdue credit card payment of $1,250.00. Be polite, professional, and helpful. Keep responses concise and natural for phone conversation. Don't be too pushy, but be firm about the payment."
    } = await req.json();

    const sessionId = `test_${Date.now()}`;
    const startTime = new Date().toISOString();
    
    console.log(`🚀 Starting full testing session: ${sessionId}`);
    console.log(`📊 Target score: ${targetScore}, Max iterations: ${maxIterations}`);

    const session: TestSession = {
      sessionId,
      startTime,
      iterations: [],
      finalScript: initialScript,
      improvementHistory: []
    };

    let currentScript = initialScript;
    let currentIteration = 1;

    while (currentIteration <= maxIterations) {
      console.log(`\n🔄 Starting iteration ${currentIteration}/${maxIterations}`);
      
      // Step 1: Generate personas
      console.log('🎭 Generating personas...');
      const personasResponse = await fetch(`${req.nextUrl.origin}/api/testing/generate-personas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: personasCount })
      });
      
      if (!personasResponse.ok) {
        throw new Error('Failed to generate personas');
      }
      
      const personasData = await personasResponse.json();
      const personas = personasData.personas;

      // Step 2: Test conversations with each persona
      console.log(`🧪 Testing conversations with ${personas.length} personas...`);
      const testResults = [];
      
      for (const persona of personas) {
        const testResponse = await fetch(`${req.nextUrl.origin}/api/testing/conversation-test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            persona, 
            agentScript: currentScript,
            maxTurns: 8 
          })
        });
        
        if (!testResponse.ok) {
          throw new Error(`Failed to test conversation with ${persona.name}`);
        }
        
        const testData = await testResponse.json();
        testResults.push(testData.result);
      }

      // Step 3: Calculate average scores
      const averageScore = testResults.reduce((sum, result) => sum + result.metrics.overallScore, 0) / testResults.length;
      
      console.log(`📈 Iteration ${currentIteration} average score: ${averageScore.toFixed(1)}/100`);

      // Step 4: Self-correct if needed
      let improvements: string[] = [];
      if (averageScore < targetScore && currentIteration < maxIterations) {
        console.log('🔧 Running self-correction...');
        
        const correctionResponse = await fetch(`${req.nextUrl.origin}/api/testing/self-correct`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            testResults, 
            currentScript, 
            iteration: currentIteration 
          })
        });
        
        if (!correctionResponse.ok) {
          throw new Error('Failed to self-correct script');
        }
        
        const correctionData = await correctionResponse.json();
        currentScript = correctionData.improvedScript.improvedScript;
        improvements = correctionData.improvedScript.improvements;
        
        console.log(`✅ Script improved with: ${improvements.join(', ')}`);
      }

      // Step 5: Record iteration results
      const iteration: TestIteration = {
        iteration: currentIteration,
        personas,
        testResults,
        script: currentScript,
        averageScore,
        improvements
      };

      session.iterations.push(iteration);
      session.improvementHistory.push({
        iteration: currentIteration,
        averageScore,
        improvements
      });

      // Step 6: Check if target score reached
      if (averageScore >= targetScore) {
        console.log(`🎯 Target score ${targetScore} reached! Stopping iterations.`);
        break;
      }

      currentIteration++;
    }

    // Finalize session
    session.endTime = new Date().toISOString();
    session.finalScript = currentScript;

    const finalAverageScore = session.iterations[session.iterations.length - 1]?.averageScore || 0;
    
    console.log(`\n🏁 Testing session completed!`);
    console.log(`📊 Final average score: ${finalAverageScore.toFixed(1)}/100`);
    console.log(`🔄 Total iterations: ${session.iterations.length}`);
    console.log(`📈 Improvement: ${((finalAverageScore - session.iterations[0]?.averageScore || 0)).toFixed(1)} points`);

    return NextResponse.json({
      success: true,
      session,
      summary: {
        sessionId,
        totalIterations: session.iterations.length,
        initialScore: session.iterations[0]?.averageScore || 0,
        finalScore: finalAverageScore,
        improvement: finalAverageScore - (session.iterations[0]?.averageScore || 0),
        targetReached: finalAverageScore >= targetScore
      }
    });

  } catch (error) {
    console.error('Error in full testing session:', error);
    return NextResponse.json(
      { error: 'Failed to run full test', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
