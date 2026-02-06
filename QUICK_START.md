# 🚀 Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- **Node.js 18+** and **npm 8+** installed
- **Telegram** account (for testing TMA features)

---

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

**If this fails**, try:
```bash
npm install --legacy-peer-deps
```

---

### 2. Check Your Setup

Run the automated setup checker:

```bash
./check-setup.sh
```

This will verify:
- ✅ Node.js and npm versions
- ✅ Dependencies installed correctly
- ✅ Environment variables configured
- ✅ Configuration files present
- ✅ No TypeScript errors

---

### 3. Configure Environment (If Needed)

Check if `.env` file exists and has required variables:

```bash
cat .env
```

**Required variables:**
```bash
EXPO_PUBLIC_NEWELL_API_URL=https://newell.fastshot.ai
EXPO_PUBLIC_PROJECT_ID=29bbb5d7-cafd-4726-892d-e2b4830a3d78
```

**Optional (for Supabase auth):**
```bash
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_AUTH_BROKER_URL=your-auth-broker-url
```

> 💡 **Tip:** Environment variables are auto-synced from the Fastshot dashboard.
> If missing, update them in the Fastshot interface.

---

### 4. Start Development Server

**For web/mobile testing:**
```bash
npx expo start
```

**For Telegram Mini App testing:**
```bash
npx expo start --tunnel
```

---

### 5. Test the App

#### Option A: Web Browser (Basic Testing)
```bash
npx expo start
# Press 'w' to open in browser
```

**Works:** UI, navigation, AI features, scanning logic
**Doesn't work:** Telegram-specific features (user data, haptics, buttons)

#### Option B: Expo Go App (Mobile Testing)
```bash
npx expo start
# Scan QR code with Expo Go app (iOS/Android)
```

**Works:** Full mobile experience, most features
**Doesn't work:** Some TMA-specific features

#### Option C: Telegram Bot (Full TMA Testing) ⭐ Recommended

1. **Start with tunnel:**
   ```bash
   npx expo start --tunnel
   ```

   You'll get a URL like: `https://abcd1234.ngrok.io`

2. **Create a Telegram bot:**
   - Open [@BotFather](https://t.me/botfather) in Telegram
   - Send: `/newbot`
   - Follow instructions to create your bot

3. **Configure menu button:**
   - Send: `/mybots` to BotFather
   - Select your bot
   - Click: "Bot Settings" → "Menu Button" → "Edit Menu Button URL"
   - Enter your tunnel URL: `https://abcd1234.ngrok.io`

4. **Test in Telegram:**
   - Open your bot in Telegram
   - Click the menu button (bottom left)
   - Your app opens with full TMA features! 🎉

---

## Common Commands

| Task | Command |
|------|---------|
| **Install dependencies** | `npm install` |
| **Check setup** | `./check-setup.sh` |
| **Start dev server** | `npx expo start` |
| **Start with tunnel** | `npx expo start --tunnel` |
| **Clear cache** | `npx expo start -c` |
| **Type check** | `npx tsc` |
| **Lint code** | `npm run lint` |
| **View logs** | `cat .fastshot-logs/expo-dev-server.log` |

---

## Troubleshooting

### Issue: npm install fails

**Solution 1:** Clear cache and reinstall
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Solution 2:** Use legacy peer deps
```bash
npm install --legacy-peer-deps
```

### Issue: Metro bundler errors

**Solution:** Clear cache
```bash
npx expo start -c
```

### Issue: TypeScript errors

**Solution:** Check and fix errors
```bash
npx tsc
```

### Issue: TMA features not working

**Solution:** Test via Telegram bot with tunnel (see Option C above)

### Issue: Environment variables not loading

**Solution:** Restart Expo server
```bash
# Kill the server (Ctrl+C) and restart
npx expo start
```

---

## Project Structure (Quick Reference)

```
workspace/
├── app/              # Expo Router screens
│   ├── (tabs)/       # Tab navigation (Home, History, Expert, Learn)
│   └── _layout.tsx   # Root layout (TMA init)
├── components/       # React components
├── services/         # Business logic
│   ├── telegram.ts   # TMA SDK wrapper
│   └── telegramAuth.ts # TMA auth
├── .env              # Environment variables
└── app.json          # Expo configuration
```

---

## What's Next?

✅ **Development:**
- Edit files in `app/`, `components/`, `services/`
- Hot reload updates automatically
- Check `examples/` folder for Expo patterns

✅ **Testing:**
- Test in browser for quick iteration
- Use Expo Go for mobile testing
- Use Telegram bot for full TMA testing

✅ **Quality:**
- Run `npx tsc` before committing
- Run `npm run lint` to check code style
- Check logs in `.fastshot-logs/` for errors

---

## Need More Help?

📖 **Detailed Guide:** Read `LOCAL_SETUP.md` for comprehensive documentation

🔍 **Check Setup:** Run `./check-setup.sh` to diagnose issues

📋 **View Logs:** Check `.fastshot-logs/expo-dev-server.log` for errors

🆘 **Get Support:**
- [Fastshot Platform](https://fastshot.ai)
- [Fastshot Discord](https://fastshot.ai/discord)
- [Expo Documentation](https://docs.expo.dev/)

---

## Quick Checklist

Before starting development, ensure:

- [ ] Node.js 18+ installed (`node -v`)
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file has required variables
- [ ] Setup checker passes (`./check-setup.sh`)
- [ ] Expo dev server starts (`npx expo start`)
- [ ] App opens in browser/device

**For TMA testing:**
- [ ] Tunnel starts (`npx expo start --tunnel`)
- [ ] Telegram bot created
- [ ] Menu button URL configured
- [ ] App opens in Telegram

---

🎉 **You're ready to build!**

Happy coding! 🚀
