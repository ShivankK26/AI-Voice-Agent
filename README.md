# Riverline Voice Agent - Debt Collection AI

A sophisticated AI-powered debt collection voice agent built with LiveKit, Next.js, and modern web technologies. This application demonstrates how to create human-like voice interactions for debt collection scenarios.

## Features

- 🤖 **AI-Powered Voice Agent**: Natural conversation flow with intelligent responses
- 🎯 **Debt Collection Focus**: Specialized for payment reminders and collection scenarios
- 📞 **Real-time Communication**: Built on LiveKit for seamless voice interactions
- 🛡️ **Robust Error Handling**: Handles edge cases, interruptions, and unexpected responses
- 📊 **Call Analytics**: Real-time call logging and conversation tracking
- 🎨 **Modern UI**: Clean, professional interface with real-time status updates

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Voice Communication**: LiveKit
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Authentication**: LiveKit Access Tokens

## Prerequisites

Before running this application, you'll need:

1. **LiveKit Cloud Account**: Sign up at [cloud.livekit.io](https://cloud.livekit.io/)
2. **Node.js**: Version 18 or higher
3. **Yarn**: Package manager

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd riverline-assignment
yarn install
```

### 2. Configure LiveKit

1. Go to [LiveKit Cloud](https://cloud.livekit.io/) and create a new project
2. Get your API Key, API Secret, and WebSocket URL
3. Update the `.env.local` file with your credentials:

```env
# LiveKit Configuration
LIVEKIT_API_KEY=your_api_key_here
LIVEKIT_API_SECRET=your_api_secret_here
LIVEKIT_URL=wss://your-project.livekit.cloud

# Public URL for client-side access
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
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

1. Navigate to the home page
2. Click "Launch Voice Agent" or "Start Demo"
3. The agent will connect to the LiveKit room
4. Use the interface to simulate debt collection conversations
5. Monitor call logs and agent status in real-time

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
