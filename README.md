# Voice Agent Testing Platform

A sophisticated AI-powered voice agent testing and self-improvement platform built with Next.js, Twilio, and Anthropic Claude. This application enables automated testing of voice agents using real phone calls, comprehensive analysis, and AI-driven script improvement.

## 🚀 Features

### 🤖 **AI-Powered Voice Agent**
- **Claude Opus 4.1**: Advanced AI model for natural voice conversations
- **Real Phone Calls**: Actually dials customers using Twilio Programmable Voice
- **Speech Recognition**: Real-time speech-to-text with confidence scoring
- **Dynamic Responses**: Context-aware, natural conversation flow
- **Professional Scripts**: Specialized for debt collection scenarios

### 🧪 **Automated Testing Platform**
- **Persona Generation**: AI-generated diverse customer profiles for testing
- **Real Voice Testing**: Actual phone calls with real customers
- **Comprehensive Metrics**: 5-dimensional performance scoring
- **Batch Testing**: Run multiple tests with different personas
- **Conversation Tracking**: Full conversation logging and analysis

### 📊 **Performance Analytics**
- **Repetition Score**: Measures agent's tendency to repeat responses
- **Negotiation Score**: Evaluates flexibility and payment option variety
- **Relevance Score**: Assesses response appropriateness to customer input
- **Empathy Score**: Measures emotional intelligence and understanding
- **Overall Score**: Composite performance metric (0-100)

### 🔄 **Self-Improvement System**
- **AI-Driven Analysis**: Identifies failure points and improvement areas
- **Script Rewriting**: Automatically generates improved agent scripts
- **Iterative Testing**: Continuous improvement through multiple iterations
- **Performance Tracking**: Monitors score improvements over time
- **Script Persistence**: Maintains improved scripts across sessions

### 🛠️ **Developer Experience**
- **Real-time Logging**: Comprehensive console logging for debugging
- **Error Handling**: Robust error handling with fallback responses
- **Webhook Management**: Dynamic ngrok URL handling for local development
- **State Persistence**: localStorage for script and test data persistence
- **Modern UI**: Clean, responsive interface with Tailwind CSS

## 🏗️ Tech Stack

### **Frontend**
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with hooks and modern patterns
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework

### **Backend & APIs**
- **Next.js API Routes**: Serverless API endpoints
- **Anthropic Claude**: AI model for conversations and analysis
- **Twilio Programmable Voice**: Phone call infrastructure
- **TwiML**: Twilio Markup Language for call control

### **Development Tools**
- **ngrok**: Local tunnel for webhook testing
- **ESLint**: Code linting and formatting
- **Yarn**: Package management

## 📋 Prerequisites

Before running this application, ensure you have:

