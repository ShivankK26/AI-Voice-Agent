# 🔧 Troubleshooting Dynamic Call Issues

## 🎯 **Current Problem: "Application Error" in Calls**

Your calls are not dynamic and showing "application error occurred". Here's how to fix it:

## 🔍 **Step 1: Verify Webhook Connectivity**

### **Test Webhook Endpoint:**
```bash
# Test if your webhook is accessible
curl -X GET https://19601fac91e0.ngrok-free.app/api/call/test-webhook
```

**Expected Response:**
```json
{
  "status": "Webhook endpoint is accessible",
  "timestamp": "2024-01-XX..."
}
```

### **Test Webhook with Twilio:**
1. **Go to**: https://19601fac91e0.ngrok-free.app/room
2. **Click "📞 Call"**
3. **Check terminal logs** for webhook calls

## 🔧 **Step 2: Check Environment Variables**

Make sure your `.env.local` has:

```env
# Twilio Configuration
TWILIO_PHONE_NUMBER=+14753291845
ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Webhook URL (IMPORTANT!)
NEXT_PUBLIC_BASE_URL=https://19601fac91e0.ngrok-free.app

# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🚨 **Step 3: Common Issues & Fixes**

### **Issue 1: Webhook URL Not Accessible**
**Symptoms**: "Application error" immediately after call starts
**Fix**: 
- Ensure ngrok is running: `ngrok http 3000`
- Verify URL: https://19601fac91e0.ngrok-free.app
- Test endpoint: `curl https://19601fac91e0.ngrok-free.app/api/call/test-webhook`

### **Issue 2: Twilio Can't Reach Webhook**
**Symptoms**: Call starts but no interactive response
**Fix**:
- Check Twilio Console → Phone Numbers → Your number
- Verify webhook URL is set correctly
- Ensure HTTPS (not HTTP)

### **Issue 3: Speech Recognition Not Working**
**Symptoms**: Call connects but doesn't understand speech
**Fix**:
- Speak clearly and loudly
- Reduce background noise
- Check confidence threshold in code (currently 0.3)

## 🧪 **Step 4: Debug Mode**

### **Enable Debug Logging:**
The system now logs:
- 🔗 Webhook URL being used
- 🎤 Speech received from user
- 🤖 AI responses generated
- 📞 Call status updates

### **Check Terminal Output:**
Look for these log messages:
```
🔗 Webhook URL: https://19601fac91e0.ngrok-free.app/api/call/interactive
🎤 SPEECH RECEIVED: { speechResult: "...", confidence: "0.8" }
🤖 AI RESPONSE: "I understand your situation..."
```

## 🔄 **Step 5: Test the Complete Flow**

### **Expected Call Flow:**
1. **Call starts**: "Hello, this is Sarah from First National Bank..."
2. **You speak**: "Yes, this is me"
3. **AI responds**: "Thank you for confirming. I'm calling about..."
4. **Conversation continues**: Back and forth dialogue

### **If Still Not Working:**
1. **Check ngrok logs** for incoming requests
2. **Check terminal logs** for webhook calls
3. **Verify Twilio phone number** configuration
4. **Test with simple speech**: "Yes" or "Hello"

## 🎯 **Quick Fix Commands**

```bash
# Restart everything
pkill -f ngrok
pkill -f "yarn dev"
ngrok http 3000
yarn dev

# Test webhook
curl https://19601fac91e0.ngrok-free.app/api/call/test-webhook
```

## 📞 **Expected Behavior**

**Working Call:**
- ✅ Call connects immediately
- ✅ AI speaks greeting
- ✅ You can speak and be understood
- ✅ AI responds intelligently
- ✅ Conversation continues naturally

**Broken Call:**
- ❌ "Application error" message
- ❌ Call cuts off after greeting
- ❌ No response to speech
- ❌ Static, non-interactive

---

**Try the call now and let me know what happens!** 🎉
