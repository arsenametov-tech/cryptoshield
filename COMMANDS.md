# 📋 Command Reference

Quick reference for all common commands and workflows.

---

## 🚀 Setup & Installation

```bash
# First time setup
npm install

# If npm install fails
npm install --legacy-peer-deps

# Clear everything and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Check your setup
./check-setup.sh
```

---

## 🏃 Running the App

```bash
# Start development server (basic)
npx expo start

# Start with tunnel (for TMA testing - HTTPS)
npx expo start --tunnel

# Start with cleared cache
npx expo start -c

# Start on specific port
npx expo start --port 8082

# Start on LAN
npx expo start --lan

# Start in production mode
npx expo start --no-dev --minify
```

### Quick Actions (after starting expo)

| Key | Action |
|-----|--------|
| `w` | Open in web browser |
| `i` | Open iOS simulator (macOS only) |
| `a` | Open Android emulator |
| `r` | Reload app |
| `m` | Toggle menu |
| `?` | Show all commands |

---

## 🧪 Testing & Quality

```bash
# Type check with TypeScript
npx tsc

# Type check in watch mode
npx tsc --watch

# Lint code
npm run lint

# Run all checks
npx tsc && npm run lint

# Run Expo doctor (health check)
npx expo-doctor
```

---

## 🔧 Cache Management

```bash
# Clear Expo cache
npx expo start -c

# Clear Metro cache
rm -rf .metro-health-check*

# Clear all caches
rm -rf .expo .metro-health-check* node_modules/.cache

# Nuclear option (reset everything)
rm -rf node_modules .expo .expo-shared web-build dist
rm package-lock.json
npm install
```

---

## 📦 Dependencies

```bash
# Install new package
npm install <package-name>

# Install dev dependency
npm install --save-dev <package-name>

# Update all packages
npm update

# Check for outdated packages
npm outdated

# View dependency tree
npm list --depth=0

# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

---

## 🌍 Environment Variables

```bash
# View current environment variables
cat .env

# Edit environment variables
nano .env
# or
code .env

# Verify variables are loaded (in code)
console.log(process.env.EXPO_PUBLIC_PROJECT_ID)
```

**Remember:** Always prefix with `EXPO_PUBLIC_` and restart server after changes!

---

## 📱 Telegram Mini App

```bash
# Start with HTTPS tunnel for TMA testing
npx expo start --tunnel

# Alternative tunnel provider
npx expo start --tunnel --tunnel-provider localtunnel

# Check Telegram Web App init data (in code)
import WebApp from '@twa-dev/sdk';
console.log('Platform:', WebApp.platform);
console.log('User:', WebApp.initDataUnsafe.user);
```

---

## 🏗️ Building

```bash
# Build web version
npx expo export:web

# Build with different environment
NODE_ENV=production npx expo export:web

# View build logs
cat .fastshot-logs/expo-export.log
```

---

## 📊 Debugging & Logs

```bash
# View development server logs
cat .fastshot-logs/expo-dev-server.log

# View build logs
cat .fastshot-logs/expo-export.log

# View npm install logs
cat .fastshot-logs/npm-install.log

# Follow logs in real-time
tail -f .fastshot-logs/expo-dev-server.log

