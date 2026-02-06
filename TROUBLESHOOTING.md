# 🔧 Troubleshooting Guide

Comprehensive solutions for common issues when setting up and running Cryptoshield locally.

---

## Table of Contents

- [npm install Issues](#npm-install-issues)
- [Expo Development Server Issues](#expo-development-server-issues)
- [Telegram Mini App Issues](#telegram-mini-app-issues)
- [TypeScript/Build Issues](#typescriptbuild-issues)
- [Environment Variable Issues](#environment-variable-issues)
- [Platform-Specific Issues](#platform-specific-issues)

---

## npm install Issues

### Error: ERESOLVE unable to resolve dependency tree

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! conflicting peer dependencies
```

**Solutions:**

1. **Use legacy peer deps (Recommended):**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Create .npmrc file:**
   ```bash
   echo "legacy-peer-deps=true" > .npmrc
   npm install
   ```

3. **Force install (last resort):**
   ```bash
   npm install --force
   ```

---

### Error: EACCES permission denied

**Symptoms:**
```
npm ERR! code EACCES
npm ERR! syscall access
npm ERR! path /usr/local/lib/node_modules
npm ERR! errno -13
```

**Solution (macOS/Linux):**
```bash
# Fix npm permissions (recommended method)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Then install again
npm install
```

**Solution (Alternative):**
```bash
# Use npx instead (no global install needed)
npx expo start
```

---

### Error: ECONNREFUSED or ETIMEDOUT

**Symptoms:**
```
npm ERR! code ECONNREFUSED
npm ERR! errno ECONNREFUSED
npm ERR! FetchError: request to https://registry.npmjs.org/...
```

**Solutions:**

1. **Check internet connection**

2. **Change npm registry:**
   ```bash
   npm config set registry https://registry.npmjs.org/
   npm install
   ```

3. **Clear npm cache:**
   ```bash
   npm cache clean --force
   npm install
   ```

4. **Check proxy settings:**
   ```bash
   npm config delete proxy
   npm config delete https-proxy
   npm install
   ```

---

### Error: Integrity check failed

**Symptoms:**
```
npm ERR! code EINTEGRITY
npm ERR! sha512-... integrity checksum failed
```

**Solution:**
```bash
# Clear package-lock and cache
rm -rf package-lock.json node_modules
npm cache clean --force
npm install
```

---

### Error: gyp ERR! (Node-gyp issues)

**Symptoms:**
```
gyp ERR! find Python
gyp ERR! stack Error: Could not find any Python installation
```

**Solution (macOS):**
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Python (if needed)
brew install python
```

**Solution (Windows):**
```bash
# Install windows-build-tools
npm install --global windows-build-tools
```

**Solution (Linux):**
```bash
# Install build essentials
sudo apt-get install build-essential
```

---

## Expo Development Server Issues

### Error: Metro bundler won't start

**Symptoms:**
- `npx expo start` hangs or crashes
- Port already in use
- "Couldn't start project" error

**Solutions:**

1. **Clear Metro cache:**
   ```bash
   npx expo start -c
   # Or manually clear
   rm -rf .expo .metro-health-check*
   npx expo start
   ```

2. **Kill existing Metro process:**
   ```bash
   # Find and kill process on port 8081 (macOS/Linux)
   lsof -ti:8081 | xargs kill -9

   # Or use different port
   npx expo start --port 8082
   ```

   ```powershell
   # Windows
   netstat -ano | findstr :8081
   taskkill /PID <PID> /F
   ```

3. **Reset Expo cache completely:**
   ```bash
   rm -rf node_modules .expo .expo-shared
   npm install
   npx expo start -c
   ```

---

### Error: "Uncaught Error: Cannot find module"

**Symptoms:**
```
Error: Cannot find module '@/services/telegram'
Module not found: Can't resolve '@/components/...'
```

**Solutions:**

1. **Verify path aliases in tsconfig.json:**
   ```bash
   cat tsconfig.json
   ```
   Should have:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```

2. **Clear Metro cache:**
   ```bash
   npx expo start -c
   ```

3. **Check if file exists:**
   ```bash
   ls services/telegram.ts
   ```

---

### Error: Expo Go app shows "Something went wrong"

**Symptoms:**
- App loads in Expo Go but shows error screen
- Red screen with error message
- Logs show runtime errors

**Solutions:**

1. **Check development server logs:**
   ```bash
   # In terminal where expo start is running
   # Or check log files
   cat .fastshot-logs/expo-dev-server.log
   ```

2. **Verify device is on same network:**
   - Phone and computer must be on same WiFi
   - Disable VPN if active

3. **Try LAN connection instead of tunnel:**
   ```bash
   npx expo start --lan
   ```

4. **Reload app in Expo Go:**
   - Shake device
   - Press "Reload"

---

## Telegram Mini App Issues

### Issue: TelegramService.isInTelegram() returns false

**Symptoms:**
- TMA features don't work
- Can't get Telegram user data
- App behaves like normal web app

**Diagnosis:**
```typescript
// Add to your component
import WebApp from '@twa-dev/sdk';

console.log('Platform:', WebApp.platform);
console.log('Version:', WebApp.version);
console.log('Init Data:', WebApp.initData);
console.log('User:', WebApp.initDataUnsafe.user);
```

**Solutions:**

1. **Ensure testing via Telegram bot:**
   - TMA SDK only works inside Telegram WebView
   - Browser testing won't enable TMA features
   - See [Testing TMA Features](#testing-tma-features-properly)

2. **Verify HTTPS connection:**
   - Telegram requires HTTPS
   - Use `npx expo start --tunnel` for HTTPS URL

3. **Check Telegram version:**
   - Minimum Telegram version: 6.0
   - Update Telegram app if older

---

### Issue: Tunnel won't start (@expo/ngrok errors)

**Symptoms:**
```
Error: Could not connect to ngrok
[@expo/ngrok] ngrok: command not found
Tunnel connection failed
```

**Solutions:**

1. **Reinstall ngrok dependency:**
   ```bash
   npm install -D @expo/ngrok
   ```

2. **Try alternative tunnel provider:**
   ```bash
   npx expo start --tunnel --tunnel-provider localtunnel
   ```

3. **Use ngrok directly (advanced):**
   ```bash
   # Install ngrok globally
   npm install -g ngrok

   # Start Expo without tunnel
   npx expo start

   # In another terminal, start ngrok
   ngrok http 8081
   ```

4. **Check firewall settings:**
   - Ensure ngrok can connect to internet
   - Disable VPN if blocking connections

---

### Issue: Telegram main button not showing

**Symptoms:**
- `TelegramService.showMainButton()` doesn't work
- Main button is invisible
- No error messages

**Solutions:**

1. **Verify running in Telegram:**
   ```typescript
   if (!TelegramService.isInTelegram()) {
     console.log('Not in Telegram - buttons won't work');
     return;
   }
   ```

2. **Check button is enabled:**
   ```typescript
   TelegramService.showMainButton('Click Me', () => {
     console.log('Clicked!');
   }, {
     isActive: true // Must be true!
   });
   ```

3. **Expand app viewport:**
   ```typescript
   TelegramService.expand();
   ```

---

## TypeScript/Build Issues

### Error: Type errors in .ts/.tsx files

**Symptoms:**
```
error TS2304: Cannot find name 'JSX'
error TS2307: Cannot find module '@/...'
error TS2345: Argument of type '...' is not assignable
```

**Solutions:**

1. **Run TypeScript compiler:**
   ```bash
   npx tsc
   ```

2. **Check tsconfig.json:**
   ```bash
   cat tsconfig.json
   ```
   Should extend Expo's base config:
   ```json
   {
     "extends": "expo/tsconfig.base",
     "compilerOptions": {
       "strict": true
     }
   }
   ```

3. **Regenerate Expo types:**
   ```bash
   rm -rf .expo/types
   npx expo start
   # Types will regenerate automatically
   ```

4. **Check file is included:**
   ```json
   // In tsconfig.json
   "include": [
     "**/*.ts",
     "**/*.tsx",
     ".expo/types/**/*.ts",
     "expo-env.d.ts"
   ]
   ```

---

### Error: Cannot find declaration file

**Symptoms:**
```
Could not find a declaration file for module '@twa-dev/sdk'
Try `npm i --save-dev @types/...`
```

**Solutions:**

1. **Check if types are included:**
   ```bash
   ls node_modules/@twa-dev/types
   ```

2. **Install missing types:**
   ```bash
   npm install --save-dev @twa-dev/types
   ```

3. **Create type declaration (temporary fix):**
   ```typescript
   // Create telegram-web-apps.d.ts
   declare module '@twa-dev/sdk' {
     const WebApp: any;
     export default WebApp;
   }
   ```

---

### Error: Build fails on web

**Symptoms:**
```
Failed to compile
Module not found
Unexpected token
```

**Solutions:**

1. **Check web-specific code:**
   - Use `Platform.OS === 'web'` checks
   - Avoid Node.js-only APIs

2. **Clear web build cache:**
   ```bash
   rm -rf web-build
   npx expo export:web
   ```

3. **Check babel config:**
   ```bash
   cat babel.config.js
   ```

4. **View build logs:**
   ```bash
   cat .fastshot-logs/expo-export.log
   ```

---

## Environment Variable Issues

### Issue: EXPO_PUBLIC_* variables are undefined

**Symptoms:**
- `process.env.EXPO_PUBLIC_PROJECT_ID` returns `undefined`
- AI features don't work
- "Missing project ID" errors

**Diagnosis:**
```typescript
// Add to your component
console.log('Project ID:', process.env.EXPO_PUBLIC_PROJECT_ID);
console.log('Newell URL:', process.env.EXPO_PUBLIC_NEWELL_API_URL);
console.log('All env vars:', process.env);
```

**Solutions:**

1. **Verify .env file exists and has correct format:**
   ```bash
   cat .env
   ```
   Should look like:
   ```
   EXPO_PUBLIC_PROJECT_ID=29bbb5d7-cafd-4726-892d-e2b4830a3d78
   EXPO_PUBLIC_NEWELL_API_URL=https://newell.fastshot.ai
   ```

2. **Restart Expo server (IMPORTANT):**
   ```bash
   # Kill server (Ctrl+C)
   # Restart
   npx expo start
   ```
   Environment variables are loaded at server start only!

3. **Check babel.config.js includes variables:**
   ```javascript
   // Should have transform-inline-environment-variables
   plugins: [
     ['transform-inline-environment-variables', {
       include: [
         'EXPO_PUBLIC_PROJECT_ID',
         'EXPO_PUBLIC_NEWELL_API_URL',
       ]
     }]
   ]
   ```

4. **Verify variable names start with EXPO_PUBLIC_:**
   ```bash
   # Wrong:
   PROJECT_ID=...

   # Correct:
   EXPO_PUBLIC_PROJECT_ID=...
   ```

---

### Issue: Environment variables work on web but not native

**Solution:**

This shouldn't happen with `EXPO_PUBLIC_` prefix, but if it does:

```bash
# Clear cache completely
rm -rf .expo node_modules
npm install
npx expo start -c
```

---

## Platform-Specific Issues

### macOS: Xcode/iOS Simulator issues

**Issue: iOS simulator won't open**

**Solutions:**

1. **Install Xcode Command Line Tools:**
   ```bash
   xcode-select --install
   ```

2. **Accept Xcode license:**
   ```bash
   sudo xcodebuild -license accept
   ```

3. **Verify Xcode is default:**
   ```bash
   sudo xcode-select --switch /Applications/Xcode.app
   ```

---

### Windows: Android Emulator issues

**Issue: Android emulator not detected**

**Solutions:**

1. **Set ANDROID_HOME:**
   ```powershell
   setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"
   ```

2. **Add platform-tools to PATH:**
   ```powershell
   setx PATH "%PATH%;%LOCALAPPDATA%\Android\Sdk\platform-tools"
   ```

3. **Check emulator is running:**
   ```bash
   adb devices
   ```

---

### Linux: Permission issues

**Issue: Can't access USB for Android device**

**Solution:**
```bash
# Add yourself to plugdev group
sudo usermod -aG plugdev $USER

# Setup udev rules
sudo apt-get install android-tools-adb android-tools-fastboot

# Restart
sudo reboot
```

---

## Advanced Debugging

### Enable Verbose Logging

```bash
# Expo verbose mode
npx expo start --max-workers 1 --verbose

# React Native verbose
REACT_NATIVE_VERBOSE=1 npx expo start
```

### Check Expo Doctor

```bash
npx expo-doctor
```

### View All Logs

```bash
# Development server logs
cat .fastshot-logs/expo-dev-server.log

# Build logs
cat .fastshot-logs/expo-export.log

# npm install logs
cat .fastshot-logs/npm-install.log
```

### Reset Everything (Nuclear Option)

```bash
# Delete all generated files and caches
rm -rf node_modules
rm -rf .expo
rm -rf .expo-shared
rm -rf .metro-health-check*
rm -rf web-build
rm -rf dist
rm package-lock.json

# Reinstall
npm install

# Start fresh
npx expo start -c
```

---

## Still Having Issues?

### Check Project Status

```bash
# Run automated checker
./check-setup.sh
```

### Collect Debug Info

```bash
# System info
node -v
npm -v
npx expo --version

# Project info
npm list --depth=0

# Logs
cat .fastshot-logs/expo-dev-server.log
```

### Get Help

1. **Read documentation:**
   - `LOCAL_SETUP.md` - Complete setup guide
   - `QUICK_START.md` - Quick reference
   - This file - Troubleshooting

2. **Check examples:**
   - Browse `/examples` folder for patterns
   - Check `CLAUDE.md` for guidelines

3. **Search logs:**
   ```bash
   grep -i "error" .fastshot-logs/*.log
   ```

4. **Community support:**
   - [Fastshot Discord](https://fastshot.ai/discord)
   - [Expo Discord](https://chat.expo.dev)
   - [Fastshot Platform](https://fastshot.ai) - Ask AI agents

---

## Quick Command Reference

| Problem | Command |
|---------|---------|
| npm install fails | `npm install --legacy-peer-deps` |
| Metro cache issues | `npx expo start -c` |
| TypeScript errors | `npx tsc` |
| Check setup | `./check-setup.sh` |
| View logs | `cat .fastshot-logs/expo-dev-server.log` |
| Reset everything | `rm -rf node_modules .expo && npm install` |
| Test TMA | `npx expo start --tunnel` |
| Clear cache | `npm cache clean --force` |

---

## Prevention Tips

✅ **Before starting development:**
- Run `./check-setup.sh`
- Verify `npx tsc` passes
- Check `.env` file exists

✅ **Before committing:**
- Run `npx tsc` (no errors)
- Run `npm run lint` (no warnings)
- Test in browser and device

✅ **When pulling updates:**
- Run `npm install` (in case dependencies changed)
- Run `npx expo start -c` (clear cache)
- Check for new env variables needed

---

**Last updated:** Based on Expo SDK 54 and React Native 0.81.5
