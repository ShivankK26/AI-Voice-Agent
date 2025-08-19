'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ConversationEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface CallContext {
  customerName?: string;
  amount?: number;
  dueDate?: string;
  callStage: 'greeting' | 'identification' | 'payment_reminder' | 'objection_handling' | 'payment_options' | 'closing';
}

export interface AIResponse {
  message: string;
  nextStage?: CallContext['callStage'];
  requiresInput?: boolean;
  confidence?: number;
}

export function useAnthropicDebtCollectionAgent() {
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [callContext, setCallContext] = useState<CallContext>({
    callStage: 'greeting',
    customerName: 'Account Holder',
    amount: 1500,
    dueDate: 'March 15th'
  });

  const addToConversation = useCallback((role: 'user' | 'assistant', content: string) => {
    const entry: ConversationEntry = {
      role,
      content,
      timestamp: new Date()
    };
    setConversationHistory(prev => [...prev, entry]);
  }, []);

  const processCustomerInput = useCallback(async (input: string) => {
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    addToConversation('user', input);

    try {
      const response = await fetch('/api/ai/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversationHistory: conversationHistory.slice(-10), // Last 10 messages for context
          customerName: callContext.customerName,
          amount: callContext.amount,
          dueDate: callContext.dueDate,
          callStage: callContext.callStage
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiResponse = data.response;
        setCurrentMessage(aiResponse);
        addToConversation('assistant', aiResponse);
        
        // Update call stage based on conversation flow
        if (input.toLowerCase().includes('yes') || input.toLowerCase().includes('aware')) {
          setCallContext(prev => ({ ...prev, callStage: 'payment_reminder' }));
        } else if (input.toLowerCase().includes('payment') || input.toLowerCase().includes('options')) {
          setCallContext(prev => ({ ...prev, callStage: 'payment_options' }));
        } else if (input.toLowerCase().includes('objection') || input.toLowerCase().includes('can\'t') || input.toLowerCase().includes('difficult')) {
          setCallContext(prev => ({ ...prev, callStage: 'objection_handling' }));
        }
      } else {
        console.error('AI response error:', data.error);
        setCurrentMessage("I apologize, but I'm having trouble processing your request. Let me connect you with a human representative.");
      }
    } catch (error) {
      console.error('Error processing customer input:', error);
      setCurrentMessage("I apologize, but I'm experiencing technical difficulties. Let me connect you with a human representative.");
    } finally {
      setIsProcessing(false);
    }
  }, [conversationHistory, callContext, addToConversation, isProcessing]);

  const startConversation = useCallback(async () => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/ai/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: "Start the debt collection conversation with a greeting",
          conversationHistory: [],
          customerName: callContext.customerName,
          amount: callContext.amount,
          dueDate: callContext.dueDate,
          callStage: 'greeting'
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiResponse = data.response;
        setCurrentMessage(aiResponse);
        addToConversation('assistant', aiResponse);
        setCallContext(prev => ({ ...prev, callStage: 'identification' }));
      } else {
        setCurrentMessage("Hello, this is Sarah from First National Bank calling regarding your credit card account. May I speak with the account holder?");
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      setCurrentMessage("Hello, this is Sarah from First National Bank calling regarding your credit card account. May I speak with the account holder?");
    } finally {
      setIsProcessing(false);
    }
  }, [callContext, addToConversation]);

  const resetConversation = useCallback(() => {
    setConversationHistory([]);
    setCurrentMessage('');
    setCallContext({
      callStage: 'greeting',
      customerName: 'Account Holder',
      amount: 1500,
      dueDate: 'March 15th'
    });
  }, []);

  const updateCallContext = useCallback((updates: Partial<CallContext>) => {
    setCallContext(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    conversationHistory,
    currentMessage,
    isProcessing,
    callContext,
    startConversation,
    processCustomerInput,
    resetConversation,
    updateCallContext,
    addToConversation
  };
}