# Search for errors in logs
grep -i "error" .fastshot-logs/*.log

# Enable verbose logging
npx expo start --verbose

# Enable React Native verbose mode
REACT_NATIVE_VERBOSE=1 npx expo start
```

---

## 🔍 Finding & Searching

```bash
# Find files by name
find . -name "telegram.ts"

# Find files by pattern (excluding node_modules)
find . -name "*.tsx" -not -path "*/node_modules/*"

# Search code for text
grep -r "TelegramService" --include="*.ts" --include="*.tsx"

# Search code (case insensitive)
grep -ri "telegram" app/

# Count lines of code
find . -name "*.tsx" -o -name "*.ts" | xargs wc -l
```

---

## 📂 File Operations

```bash
# List files in directory
ls -la

# Show file contents
cat app/_layout.tsx

# Show file with line numbers
cat -n app/_layout.tsx

# Edit file in nano
nano app/_layout.tsx

# Edit file in VS Code
code app/_layout.tsx

# Copy file
cp file.ts file.backup.ts

# Move/rename file
mv old-name.ts new-name.ts

# Delete file
rm file.ts

# Create directory
mkdir components/new-feature
```

---

## 🔌 Process Management

```bash
# Find process using port 8081 (Metro)
lsof -ti:8081

# Kill process on port 8081
lsof -ti:8081 | xargs kill -9

# View running Node processes
ps aux | grep node

# Kill all Node processes (careful!)
killall node

# View active network connections
netstat -an | grep LISTEN
```

---

## 📱 iOS (macOS only)

```bash
# List iOS simulators
xcrun simctl list devices

# Open iOS simulator
open -a Simulator

# Install Xcode Command Line Tools
xcode-select --install

# Accept Xcode license
sudo xcodebuild -license accept

# Set Xcode path
sudo xcode-select --switch /Applications/Xcode.app
```

---

## 🤖 Android

```bash
# List Android devices/emulators
adb devices

# Restart adb server
adb kill-server
adb start-server

# Install APK
adb install app.apk

# View Android logs
adb logcat

# View Metro logs for Android
adb logcat | grep -i "ReactNativeJS"

# Reverse port (for localhost access)
adb reverse tcp:8081 tcp:8081
```

---

## 📝 Git Operations

```bash
# Check status
git status

# View changes
git diff

# Stage all changes
git add .

# Commit with message
git commit -m "feat: add feature"

# Push to remote
git push origin main

# Pull latest changes
git pull origin main

# Create new branch
git checkout -b feature/new-feature

# Switch branch
git checkout main

# View commit history
git log --oneline

# Discard local changes
git checkout .

# Reset to last commit
git reset --hard HEAD
```

---

## 🛠️ System Information

```bash
# Check Node version
node -v

# Check npm version
npm -v

# Check Expo version
npx expo --version

# Check system info
uname -a

# Check disk space
df -h

# Check memory usage
free -h  # Linux
top      # macOS/Linux
```

---

## 🎯 Common Workflows

### First Time Setup
```bash
npm install
./check-setup.sh
npx expo start
```

### Start Development
```bash
npx expo start -c
# Press 'w' for web or scan QR for mobile
```

### Test TMA Features
```bash
npx expo start --tunnel
# Configure bot menu button in @BotFather
# Open bot in Telegram
```

### Before Committing
```bash
npx tsc
npm run lint
git add .
git commit -m "feat: description"
git push
```

### Troubleshooting
```bash
./check-setup.sh
cat .fastshot-logs/expo-dev-server.log
npx expo start -c
```

### Clean Reset
```bash
rm -rf node_modules .expo package-lock.json
npm cache clean --force
npm install
npx expo start -c
```

---

## 🆘 Emergency Commands

When everything breaks:

```bash
# 1. Save your changes
git add .
git stash

# 2. Nuclear reset
rm -rf node_modules .expo .metro-health-check* web-build dist
rm package-lock.json

# 3. Clear npm cache
npm cache clean --force

# 4. Reinstall
npm install --legacy-peer-deps

# 5. Start fresh
npx expo start -c

# 6. Restore changes if needed
git stash pop
```

---

## 📞 Quick Help

| Issue | Command |
|-------|---------|
| Setup check | `./check-setup.sh` |
| npm install fails | `npm install --legacy-peer-deps` |
| Metro cache issues | `npx expo start -c` |
| TypeScript errors | `npx tsc` |
| Port already in use | `lsof -ti:8081 \| xargs kill -9` |
| TMA not working | `npx expo start --tunnel` |
| View logs | `cat .fastshot-logs/expo-dev-server.log` |
| Reset everything | See "Emergency Commands" above |

---

## 📚 Documentation Links

- **Quick Start**: `cat QUICK_START.md`
- **Full Setup**: `cat LOCAL_SETUP.md`
- **Troubleshooting**: `cat TROUBLESHOOTING.md`
- **Expo Docs**: https://docs.expo.dev/
- **TMA Docs**: https://core.telegram.org/bots/webapps

---

**💡 Tip:** Bookmark this file for quick reference!

**🔖 Print this:** `cat COMMANDS.md`
