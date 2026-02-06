# Local Development Setup Guide

Welcome to the **Cryptoshield** Telegram Mini App project! This guide will help you set up the project locally for development.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Project Overview](#project-overview)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Testing TMA Features Locally](#testing-tma-features-locally)
- [Common Issues & Troubleshooting](#common-issues--troubleshooting)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

| Software | Version | Check Command |
|----------|---------|---------------|
| **Node.js** | v18.0.0 or higher | `node -v` |
| **npm** | v8.0.0 or higher | `npm -v` |
| **Git** | Latest | `git --version` |

**Current Environment:**
- Node.js: `v20.20.0` ✅
- npm: `10.8.2` ✅

### Recommended Tools

- **Expo Go** app (iOS/Android) - for testing on physical devices
- **ngrok** or **Expo Tunnel** - for TMA testing (already included in dependencies)
- **Telegram** account - for testing TMA features

---

## Project Overview

This is a **Telegram Mini App (TMA)** built with:

- **Expo SDK 54** - React Native framework
- **Expo Router 6** - File-based navigation
- **TypeScript** - Type safety
- **@twa-dev/sdk** - Telegram WebApp SDK
- **@fastshot/ai** - AI integration (Newell AI)
- **Supabase** (optional) - Backend services
- **React Native Adapty** - In-app purchases/subscriptions

### Key Features

✅ Contract address scanning
✅ URL security checking
✅ AI-powered fraud detection
✅ Screenshot analysis with Newell Vision AI
✅ Telegram-native authentication
✅ Multi-language support (English/Russian)
✅ Premium subscriptions

---

## Installation

### Step 1: Clone the Repository

```bash
# If you haven't cloned yet
git clone <your-repo-url>
cd workspace
```

### Step 2: Install Dependencies

```bash
npm install
```

**If `npm install` fails, try these solutions:**

#### Solution 1: Clear npm cache
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Solution 2: Use specific npm registry
```bash
npm install --registry=https://registry.npmjs.org/
```

#### Solution 3: Install with legacy peer deps (for dependency conflicts)
```bash
npm install --legacy-peer-deps
```

#### Solution 4: Check Node version
```bash
# This project requires Node 18+
node -v

# If your version is lower, upgrade Node.js
# Using nvm (recommended):
nvm install 20
nvm use 20
```

---

## Environment Variables

The project uses a `.env` file for configuration. This file is **auto-generated** but you may need to add additional variables.

### Current Environment Variables

Check your `.env` file (located at `/workspace/.env`):

```bash
# System variables (auto-generated)
EXPO_PUBLIC_NEWELL_API_URL=https://newell.fastshot.ai
EXPO_PUBLIC_PROJECT_ID=29bbb5d7-cafd-4726-892d-e2b4830a3d78

# User variables (you may need to add these)
EXPO_PUBLIC_REVENUECAT_API_KEY=
```

### Required Environment Variables

#### For AI Features (Newell AI)
Already configured! ✅
- `EXPO_PUBLIC_NEWELL_API_URL` - Newell AI API endpoint
- `EXPO_PUBLIC_PROJECT_ID` - Your Fastshot project ID

#### For Authentication (Supabase - Optional)
If you want to use Supabase authentication:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_AUTH_BROKER_URL=your-auth-broker-url
```

**To connect Supabase:**
1. Go to the Fastshot dashboard
2. Connect Supabase to your project
3. The environment variables will be auto-synced

#### For In-App Purchases (Adapty/RevenueCat - Optional)
```bash
EXPO_PUBLIC_REVENUECAT_API_KEY=your-revenuecat-key
```

### Adding/Updating Environment Variables

**Option 1: Via Fastshot Dashboard (Recommended)**
- Update env variables in the Fastshot interface
- They will automatically sync to your `.env` file

**Option 2: Manual Edit**
```bash
# Edit the .env file directly
nano .env

# Or use any text editor
code .env
```

⚠️ **Important Notes:**
- All Expo public variables MUST be prefixed with `EXPO_PUBLIC_`
- After changing `.env`, restart your development server
- Never commit `.env` to version control (already in `.gitignore`)

---

## Running the App

The Metro server is **already running** in this environment, so you don't need to start it manually.

### For Local Development (If Metro is NOT running)

```bash
# Start Expo development server
npx expo start
```

This will show a QR code and options:
- Press `i` - Open iOS simulator (macOS only)
- Press `a` - Open Android emulator
- Press `w` - Open web browser
- Scan QR code - Open in Expo Go app

### Development Commands

```bash
# Type checking
npx tsc

# Linting
npm run lint

# Clear cache and restart (if you encounter issues)
npx expo start -c
```

---

## Testing TMA Features Locally

Since this is a **Telegram Mini App**, testing TMA-specific features requires special setup.

### Understanding TMA Testing

The TMA SDK (`@twa-dev/sdk`) only works when:
1. Running inside Telegram's WebView
2. Proper Telegram init data is available

When running locally (web browser, iOS/Android), TMA features will be **limited**.

### Method 1: Test in Web Browser (Limited TMA Features)

```bash
npx expo start
# Press 'w' to open in web browser
```

**What works:**
- ✅ Basic UI and navigation
- ✅ AI features (Newell AI)
- ✅ Screenshot analysis
- ✅ Contract scanning logic

**What doesn't work:**
- ❌ Telegram user data
- ❌ Telegram haptics
- ❌ Telegram main button
- ❌ Telegram back button

### Method 2: Test with Expo Tunnel + Telegram Bot

This is the **recommended** way to test TMA features properly.

#### Step 1: Start Expo with Tunnel

```bash
npx expo start --tunnel
```

This will generate a public HTTPS URL using ngrok:
```
Tunnel ready.
› Metro waiting on https://abcd1234.ngrok.io
```

#### Step 2: Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` and follow instructions
3. Get your bot token (save it securely)

#### Step 3: Create a Mini App

1. Send `/mybots` to BotFather
2. Select your bot
3. Click "Bot Settings" → "Menu Button"
4. Choose "Edit Menu Button URL"
5. Enter your tunnel URL: `https://abcd1234.ngrok.io`

#### Step 4: Test in Telegram

1. Open your bot in Telegram
2. Click the menu button (bottom left)
3. Your app will open inside Telegram's WebView
4. All TMA features will now work! 🎉

### Method 3: Test with Local Telegram Bot Dev Tools

Telegram provides official dev tools for TMA testing:

```bash
# Install Telegram Web Dev Tools (optional)
npm install -g @telegram-apps/cli

# Run with dev tools
telegram-apps dev --port 8081
```

Visit: https://web.telegram.org/k/

### Checking TMA Status in Code

The app automatically detects if it's running in Telegram:

```typescript
import { TelegramService } from '@/services/telegram';

// Check if running in Telegram
if (TelegramService.isInTelegram()) {
  // TMA features available
  const user = TelegramService.getUser();
  console.log('Telegram user:', user);
} else {
  // Running in regular browser/app
  console.log('Not in Telegram');
}
```

### TMA Feature Fallbacks

The app is designed with fallbacks:

```typescript
// In app/_layout.tsx (line 27-44)
if (Platform.OS === 'web' && TelegramService.isInTelegram()) {
  // TMA-specific initialization
  TelegramService.expand();
  const telegramUser = await TelegramAuthService.initialize();
} else {
  // Standard app initialization
  await checkOnboarding();
}
```

---

## Common Issues & Troubleshooting

### Issue 1: `npm install` fails with ERESOLVE error

**Solution:**
```bash
npm install --legacy-peer-deps
```

Or add to `.npmrc`:
```bash
echo "legacy-peer-deps=true" > .npmrc
npm install
```

### Issue 2: Metro bundler errors

**Solution:**
```bash
# Clear all caches
npx expo start -c

# Or manually clear
rm -rf node_modules .expo .expo-shared
npm install
```

### Issue 3: TypeScript errors

**Solution:**
```bash
# Check TypeScript
npx tsc

# Common fix: regenerate Expo types
npx expo customize tsconfig.json
```

### Issue 4: TMA features not working

**Symptoms:**
- `TelegramService.isInTelegram()` returns `false`
- No Telegram user data available

**Diagnosis:**
```typescript
// Add to your component
import WebApp from '@twa-dev/sdk';

console.log('Platform:', WebApp.platform);
console.log('Init Data:', WebApp.initData);
console.log('User:', WebApp.initDataUnsafe.user);
```

**Solutions:**
1. Make sure you're testing via Telegram bot (see Method 2 above)
2. Check that the URL is HTTPS (required by Telegram)
3. Verify `--tunnel` is working properly

### Issue 5: Environment variables not loading

**Symptoms:**
- `EXPO_PUBLIC_*` variables are `undefined`
- AI features return errors

**Solution:**
```bash
# 1. Check if .env exists
cat .env

# 2. Verify variable names start with EXPO_PUBLIC_
# 3. Restart Expo server completely
# Kill the process and restart

# 4. Check babel.config.js includes your variables (already configured)
```

### Issue 6: Expo tunnel not starting

**Solution:**
```bash
# Install ngrok globally
npm install -g @expo/ngrok

# Or use Expo's built-in tunnel
npx expo start --tunnel

# If still failing, try localtunnel
npx expo start --tunnel --tunnel-provider localtunnel
```

### Issue 7: Web build fails

**Solution:**
```bash
# Clear web build cache
rm -rf web-build
npx expo export:web

# Check for web-specific errors in:
cat .fastshot-logs/expo-export.log
```

### Issue 8: Module resolution errors

**Error:**
```
Unable to resolve "@/services/..."
```

**Solution:**
```bash
# Check tsconfig.json paths are correct
cat tsconfig.json

# Clear Metro cache
npx expo start -c

# Reinstall dependencies
rm -rf node_modules
npm install
```

---

## Development Workflow

### Recommended Development Flow

1. **Start Development Server**
   ```bash
   npx expo start
   # Or with tunnel for TMA testing
   npx expo start --tunnel
   ```

2. **Make Changes**
   - Edit files in `/app`, `/components`, `/services`
   - Hot reload will update automatically

3. **Test Changes**
   - Web: Press `w`
   - iOS: Press `i` (macOS only)
   - Android: Press `a`
   - TMA: Open via Telegram bot

4. **Check Code Quality**
   ```bash
   # Type check
   npx tsc

   # Lint
   npm run lint
   ```

5. **Check Logs for Errors**
   ```bash
   # Development server logs
   cat .fastshot-logs/expo-dev-server.log

   # Build logs
   cat .fastshot-logs/expo-export.log
   ```

### Git Workflow

```bash
# Check status
git status

# Stage changes
git add .

# Commit (will trigger pre-commit hooks if configured)
git commit -m "feat: add new feature"

# Push
git push origin main
```

---

## Project Structure

```
workspace/
├── app/                          # Expo Router pages
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── index.tsx             # Home screen (scan)
│   │   ├── history.tsx           # Scan history
│   │   ├── expert.tsx            # AI expert chat
│   │   └── learn.tsx             # Learn about crypto security
│   ├── _layout.tsx               # Root layout (TMA initialization)
│   └── onboarding/               # Onboarding flow
│
├── components/                   # React components
│   ├── ui/                       # UI components
│   └── ...                       # Feature components
│
├── services/                     # Business logic
│   ├── telegram.ts               # TMA SDK wrapper
│   ├── telegramAuth.ts           # TMA authentication
│   ├── telegramStars.ts          # Telegram Stars payments
│   └── ...                       # Other services
│
├── contexts/                     # React contexts
│   └── TelegramContext.tsx       # TMA context provider
│
├── constants/                    # App constants
│   └── theme.ts                  # Colors, styles
│
├── assets/                       # Static assets
│   ├── images/                   # Images, icons
│   └── fonts/                    # Custom fonts
│
├── examples/                     # Example implementations
│   └── (various examples)        # Expo component patterns
│
├── .env                          # Environment variables (auto-generated)
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── babel.config.js               # Babel config (env vars)
├── metro.config.js               # Metro bundler config
└── telegram-mini-app.config.json # TMA metadata
```

### Key Files

#### `app/_layout.tsx`
- Root component
- TMA initialization
- Telegram user authentication
- Onboarding flow logic

#### `services/telegram.ts`
- Wrapper around `@twa-dev/sdk`
- All TMA features (haptics, buttons, popups, etc.)
- Check `TelegramService.isInTelegram()` before using

#### `telegram-mini-app.config.json`
- TMA metadata and feature flags
- Used for documentation and configuration

#### `.env`
- Environment variables
- Auto-synced from Fastshot dashboard
- Prefix all variables with `EXPO_PUBLIC_`

---

## Additional Resources

### Expo Documentation
- [Expo Docs](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)

### Telegram Mini Apps
- [TMA Documentation](https://core.telegram.org/bots/webapps)
- [TMA SDK (@twa-dev/sdk)](https://github.com/twa-dev/sdk)
- [TMA Demo](https://github.com/twa-dev/demo)

### Fastshot Resources
- [Fastshot Platform](https://fastshot.ai)
- [Newell AI Docs](https://newell.fastshot.ai/docs)

### Project-Specific
- Check `/examples` folder for Expo patterns
- Check `CLAUDE.md` for coding guidelines
- Check `.fastshot-logs/` for runtime logs

---

## Need Help?

### Common Commands Quick Reference

```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Start with tunnel (for TMA testing)
npx expo start --tunnel

# Type check
npx tsc

# Lint
npm run lint

# Clear cache
npx expo start -c

# View logs
cat .fastshot-logs/expo-dev-server.log

# Check environment variables
cat .env
```

### Getting Support

1. **Check logs first:**
   ```bash
   cat .fastshot-logs/expo-dev-server.log
   ```

2. **Search the codebase:**
   ```bash
   # Check examples for patterns
   ls examples/
   ```

3. **Ask in Fastshot:**
   - Go back to [Fastshot](https://fastshot.ai)
   - The AI agents can help debug issues

4. **Community:**
   - [Fastshot Discord](https://fastshot.ai/discord)
   - [Expo Discord](https://chat.expo.dev)

---

## Summary

✅ **Setup Steps:**
1. Ensure Node.js 18+ and npm 8+ are installed
2. Run `npm install`
3. Check/configure `.env` file
4. Run `npx expo start` (or `--tunnel` for TMA testing)
5. Test in browser or via Telegram bot

✅ **For TMA Testing:**
- Use `npx expo start --tunnel`
- Create a Telegram bot via @BotFather
- Set menu button URL to your ngrok URL
- Open bot in Telegram and test

✅ **Common Issues:**
- npm install fails → use `--legacy-peer-deps`
- TMA features not working → test via Telegram bot with tunnel
- Env vars not loading → restart Expo server

🚀 **You're ready to develop!**
