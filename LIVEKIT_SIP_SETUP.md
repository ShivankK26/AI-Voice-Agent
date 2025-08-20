# 🔧 LiveKit SIP Setup Guide

## 🎯 **What We're Using**

Your voice agent now uses **LiveKit SIP** to connect Twilio calls to the AI agent. This provides:
- ✅ **Real-time voice communication**
- ✅ **AI agent integration**
- ✅ **Natural conversation flow**

## 📋 **Setup Requirements**

### **1. LiveKit Project Configuration**
1. **Go to**: [cloud.livekit.io](https://cloud.livekit.io/)
2. **Select your project**
3. **Enable SIP** in project settings
4. **Get your SIP endpoint URL**

### **2. Environment Variables**
Make sure your `.env.local` has:

```env
# LiveKit Configuration
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=wss://your-project.livekit.cloud
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud

# SIP Configuration (from LiveKit project settings)
SIP_URL=sip:your-sip-endpoint.sip.livekit.cloud

# Twilio Configuration
TWILIO_PHONE_NUMBER=+14753291845
ACCOUNT_SID=your_account_sid
AUTH_TOKEN=your_auth_token

# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-api03-your-key

# Webhook URL
NEXT_PUBLIC_BASE_URL=https://19601fac91e0.ngrok-free.app
```

## 🔄 **How It Works**

### **Call Flow:**
1. **User clicks "Call"** in the interface
2. **Twilio calls your phone** (+918285249249)
3. **Twilio connects to LiveKit SIP** using credentials
4. **AI agent joins the room** and starts conversation
5. **Real-time conversation** between you and AI

### **SIP Connection:**
```
Twilio → LiveKit SIP → AI Agent Room → Real Conversation
```

## 🧪 **Testing**

1. **Ensure LiveKit SIP is enabled** in your project
2. **Verify SIP URL** is correct in environment
3. **Test the call** - you should hear the AI agent
4. **Have a conversation** - the AI will respond naturally

## 🆘 **Troubleshooting**

**If calls don't connect:**
- Check LiveKit SIP is enabled
- Verify SIP URL format
- Ensure API credentials are correct

**If AI doesn't respond:**
- Check Anthropic API key
- Verify LiveKit room connection
- Monitor console logs

---

**Your system now uses proper LiveKit SIP integration!** 🎉