1. **Node.js**: Version 18 or higher
2. **Yarn**: Package manager
3. **Twilio Account**: [Sign up here](https://www.twilio.com/)
4. **Anthropic Account**: [Sign up here](https://console.anthropic.com/)
5. **ngrok**: [Download here](https://ngrok.com/)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/ShivankK26/AI-Voice-Agent .
yarn install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Twilio Configuration
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Anthropic AI Configuration
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Base URL (update with your ngrok URL)
NEXT_PUBLIC_BASE_URL=https://your-ngrok-url.ngrok-free.app
```

### 3. Start Development Server

```bash
# Terminal 1: Start Next.js
yarn dev

# Terminal 2: Start ngrok tunnel
ngrok http 3000
```

### 4. Configure Twilio Webhooks

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to Phone Numbers → Manage → Active numbers
3. Click on your phone number
4. Set the webhook URL to: `https://your-ngrok-url.ngrok-free.app/api/call/interactive`
5. Set HTTP method to POST

## 📖 Detailed Usage Guide

### 🎭 **Generating Test Personas**

1. Navigate to `/voice-testing`
2. Click **"Generate Personas"**
3. The system creates 5 diverse customer profiles:
   - Different ages, occupations, and personalities
   - Various financial situations and payment capabilities
   - Realistic debt collection scenarios

### 🎤 **Running Voice Tests**

#### Single Test
1. **Select a Persona**: Choose from generated personas
2. **Enter Phone Number**: Use format `+[country code][number]`
3. **Set Test Duration**: 120-300 seconds (default: 120s)
4. **Click "Run Voice Test"**
5. **Monitor Progress**: Watch real-time conversation logs
6. **Review Results**: See detailed metrics and analysis

#### Batch Testing
1. **Generate Personas** first
2. **Enter Phone Number** for testing
3. **Click "Run Batch Tests"**
4. **Monitor All Tests**: System runs tests sequentially
5. **Review Comprehensive Results**: Compare performance across personas

### 📊 **Understanding Test Results**

#### Metrics Breakdown
- **Repetition Score (0-100)**: Lower is better
- **Negotiation Score (0-100)**: Higher is better
- **Relevance Score (0-100)**: Higher is better
- **Empathy Score (0-100)**: Higher is better
- **Overall Score (0-100)**: Weighted average

#### Analysis Components
- **Issues Found**: Specific problems identified
- **Recommendations**: Actionable improvement suggestions
- **Conversation Summary**: Key interaction points
- **Performance Insights**: Detailed breakdown

### 🔄 **Self-Improvement Process**

#### Automatic Script Improvement
1. **Run Voice Tests**: Generate test results first
2. **Click "Improve Agent Script"**
3. **AI Analysis**: System analyzes all test results
4. **Script Generation**: Creates improved agent script
5. **Persistence**: Script saved to localStorage
6. **Iterative Testing**: Run new tests with improved script

#### Improvement Features
- **Issue Identification**: Finds common failure points
- **Script Enhancement**: Addresses specific problems
- **Performance Prediction**: Estimates score improvements
- **Change Tracking**: Logs all improvements made

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   └── conversation/
│   │   │       └── route.ts          # AI conversation handling
│   │   ├── call/
│   │   │   ├── interactive/
│   │   │   │   └── route.ts          # Twilio interactive webhook
│   │   │   ├── recording/
│   │   │   │   └── route.ts          # Call recording webhook
│   │   │   ├── status/
│   │   │   │   └── route.ts          # Call status webhook
│   │   │   └── route.ts              # Call initiation
│   │   ├── testing/
│   │   │   ├── generate-personas/
│   │   │   │   └── route.ts          # AI persona generation
│   │   │   ├── self-correct/
│   │   │   │   └── route.ts          # Script improvement
│   │   │   └── voice-test/
│   │   │       └── route.ts          # Voice test orchestration
│   │   └── token/
│   │       └── route.ts              # LiveKit token generation
│   ├── room/
│   │   └── page.tsx                  # Voice agent interface
│   ├── voice-testing/
│   │   └── page.tsx                  # Testing platform UI
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Landing page
├── components/
│   └── AnthropicDebtCollectionAgent.tsx
├── lib/
│   └── test-tracker.ts               # Conversation tracking
└── types/                           # TypeScript definitions
```

## 🔧 API Endpoints

### **Voice Agent APIs**

#### `POST /api/call`
Initiates outbound phone calls.

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "customerName": "John Doe",
  "amount": "$1,250.00",
  "roomName": "test-room",
  "script": "Custom agent script..."
}
```

#### `POST /api/call/interactive`
Handles Twilio interactive webhooks for speech recognition.

**Query Parameters:**
- `script`: URL-encoded agent script

### **Testing APIs**

#### `POST /api/testing/generate-personas`
Generates diverse customer personas for testing.

**Request Body:**
```json
{
  "count": 5
}
```

#### `POST /api/testing/voice-test`
Orchestrates a complete voice test.

**Request Body:**
```json
{
  "persona": {
    "name": "John Doe",
    "age": 35,
    "occupation": "Teacher",
    "personality": "Cooperative"
  },
  "phoneNumber": "+1234567890",
  "testDuration": 120,
  "script": "Agent script..."
}
```

#### `POST /api/testing/self-correct`
Analyzes test results and generates improved scripts.

**Request Body:**
```json
{
  "testResults": [...],
  "currentScript": "Current script...",
  "iteration": 1
}
```
