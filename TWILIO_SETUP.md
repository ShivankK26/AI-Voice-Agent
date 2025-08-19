# Twilio + LiveKit Integration Setup Guide

This guide will help you set up real outbound phone calls using Twilio and LiveKit for your debt collection voice agent.

## Prerequisites

1. **Twilio Account**: Sign up at [twilio.com](https://www.twilio.com/)
2. **LiveKit Cloud Account**: Already configured
3. **Anthropic Account**: Sign up at [console.anthropic.com](https://console.anthropic.com/)
4. **US Phone Number**: Required for outbound calls (Indian numbers need business verification)

## Step 1: Get API Credentials

### Twilio Credentials:
1. **Go to Twilio Console**: [console.twilio.com](https://console.twilio.com/)
2. **Get Account SID**: Found in the dashboard
3. **Get Auth Token**: Found in the dashboard (regenerate if needed)
4. **Purchase a Phone Number**: 
   - Go to Phone Numbers → Manage → Buy a number
   - Select a US number with Voice capabilities
   - Note down the phone number

### Anthropic Credentials:
1. **Go to Anthropic Console**: [console.anthropic.com](https://console.anthropic.com/)
2. **Create API Key**: Generate a new API key
3. **Copy API Key**: Note down the key (starts with `sk-ant-`)

## Step 2: Configure Environment Variables

Update your `.env.local` file with Twilio credentials:

```env
# Twilio Configuration
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX  # Your purchased Twilio number
ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# LiveKit Configuration (already configured)
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=wss://your-project.livekit.cloud
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud

# SIP Configuration (from LiveKit project settings)
SIP_URL=sip:your-sip-endpoint.sip.livekit.cloud

# Anthropic AI Configuration
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Base URL for webhooks (for production, use your domain)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Step 3: Configure Twilio SIP Trunk

### Option A: Using Twilio CLI (Recommended)

1. **Install Twilio CLI**:
   ```bash
   npm install -g twilio-cli
   ```

2. **Login to Twilio**:
   ```bash
   twilio login
   ```

3. **Create SIP Trunk**:
   ```bash
   twilio api trunking v1 trunks create \
     --friendly-name "LiveKit Debt Collection" \
     --domain-name "livekit-debt-collection.pstn.twilio.com"
   ```

4. **Configure Origination URI** (for inbound calls):
   ```bash
   twilio api trunking v1 trunks origination-urls create \
     --trunk-sid <your_trunk_sid> \
     --friendly-name "LiveKit SIP URI" \
     --sip-url "sip:your-sip-endpoint.sip.livekit.cloud" \
     --weight 1 --priority 1 --enabled
   ```

5. **Associate Phone Number**:
   ```bash
   twilio api trunking v1 trunks phone-numbers create \
     --trunk-sid <your_trunk_sid> \
     --phone-number-sid <your_phone_number_sid>
   ```

### Option B: Using Twilio Console

1. **Create SIP Trunk**:
   - Go to Elastic SIP Trunking → Manage → Trunks
   - Click "Create SIP Trunk"
   - Name it "LiveKit Debt Collection"

2. **Configure Origination**:
   - Go to Voice → Manage → Origination connection policy
   - Create new policy
   - Set SIP URI to your LiveKit SIP endpoint

3. **Associate Phone Number**:
   - Go to your SIP trunk settings
   - Add your purchased phone number

## Step 4: Configure LiveKit SIP

1. **Enable SIP in LiveKit**:
   - Go to your LiveKit Cloud project
   - Navigate to Project Settings → SIP
   - Enable SIP functionality
   - Note down your SIP endpoint

2. **Configure SIP Credentials**:
   - Create SIP credentials in LiveKit
   - Use these in your Twilio configuration

## Step 5: Test the Integration

1. **Start the Application**:
   ```bash
   yarn dev
   ```

2. **Navigate to Voice Agent**:
   - Go to `http://localhost:3000/room`
   - Enter a US phone number in format `+1XXXXXXXXXX`
   - Click "📞 Call"

3. **Monitor Call Status**:
   - Check the call log for status updates
   - Monitor Twilio console for call details
   - Check LiveKit room for participant connections

## Step 6: Production Deployment

### For Production, you need:

1. **HTTPS Domain**: Twilio webhooks require HTTPS
2. **Public URL**: Update `NEXT_PUBLIC_BASE_URL` to your domain
3. **Webhook URLs**: Update webhook URLs in Twilio console

### Deploy to Vercel:

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Add Environment Variables** in Vercel dashboard
4. **Update Webhook URLs** in Twilio console to use your domain

## Troubleshooting

### Common Issues:

1. **"Invalid API key" Error**:
   - Check your Twilio credentials
   - Verify phone number is purchased and active

2. **"SIP connection failed"**:
   - Verify LiveKit SIP endpoint is correct
   - Check SIP credentials in LiveKit

3. **"Webhook timeout"**:
   - Ensure your server is publicly accessible
   - Check webhook URLs are correct

4. **"Phone number not verified"**:
   - Use US phone numbers for testing
   - Indian numbers require business verification

### Testing Phone Numbers:

For testing, you can use:
- Your own phone number (US format)
- Twilio test numbers (if available)
- Virtual phone numbers

## Call Flow

1. **User enters phone number** in the interface
2. **Twilio initiates call** to the customer
3. **Customer answers** the phone
4. **Twilio connects** to LiveKit SIP endpoint
5. **AI Agent joins** the LiveKit room
6. **Real-time conversation** begins
7. **Call is recorded** and logged
8. **Call ends** and status is updated

## Features

✅ **Real Outbound Calls**: Actually dials phone numbers
✅ **LiveKit Integration**: Real-time voice communication
✅ **Call Recording**: Automatic call recording
✅ **Status Tracking**: Real-time call status updates
✅ **Webhook Handling**: Proper webhook processing
✅ **Error Handling**: Robust error handling
✅ **US Number Support**: Works with US phone numbers

## Next Steps

1. **Add Text-to-Speech**: Integrate TTS for AI responses
2. **Add Speech-to-Text**: Convert customer speech to text
3. **Add Call Analytics**: Track call metrics and outcomes
4. **Add Compliance**: Add compliance features for debt collection
5. **Add Supervisor Dashboard**: Monitor and manage calls

## Support

- [Twilio Documentation](https://www.twilio.com/docs)
- [LiveKit Documentation](https://docs.livekit.io/)
- [Twilio Support](https://support.twilio.com/)
- [LiveKit Community](https://github.com/livekit/livekit/discussions)
