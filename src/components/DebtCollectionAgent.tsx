'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ConversationState {
  stage: 'greeting' | 'identification' | 'payment_reminder' | 'objection_handling' | 'payment_options' | 'closing';
  customerName?: string;
  amount?: number;
  dueDate?: string;
  objections: string[];
  paymentPlans: PaymentPlan[];
}

export interface PaymentPlan {
  id: string;
  description: string;
  amount: number;
  installments: number;
}

export interface AgentResponse {
  message: string;
  nextStage?: ConversationState['stage'];
  requiresInput?: boolean;
  actions?: string[];
}

export class DebtCollectionAgent {
  private state: ConversationState;
  private responses: Map<string, AgentResponse>;

  constructor() {
    this.state = {
      stage: 'greeting',
      objections: [],
      paymentPlans: [
        {
          id: 'plan1',
          description: 'Full payment today',
          amount: 1500,
          installments: 1
        },
        {
          id: 'plan2',
          description: '2 equal payments over 30 days',
          amount: 750,
          installments: 2
        },
        {
          id: 'plan3',
          description: '3 equal payments over 60 days',
          amount: 500,
          installments: 3
        }
      ]
    };

    this.initializeResponses();
  }

  private initializeResponses() {
    this.responses = new Map([
      ['greeting', {
        message: "Hello, this is Sarah from First National Bank calling regarding your credit card account. May I speak with the account holder?",
        nextStage: 'identification',
        requiresInput: true
      }],
      ['identification', {
        message: "Thank you for confirming. I'm calling about your outstanding balance of $1,500 that was due on March 15th. I want to help you resolve this situation. Are you aware of this overdue amount?",
        nextStage: 'payment_reminder',
        requiresInput: true
      }],
      ['payment_reminder', {
        message: "I understand this might be a difficult situation. We're here to help you get back on track. Would you like to discuss payment options that might work better for your current circumstances?",
        nextStage: 'payment_options',
        requiresInput: true
      }],
      ['objection_handling', {
        message: "I completely understand your concern. Let me see what we can do to make this work for you. We have several flexible payment options available.",
        nextStage: 'payment_options',
        requiresInput: true
      }],
      ['payment_options', {
        message: "Great! Let me outline your options: You can pay the full amount of $1,500 today, make 2 payments of $750 over 30 days, or 3 payments of $500 over 60 days. Which option would work best for you?",
        nextStage: 'closing',
        requiresInput: true
      }],
      ['closing', {
        message: "Perfect! I'll set up your payment plan. You'll receive a confirmation email with the details. Is there anything else I can help you with today?",
        requiresInput: false
      }]
    ]);
  }

  public getCurrentResponse(): AgentResponse {
    const response = this.responses.get(this.state.stage);
    if (!response) {
      return {
        message: "I apologize, but I'm having trouble processing your request. Let me connect you with a human representative.",
        requiresInput: false
      };
    }
    return response;
  }

  public processCustomerInput(input: string): AgentResponse {
    const lowerInput = input.toLowerCase();
    
    // Handle objections
    if (this.isObjection(lowerInput)) {
      this.state.objections.push(input);
      this.state.stage = 'objection_handling';
      return this.getCurrentResponse();
    }

    // Handle payment plan selection
    if (this.state.stage === 'payment_options' && this.isPaymentSelection(lowerInput)) {
      this.state.stage = 'closing';
      return this.getCurrentResponse();
    }

    // Handle identification
    if (this.state.stage === 'identification') {
      if (this.isPositiveResponse(lowerInput)) {
        this.state.stage = 'payment_reminder';
        return this.getCurrentResponse();
      } else {
        return {
          message: "I understand. When would be a better time to call?",
          requiresInput: true
        };
      }
    }

    // Handle payment reminder
    if (this.state.stage === 'payment_reminder') {
      if (this.isPositiveResponse(lowerInput)) {
        this.state.stage = 'payment_options';
        return this.getCurrentResponse();
      } else {
        this.state.stage = 'objection_handling';
        return this.getCurrentResponse();
      }
    }

    // Default response
    return {
      message: "I understand. Let me help you find a solution that works for you.",
      requiresInput: true
    };
  }

  private isObjection(input: string): boolean {
    const objections = [
      'can\'t afford', 'don\'t have money', 'lost my job', 'financial hardship',
      'not a good time', 'call back later', 'not interested', 'too expensive',
      'need more time', 'can\'t pay right now'
    ];
    return objections.some(obj => input.includes(obj));
  }

  private isPaymentSelection(input: string): boolean {
    const selections = ['option 1', 'option 2', 'option 3', 'full payment', 'two payments', 'three payments'];
    return selections.some(sel => input.includes(sel));
  }

  private isPositiveResponse(input: string): boolean {
    const positive = ['yes', 'yeah', 'sure', 'okay', 'alright', 'correct', 'right'];
    return positive.some(pos => input.includes(pos));
  }

  public getState(): ConversationState {
    return { ...this.state };
  }

  public reset(): void {
    this.state = {
      stage: 'greeting',
      objections: [],
      paymentPlans: this.state.paymentPlans
    };
  }
}

export function useDebtCollectionAgent() {
  const [agent] = useState(() => new DebtCollectionAgent());
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const startConversation = useCallback(() => {
    const response = agent.getCurrentResponse();
    setCurrentMessage(response.message);
    setIsSpeaking(true);
    
    // Simulate speaking time
    setTimeout(() => {
      setIsSpeaking(false);
    }, 3000);
  }, [agent]);

  const processCustomerInput = useCallback((input: string) => {
    const response = agent.processCustomerInput(input);
    setCurrentMessage(response.message);
    setIsSpeaking(true);
    
    // Simulate speaking time
    setTimeout(() => {
      setIsSpeaking(false);
    }, 3000);
  }, [agent]);

  const resetConversation = useCallback(() => {
    agent.reset();
    setCurrentMessage('');
    setIsSpeaking(false);
  }, [agent]);

  return {
    agent,
    currentMessage,
    isSpeaking,
    startConversation,
    processCustomerInput,
    resetConversation,
    getState: () => agent.getState()
  };
}
