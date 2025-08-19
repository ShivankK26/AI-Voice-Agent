# LiveKit Setup Guide

This guide will help you set up LiveKit credentials to get your debt collection voice agent running.

## Step 1: Create a LiveKit Cloud Account

1. Go to [LiveKit Cloud](https://cloud.livekit.io/)
2. Sign up for a free account
3. Create a new project

## Step 2: Get Your Credentials

1. In your LiveKit Cloud dashboard, navigate to your project
2. Go to the "API Keys" section
3. Create a new API key or use the default one
4. Copy the following information:
   - **API Key**
   - **API Secret** 
   - **WebSocket URL** (looks like `wss://your-project.livekit.cloud`)

## Step 3: Configure Environment Variables

1. Open the `.env.local` file in your project root
2. Replace the placeholder values with your actual credentials:

```env
# LiveKit Configuration
LIVEKIT_API_KEY=your_actual_api_key_here
LIVEKIT_API_SECRET=your_actual_api_secret_here
LIVEKIT_URL=wss://your-project.livekit.cloud

# Public URL for client-side access
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
```

## Step 4: Test the Application

1. Make sure your development server is running:
   ```bash
   yarn dev
   ```

2. Open your browser and go to `http://localhost:3000`
3. Click "Launch Voice Agent" to test the connection

## Troubleshooting

### Connection Issues
- Verify your API key and secret are correct
- Check that the WebSocket URL is properly formatted
- Ensure your LiveKit project is active

### Environment Variables Not Loading
- Make sure the `.env.local` file is in the project root
- Restart your development server after making changes
- Check that the variable names match exactly

### Browser Permissions
- Allow microphone access when prompted
- Use HTTPS in production (required for WebRTC)

## Next Steps

Once LiveKit is configured, you can:
1. Test the voice agent interface
2. Add AI integration for conversation handling
3. Implement Twilio for outbound phone calls
4. Customize the debt collection scenarios

## Support

- [LiveKit Documentation](https://docs.livekit.io/)
- [LiveKit Community](https://github.com/livekit/livekit/discussions)
- [Next.js Documentation](https://nextjs.org/docs)
