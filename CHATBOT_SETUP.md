# 🤖 Dual-API Chatbot System Setup Guide

## Overview

Your FJ Store chatbot now uses a **dual-API fallback system**:

- **Primary**: **Groq API** (Fast responses, free tier available)
- **Fallback**: **Gemini API** (Reliable backup)

If Groq fails, the system automatically switches to Gemini. If both fail, users see a friendly "try again" message.

---

## 📋 What You Need

### 1. Groq API Key (Primary)
Get it here: https://console.groq.com/keys

**Steps:**
1. Go to https://console.groq.com/keys
2. Click "Create API Key"
3. Copy the key
4. Add to `.env.local` as `GROQ_API_KEY`

### 2. Gemini API Key (Already Configured)
Your Gemini key is already set up. No action needed.

---

## 🔧 Setup

### Step 1: Add Groq API Key to `.env.local`

Open `.env.local` and find:
```env
GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE
```

Replace `YOUR_GROQ_API_KEY_HERE` with your actual Groq API key.

### Step 2: Verify Configuration

Visit: `http://localhost:3000/api/ai/test`

You should see:
```json
{
  "timestamp": "2026-05-31T...",
  "groq": {
    "name": "Groq API",
    "configured": true,
    "working": true,
    "responseTime": 123
  },
  "gemini": {
    "name": "Gemini API",
    "configured": true,
    "working": true,
    "responseTime": 456
  },
  "primaryRecommendation": "✅ Both APIs working! Groq is primary, Gemini is fallback."
}
```

---

## 🎯 How It Works

### Normal Flow (Both APIs Available)
```
User sends message
    ↓
Try Groq API
    ↓ (Success)
Return Groq response ✅
```

### Fallback Flow (Groq Fails)
```
User sends message
    ↓
Try Groq API
    ↓ (Fails: timeout, error, rate limit, etc.)
Try Gemini API
    ↓ (Success)
Return Gemini response ✅
```

### Both Fail (Emergency Message)
```
User sends message
    ↓
Try Groq API → ✗ Fails
    ↓
Try Gemini API → ✗ Fails
    ↓
Return: "Sorry, the chatbot is currently unavailable. Please try again later."
```

---

## 📁 File Structure

### Service Files

**`/src/lib/ai/groq.ts`** - Groq API client
- `getGroqClient()` - Creates Groq client
- `getGroqResponse()` - Sends request to Groq

**`/src/lib/ai/gemini.ts`** - Gemini API client (unchanged)
- `getGeminiClient()` - Creates Gemini client

**`/src/lib/ai/chatbot.ts`** - Main orchestrator (NEW)
- `getChatbotResponse()` - Handles fallback logic
  1. Tries Groq
  2. Falls back to Gemini
  3. Returns friendly error if both fail

### API Routes

**`/src/app/api/ai/chat/route.ts`** - Chat endpoint (UPDATED)
- Calls `getChatbotResponse()` from chatbot service
- Returns standardized `{reply, source}` format

**`/src/app/api/ai/test/route.ts`** - Diagnostic tool (UPDATED)
- Tests both Groq and Gemini
- Shows which APIs are working
- Provides setup recommendations

---

## 🔍 Response Format

All chat responses use this format:

```json
{
  "reply": "Your AI response here",
  "source": "groq" | "gemini"
}
```

The `source` field shows which API was used. Useful for debugging.

---

## 📊 Logging & Debugging

All operations are logged with prefixes:

- **`[GROQ]`** - Groq API logs
- **`[GEMINI]`** - Gemini API logs
- **`[CHATBOT]`** - Main orchestrator logs
- **`[AI CHAT]`** - API endpoint logs

Check your server console for detailed debugging info.

Example log flow:
```
[AI CHAT] Request received
[CHATBOT] Attempting Groq API (primary)...
[GROQ] Initializing request...
[GROQ] ✓ Response received successfully
[CHATBOT] ✓ Success with Groq API
[AI CHAT] ✓ Response generated using groq (245 chars)
```

---

## ⚠️ Troubleshooting

### Issue: Chatbot returns "unavailable" message

**Check the diagnostic endpoint:**
```
GET http://localhost:3000/api/ai/test
```

Look at `primaryRecommendation` to see which APIs are down.

### Issue: GROQ_API_KEY not configured

```json
{
  "groq": {
    "configured": false,
    "working": false,
    "error": "GROQ_API_KEY is not configured in environment variables"
  }
}
```

**Fix:**
1. Get key from https://console.groq.com/keys
2. Add to `.env.local`
3. Restart dev server: `npm run dev`

### Issue: Both APIs configured but not working

Check your API keys:
1. Groq: https://console.groq.com/keys
2. Gemini: https://aistudio.google.com/app/apikey
3. Verify keys in `.env.local`
4. Check server logs for specific error messages

### Issue: Slow responses (should be fast)

Groq is slower than expected? Check:
1. Network latency
2. Groq API load (check https://status.groq.com/)
3. Both APIs working? Might be using Gemini instead

Check which API is being used in the response or server logs.

---

## 🚀 Monitoring

### Check API Status

Visit: `http://localhost:3000/api/ai/test`

This endpoint:
- Tests Groq connectivity
- Tests Gemini connectivity
- Measures response times
- Provides recommendations

### Server Logs

Watch your terminal for real-time logs:
```bash
npm run dev
```

Look for `[GROQ]`, `[GEMINI]`, `[CHATBOT]` prefixes.

---

## 📝 Environment Variables

### Required
```env
# Groq API (Primary)
GROQ_API_KEY=your_groq_key_here

# Gemini API (Already configured)
GEMINI_API_KEY=your_gemini_key_here
```

### Optional (Already Set)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Email
SMTP_EMAIL=...
SMTP_PASSWORD=...
```

---

## 🎉 You're Done!

Your chatbot now has:
- ✅ Fast primary API (Groq)
- ✅ Reliable fallback (Gemini)
- ✅ Automatic error handling
- ✅ Detailed logging
- ✅ Diagnostic tools

**Next steps:**
1. Get a Groq API key
2. Add it to `.env.local`
3. Restart your dev server
4. Test the chatbot!

---

## 🔗 Useful Links

- **Groq Console**: https://console.groq.com/keys
- **Gemini Studio**: https://aistudio.google.com/app/apikey
- **Groq Status**: https://status.groq.com/
- **Diagnostic Endpoint**: http://localhost:3000/api/ai/test
