// Simple in-memory test tracking system
// In production, this should be replaced with a proper database

interface ConversationTurn {
  timestamp: string;
  speaker: 'agent' | 'customer';
  message: string;
  speechResult?: string;
  confidence?: number;
}

// Use global object to ensure persistence across requests
declare global {
  var __testTrackerData: {
    conversations: Map<string, ConversationTurn[]>;
    activeTests: Set<string>;
    callToTestMapping: Map<string, string>;
  } | undefined;
}

// Initialize global data if it doesn't exist
if (!global.__testTrackerData) {
  global.__testTrackerData = {
    conversations: new Map(),
    activeTests: new Set(),
    callToTestMapping: new Map()
  };
}

const testData = global.__testTrackerData;

class TestTracker {
  // Start tracking a test
  startTest(testId: string): void {
    testData.activeTests.add(testId);
    testData.conversations.set(testId, []);
    console.log(`🔍 Started tracking test: ${testId}`);
    console.log(`🔍 TestTracker: Active tests now: ${Array.from(testData.activeTests)}`);
  }

  // Map a callSid to a testId
  mapCallToTest(callSid: string, testId: string): void {
    testData.callToTestMapping.set(callSid, testId);
    console.log(`🔗 Mapped call ${callSid} to test ${testId}`);
    console.log(`🔗 TestTracker: Total mappings now: ${testData.callToTestMapping.size}`);
    console.log(`🔗 TestTracker: All mappings: ${Array.from(testData.callToTestMapping.entries()).map(([call, test]) => `${call}->${test}`).join(', ')}`);
  }

  // Get testId from callSid
  getTestIdFromCall(callSid: string): string | undefined {
    return testData.callToTestMapping.get(callSid);
  }

  // Add a conversation turn
  addTurn(testId: string, turn: ConversationTurn): void {
    if (testData.activeTests.has(testId)) {
      const conversation = testData.conversations.get(testId) || [];
      conversation.push(turn);
      testData.conversations.set(testId, conversation);
      console.log(`📝 Added turn to test ${testId}: ${turn.speaker} - ${turn.message.substring(0, 50)}...`);
    }
  }

  // Add a conversation turn using callSid
  addTurnByCall(callSid: string, turn: ConversationTurn): void {
    const testId = this.getTestIdFromCall(callSid);
    if (testId) {
      this.addTurn(testId, turn);
    } else {
      console.log(`⚠️ No test mapping found for call: ${callSid}`);
    }
  }

  // Get conversation data
  getConversation(testId: string): ConversationTurn[] {
    return testData.conversations.get(testId) || [];
  }

  // End tracking a test
  endTest(testId: string): ConversationTurn[] {
    const conversation = this.getConversation(testId);
    testData.activeTests.delete(testId);
    testData.conversations.delete(testId);
    
    // Clean up call mappings
    for (const [callSid, mappedTestId] of testData.callToTestMapping.entries()) {
      if (mappedTestId === testId) {
        testData.callToTestMapping.delete(callSid);
      }
    }
    
    console.log(`🏁 Ended tracking test: ${testId} with ${conversation.length} turns`);
    return conversation;
  }

  // Check if a test is active
  isActive(testId: string): boolean {
    return testData.activeTests.has(testId);
  }

  // Check if a call is being tracked
  isCallTracked(callSid: string): boolean {
    const isTracked = testData.callToTestMapping.has(callSid);
    console.log(`🔍 TestTracker: Call ${callSid} tracked? ${isTracked}`);
    console.log(`🔍 TestTracker: Active mappings: ${Array.from(testData.callToTestMapping.entries()).map(([call, test]) => `${call}->${test}`).join(', ')}`);
    return isTracked;
  }

  // Get all active test IDs
  getActiveTests(): string[] {
    return Array.from(testData.activeTests);
  }

  // Debug method to show current state
  debug(): any {
    return {
      activeTests: Array.from(testData.activeTests),
      mappings: Array.from(testData.callToTestMapping.entries()),
      conversations: Array.from(testData.conversations.entries()).map(([testId, turns]) => ({
        testId,
        turnCount: turns.length
      }))
    };
  }
}

// Export singleton instance
export const testTracker = new TestTracker();
