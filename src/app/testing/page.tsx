'use client';

import { useState } from 'react';

interface Persona {
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

interface TestResult {
  personaId: string;
  personaName: string;
  conversation: any[];
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

interface TestSession {
  sessionId: string;
  startTime: string;
  endTime?: string;
  iterations: any[];
  finalScript: string;
  improvementHistory: {
    iteration: number;
    averageScore: number;
    improvements: string[];
  }[];
}

export default function TestingDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<TestSession | null>(null);
  const [testConfig, setTestConfig] = useState({
    maxIterations: 5,
    targetScore: 85,
    personasCount: 5,
    initialScript: "You are Sarah, a professional debt collection agent from First National Bank. You are calling about an overdue credit card payment of $1,250.00. Be polite, professional, and helpful. Keep responses concise and natural for phone conversation. Don't be too pushy, but be firm about the payment."
  });

  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runFullTest = async () => {
    setIsRunning(true);
    setLogs([]);
    addLog('🚀 Starting AI-automated testing session...');

    try {
      const response = await fetch('/api/testing/run-full-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testConfig)
      });

      if (!response.ok) {
        throw new Error('Failed to start testing session');
      }

      const data = await response.json();
      setCurrentSession(data.session);
      
      addLog(`✅ Testing session completed!`);
      addLog(`📊 Final score: ${data.summary.finalScore.toFixed(1)}/100`);
      addLog(`🔄 Total iterations: ${data.summary.totalIterations}`);
      addLog(`📈 Improvement: ${data.summary.improvement.toFixed(1)} points`);

    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const generatePersonas = async () => {
    addLog('🎭 Generating test personas...');
    
    try {
      const response = await fetch('/api/testing/generate-personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: testConfig.personasCount })
      });

      if (!response.ok) {
        throw new Error('Failed to generate personas');
      }

      const data = await response.json();
      addLog(`✅ Generated ${data.personas.length} personas`);
      
      // Display personas
      data.personas.forEach((persona: Persona) => {
        addLog(`👤 ${persona.name} (${persona.age}, ${persona.occupation}) - ${persona.personality}`);
      });

    } catch (error) {
      addLog(`❌ Error generating personas: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Voice Agent Testing Platform</h1>
              <p className="text-gray-600">Automated testing and self-correction for debt collection voice agents</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={generatePersonas}
                disabled={isRunning}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Generate Personas
              </button>
              <button
                onClick={runFullTest}
                disabled={isRunning}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {isRunning ? 'Running Tests...' : 'Start Full Test'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Iterations
                  </label>
                  <input
                    type="number"
                    value={testConfig.maxIterations}
                    onChange={(e) => setTestConfig(prev => ({ ...prev, maxIterations: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    max="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Score
                  </label>
                  <input
                    type="number"
                    value={testConfig.targetScore}
                    onChange={(e) => setTestConfig(prev => ({ ...prev, targetScore: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    min="50"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Personas Count
                  </label>
                  <input
                    type="number"
                    value={testConfig.personasCount}
                    onChange={(e) => setTestConfig(prev => ({ ...prev, personasCount: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    max="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Initial Script
                  </label>
                  <textarea
                    value={testConfig.initialScript}
                    onChange={(e) => setTestConfig(prev => ({ ...prev, initialScript: e.target.value }))}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter the initial agent script..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Test Results</h2>
              
              {currentSession && (
                <div className="space-y-6">
                  {/* Session Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-2">Session Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Session ID</div>
                        <div className="font-medium">{currentSession.sessionId}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Total Iterations</div>
                        <div className="font-medium">{currentSession.iterations.length}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Initial Score</div>
                        <div className="font-medium">{currentSession.iterations[0]?.averageScore.toFixed(1)}/100</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Final Score</div>
                        <div className="font-medium">{currentSession.iterations[currentSession.iterations.length - 1]?.averageScore.toFixed(1)}/100</div>
                      </div>
                    </div>
                  </div>

                  {/* Improvement History */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Improvement History</h3>
                    <div className="space-y-3">
                      {currentSession.improvementHistory.map((history, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Iteration {history.iteration}</span>
                            <span className="text-lg font-bold text-blue-600">{history.averageScore.toFixed(1)}/100</span>
                          </div>
                          {history.improvements.length > 0 && (
                            <div className="text-sm text-gray-600">
                              <strong>Improvements:</strong> {history.improvements.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Final Script */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Final Improved Script</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap text-sm">{currentSession.finalScript}</pre>
                    </div>
                  </div>
                </div>
              )}

              {!currentSession && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">🧪</div>
                  <p>No test results yet. Start a testing session to see results here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Logs Panel */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Logs</h2>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet. Start a test to see real-time progress.</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
