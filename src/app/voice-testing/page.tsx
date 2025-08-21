'use client';

import { useState, useEffect } from 'react';

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

interface VoiceTestResult {
  testId: string;
  personaId: string;
  personaName: string;
  conversationLog: any[];
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

export default function VoiceTestingDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<VoiceTestResult[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [testDuration, setTestDuration] = useState(120); // 2 minutes for proper analysis
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const generatePersonas = async () => {
    addLog('🎭 Generating test personas...');
    
    try {
      const response = await fetch('/api/testing/generate-personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 5 })
      });

      if (!response.ok) {
        throw new Error('Failed to generate personas');
      }

      const data = await response.json();
      setPersonas(data.personas);
      addLog(`✅ Generated ${data.personas.length} personas`);
      
      data.personas.forEach((persona: Persona) => {
        addLog(`👤 ${persona.name} (${persona.age}, ${persona.occupation}) - ${persona.personality}`);
      });

    } catch (error) {
      addLog(`❌ Error generating personas: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const runVoiceTest = async () => {
    if (!selectedPersona || !phoneNumber) {
      addLog('❌ Please select a persona and enter a phone number');
      return;
    }

    setIsRunning(true);
    addLog(`🎤 Starting voice test with ${selectedPersona.name} on ${phoneNumber}`);

    try {
      const response = await fetch('/api/testing/voice-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: selectedPersona,
          phoneNumber: phoneNumber,
          testDuration: testDuration
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start voice test');
      }

      const data = await response.json();
      setTestResults(prev => [...prev, data.result]);
      
      addLog(`✅ Voice test completed for ${selectedPersona.name}`);
      addLog(`📊 Overall Score: ${data.result.metrics.overallScore.toFixed(1)}/100`);
      addLog(`📈 Test Duration: ${data.result.testDuration.toFixed(1)} seconds`);

    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runBatchVoiceTests = async () => {
    if (personas.length === 0) {
      addLog('❌ Please generate personas first');
      return;
    }

    if (!phoneNumber) {
      addLog('❌ Please enter a phone number');
      return;
    }

    setIsRunning(true);
    addLog(`🚀 Starting batch voice tests with ${personas.length} personas`);

    const results: VoiceTestResult[] = [];

    for (const persona of personas) {
      addLog(`🎤 Testing ${persona.name}...`);
      
      try {
        const response = await fetch('/api/testing/voice-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            persona: persona,
            phoneNumber: phoneNumber,
            testDuration: testDuration
          })
        });

        if (response.ok) {
          const data = await response.json();
          results.push(data.result);
          addLog(`✅ ${persona.name}: ${data.result.metrics.overallScore.toFixed(1)}/100`);
        } else {
          addLog(`❌ Failed to test ${persona.name}`);
        }
      } catch (error) {
        addLog(`❌ Error testing ${persona.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setTestResults(prev => [...prev, ...results]);
    
    const averageScore = results.reduce((sum, result) => sum + result.metrics.overallScore, 0) / results.length;
    addLog(`📊 Batch testing completed! Average score: ${averageScore.toFixed(1)}/100`);
    
    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Voice Agent Testing Platform</h1>
              <p className="text-gray-600">Real voice conversation testing and analysis</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={generatePersonas}
                disabled={isRunning}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Generate Personas
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
              <h2 className="text-xl font-semibold mb-4">Voice Test Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Duration (seconds)
                  </label>
                        <input
                               type="number"
                               value={testDuration}
                               onChange={(e) => setTestDuration(parseInt(e.target.value))}
                               className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                               min="120"
                               max="300"
                             />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Persona
                  </label>
                  <select
                    value={selectedPersona?.id || ''}
                    onChange={(e) => {
                      const persona = personas.find(p => p.id === e.target.value);
                      setSelectedPersona(persona || null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a persona...</option>
                    {personas.map(persona => (
                      <option key={persona.id} value={persona.id}>
                        {persona.name} ({persona.age}, {persona.occupation})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={runVoiceTest}
                    disabled={isRunning || !selectedPersona || !phoneNumber}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {isRunning ? 'Running Test...' : 'Test Single Persona'}
                  </button>
                  
                  <button
                    onClick={runBatchVoiceTests}
                    disabled={isRunning || personas.length === 0 || !phoneNumber}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                  >
                    {isRunning ? 'Running Batch Tests...' : 'Test All Personas'}
                  </button>
                </div>
              </div>
            </div>

            {/* Personas List */}
            {personas.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Available Personas</h3>
                <div className="space-y-3">
                  {personas.map(persona => (
                    <div key={persona.id} className="border rounded-lg p-3">
                      <div className="font-medium">{persona.name}</div>
                      <div className="text-sm text-gray-600">{persona.age} years, {persona.occupation}</div>
                      <div className="text-sm text-gray-500">{persona.personality}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Voice Test Results</h2>
              
              {testResults.length > 0 ? (
                <div className="space-y-6">
                  {testResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-medium">{result.personaName}</h3>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{result.metrics.overallScore.toFixed(1)}/100</div>
                          <div className="text-sm text-gray-500">{result.testDuration.toFixed(1)}s</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-600">Repetition</div>
                          <div className="font-medium">{result.metrics.repetitionScore.toFixed(1)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Negotiation</div>
                          <div className="font-medium">{result.metrics.negotiationScore.toFixed(1)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Relevance</div>
                          <div className="font-medium">{result.metrics.relevanceScore.toFixed(1)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Empathy</div>
                          <div className="font-medium">{result.metrics.empathyScore.toFixed(1)}</div>
                        </div>
                      </div>
                      
                      {result.issues.length > 0 && (
                        <div className="mb-3">
                          <div className="text-sm font-medium text-red-600 mb-1">Issues Found:</div>
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            {result.issues.map((issue, i) => (
                              <li key={i}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {result.recommendations.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-green-600 mb-1">Recommendations:</div>
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            {result.recommendations.map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">🎤</div>
                  <p>No voice test results yet. Start a test to see real voice conversation analysis.</p>
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
                <div className="text-gray-500">No logs yet. Start a voice test to see real-time progress.</div>
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
