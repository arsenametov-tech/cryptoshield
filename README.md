# Cryptoshield - Telegram Mini App

AI-powered crypto security scanner for detecting scams, honeypots, and fraud in Telegram. Built with Expo, React Native, and Newell AI.

---

## 🚀 Quick Start

**New to this project?** Start here:

1. **Quick Setup** (5 minutes): Read [`QUICK_START.md`](./QUICK_START.md)
2. **Detailed Setup** (comprehensive): Read [`LOCAL_SETUP.md`](./LOCAL_SETUP.md)
3. **Having Issues?**: Check [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md)

### TL;DR - Get Running Fast

```bash
# 1. Install dependencies
npm install

# 2. Check your setup (optional but recommended)
./check-setup.sh

# 3. Start development server
npx expo start

# For Telegram Mini App testing:
npx expo start --tunnel
```

---

## 📚 Documentation

| Guide | Purpose | When to Use |
|-------|---------|-------------|
| **[QUICK_START.md](./QUICK_START.md)** | Get up and running in 5 minutes | First time setup, quick reference |
| **[LOCAL_SETUP.md](./LOCAL_SETUP.md)** | Complete setup guide with all details | Comprehensive setup, TMA testing, environment config |
| **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** | Fix common issues | When you encounter errors |
| **[COMMANDS.md](./COMMANDS.md)** | Command reference & cheat sheet | Quick command lookup |
| **`./check-setup.sh`** | Automated setup checker | Verify your environment is ready |
| **[CLAUDE.md](./CLAUDE.md)** | Coding guidelines & patterns | When developing features |

---

## ✨ Key Features

- 🔍 **Contract Address Scanning** - Detect honeypots and scams
- 🌐 **URL Security Checking** - Identify phishing sites
- 🤖 **AI Security Expert** - Chat with Newell AI about crypto risks
- 📸 **Screenshot Analysis** - Detect fraud patterns in images
- 🎯 **Telegram-Native** - Optimized for Telegram Mini App
- 🌍 **Multi-Language** - English & Russian support
- 💎 **Premium Features** - Subscriptions via Adapty

---

## 🛠️ Tech Stack

- **Framework**: [Expo SDK 54](https://expo.dev) + React Native 0.81
- **Navigation**: [Expo Router 6](https://docs.expo.dev/router/introduction/)
- **Language**: TypeScript (strict mode)
- **TMA SDK**: [@twa-dev/sdk](https://github.com/twa-dev/sdk)
- **AI**: [@fastshot/ai](https://fastshot.ai) (Newell AI)
- **Backend**: Supabase (optional)
- **Monetization**: React Native Adapty

---

## 🏃 Running Locally

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 8+
- **Telegram** account (for TMA testing)

### Basic Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the app
npx expo start
```

### Telegram Mini App Testing

To test TMA-specific features (user data, haptics, etc.):

```bash
# Start with tunnel (generates HTTPS URL)
npx expo start --tunnel

# Then configure your Telegram bot menu button
# with the generated URL (e.g., https://abcd1234.ngrok.io)
```

**📖 See [LOCAL_SETUP.md](./LOCAL_SETUP.md#testing-tma-features-locally) for detailed TMA testing instructions.**

---

## 🔧 Development Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `./check-setup.sh` | Check your setup |
| `npx expo start` | Start dev server |
| `npx expo start --tunnel` | Start with HTTPS (for TMA) |
| `npx expo start -c` | Clear cache and start |
| `npx tsc` | TypeScript type check |
| `npm run lint` | Lint code |

---

## 📱 Testing Options

### 1. Web Browser (Quick Iteration)
```bash
npx expo start
# Press 'w' to open in browser
```
✅ UI, navigation, AI features
❌ TMA-specific features

### 2. Expo Go App (Mobile Testing)
```bash
npx expo start
# Scan QR code with Expo Go app
```
✅ Full mobile experience
⚠️  Some TMA features limited

### 3. Telegram Bot (Full TMA) ⭐ Recommended
```bash
npx expo start --tunnel
# Configure bot menu button with tunnel URL
```
✅ All features including TMA
✅ Real Telegram user data
✅ Native haptics and buttons

**📖 Detailed instructions: [LOCAL_SETUP.md](./LOCAL_SETUP.md#testing-tma-features-locally)**

---

## 🔐 Environment Variables

Required variables (already configured):
```bash
EXPO_PUBLIC_NEWELL_API_URL=https://newell.fastshot.ai
EXPO_PUBLIC_PROJECT_ID=29bbb5d7-cafd-4726-892d-e2b4830a3d78
```

Optional (for Supabase auth):
```bash
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_AUTH_BROKER_URL=your-auth-broker-url
```

**💡 Tip:** Environment variables auto-sync from the [Fastshot dashboard](https://fastshot.ai).

**📖 More details: [LOCAL_SETUP.md](./LOCAL_SETUP.md#environment-variables)**

---

## ❗ Troubleshooting

Having issues? Quick fixes:

```bash
# npm install fails
npm install --legacy-peer-deps

# Metro bundler issues
npx expo start -c

# TMA features not working
npx expo start --tunnel
# Then test via Telegram bot

# Check for errors
cat .fastshot-logs/expo-dev-server.log
```

**📖 Full troubleshooting guide: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**

---

## 📂 Project Structure

```
workspace/
├── app/              # Expo Router screens
│   ├── (tabs)/       # Main navigation tabs
│   ├── _layout.tsx   # Root layout (TMA init)
│   └── onboarding/   # Onboarding flow
├── components/       # React components
├── services/         # Business logic
│   ├── telegram.ts   # TMA SDK wrapper
│   └── ...           # Other services
├── examples/         # Expo component examples
├── .env              # Environment variables
└── app.json          # Expo configuration
```

---

## 🤝 Contributing

This is a Fastshot-managed project. To make changes:

1. Edit code locally
2. Test with `npx expo start`
3. Check quality: `npx tsc && npm run lint`
4. Go to [Fastshot](https://fastshot.ai) to deploy

---

## Need help?

Have questions or want to iterate on your app? Head back to [Fastshot](https://fastshot.ai) to continue chatting with our AI agents. They can help you:

- Add new features and screens
- Debug issues and fix bugs
- Refactor and improve your code
- Integrate APIs and third-party libraries

## Learn more

To learn more about developing your project, check out these resources:

### Fastshot Resources
- [Fastshot Platform](https://fastshot.ai): Build and iterate on your mobile apps with AI assistance
- [Fastshot Documentation](https://fastshot.ai/docs): Learn how to make the most of AI-powered development
- [Fastshot Community](https://fastshot.ai/community): Connect with other developers building with Fastshot

### Expo Resources
- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers building the future of mobile development with AI:

- **[Fastshot Discord](https://fastshot.ai/discord)**: Get help, share your projects, and connect with other Fastshot users
- **[Fastshot on GitHub](https://github.com/fastshot-ai)**: Contribute to our open source tools and integrations

You can also join the broader Expo community:
- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
