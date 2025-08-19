# Riverline Voice Agent - Debt Collection AI

A sophisticated AI-powered debt collection voice agent built with LiveKit, Next.js, and modern web technologies. This application demonstrates how to create human-like voice interactions for debt collection scenarios.

## Features

- 🤖 **Claude AI-Powered**: Real-time conversations using Anthropic's Claude 3.5 Sonnet
- 🎯 **Debt Collection Focus**: Specialized for payment reminders and collection scenarios
- 📞 **Real Outbound Phone Calls**: Actually dials customers using Twilio
- 🧠 **Intelligent Responses**: Dynamic, context-aware conversations with speech recognition
- 🛡️ **Robust Error Handling**: Handles edge cases, interruptions, and unexpected responses
- 📊 **Call Analytics**: Real-time call logging, recording, and status tracking
- 🎨 **Modern UI**: Clean, professional interface with real-time status updates
- 📱 **International Phone Support**: Works with international phone numbers for outbound calls
- 🎤 **Interactive Voice**: Real-time speech recognition and AI responses

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **AI/LLM**: Anthropic Claude 3.5 Sonnet
- **Voice Communication**: LiveKit + Twilio SIP
- **Phone Calls**: Twilio Programmable Voice
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Authentication**: LiveKit Access Tokens

## Prerequisites

Before running this application, you'll need:

1. **Twilio Account**: Sign up at [twilio.com](https://www.twilio.com/)
2. **Anthropic Account**: Sign up at [console.anthropic.com](https://console.anthropic.com/)
3. **Twilio Phone Number**: Required for outbound calls (purchase through Twilio)
4. **Node.js**: Version 18 or higher
5. **Yarn**: Package manager

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd riverline-assignment
yarn install
```

### 2. Configure Twilio and Anthropic

1. **Twilio Setup**:
   - Go to [Twilio Console](https://console.twilio.com/) and get your credentials
   - Purchase a phone number with Voice capabilities
   - Configure webhook URLs for call status updates

2. **Anthropic Setup**:
   - Go to [Anthropic Console](https://console.anthropic.com/) and get your API key
   - Ensure you have access to Claude 3.5 Sonnet

3. **Update Environment Variables**:

```env
# Twilio Configuration
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX  # Your Twilio outbound number
ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Anthropic AI Configuration
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Base URL for webhooks (use ngrok for local testing)
NEXT_PUBLIC_BASE_URL=https://your-ngrok-url.ngrok-free.app
```

### 3. Run the Development Server

```bash
yarn dev
```

The application will be available at `http://localhost:3000`

## Usage

### Demo Scenario

The voice agent is configured for a debt collection scenario:

1. **Credit Card Payment Reminder**: Agent contacts customers about overdue balances
2. **Professional Conversation**: Polite and professional tone throughout
3. **Objection Handling**: Responds to common customer objections
4. **Payment Options**: Offers various payment arrangements
5. **Call Logging**: Tracks all conversation activities

### How to Test

1. **Setup Complete Integration**:
   - Ensure all environment variables are configured
   - Start ngrok: `ngrok http 3000`
   - Update `NEXT_PUBLIC_BASE_URL` with your ngrok URL

2. **Test Real Phone Calls**:
   - Navigate to the voice agent interface
   - Enter an international phone number in format `+[country code][number]`
   - Click "📞 Call" to make a real outbound call
   - Monitor call status and logs in real-time

3. **Monitor Calls**:
   - Check call logs for status updates
   - Monitor Twilio console for call details
   - View real-time conversation with Claude AI

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── token/
│   │       └── route.ts          # LiveKit token generation
│   ├── room/
│   │   └── page.tsx              # Voice agent interface
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # Reusable components (future)
└── lib/                         # Utility functions (future)
```

## API Endpoints

### `/api/token`
Generates LiveKit access tokens for room authentication.

**Query Parameters:**
- `room`: Room name for the voice session
- `username`: User identity for the session

**Response:**
```json
{
  "token": "livekit_access_token_jwt"
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `LIVEKIT_API_KEY` | LiveKit API Key | Yes |
| `LIVEKIT_API_SECRET` | LiveKit API Secret | Yes |
| `LIVEKIT_URL` | LiveKit WebSocket URL | Yes |
| `NEXT_PUBLIC_LIVEKIT_URL` | Public LiveKit URL for client | Yes |

## Development

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint

### Adding New Features

1. **Voice Agent Logic**: Extend the `VoiceAgentInterface` component
2. **New Scenarios**: Create additional conversation flows
3. **Analytics**: Add more detailed call tracking
4. **UI Components**: Build reusable components in `src/components/`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Security Considerations

- Never commit `.env.local` to version control
- Use environment variables for all sensitive data
- Implement proper authentication for production use
- Consider rate limiting for the token API endpoint

## Troubleshooting

### Common Issues

1. **Connection Failed**: Check LiveKit credentials in `.env.local`
2. **Token Generation Error**: Verify API key and secret are correct
3. **Audio Not Working**: Ensure browser permissions for microphone
4. **Build Errors**: Check Node.js version compatibility

### Getting Help

- [LiveKit Documentation](https://docs.livekit.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [LiveKit Community](https://github.com/livekit/livekit/discussions)

## License

This project is created for the Riverline Hiring Assignment.

## Contributing

This is a demonstration project for the Riverline hiring process. For production use, consider:

- Adding comprehensive error handling
- Implementing proper logging
- Adding unit and integration tests
- Setting up CI/CD pipelines
- Adding monitoring and analytics
