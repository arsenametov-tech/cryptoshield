#!/bin/bash

# Cryptoshield Local Setup Checker
# This script checks your local environment and diagnoses common issues

echo "🔍 Cryptoshield Setup Checker"
echo "=============================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_passed() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
}

check_failed() {
    echo -e "${RED}❌ FAIL${NC}: $1"
}

check_warning() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
}

echo "1️⃣  Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    check_passed "Node.js installed: $NODE_VERSION"

    # Check if version is >= 18
    NODE_MAJOR=$(node -v | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        check_passed "Node.js version is compatible (>= 18)"
    else
        check_failed "Node.js version is too old (need >= 18, have $NODE_VERSION)"
        echo "   Fix: Install Node.js 18+ from https://nodejs.org/"
    fi
else
    check_failed "Node.js is not installed"
    echo "   Fix: Install Node.js from https://nodejs.org/"
fi
echo ""

echo "2️⃣  Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    check_passed "npm installed: $NPM_VERSION"
else
    check_failed "npm is not installed"
    echo "   Fix: Install Node.js which includes npm"
fi
echo ""

echo "3️⃣  Checking dependencies..."
if [ -d "node_modules" ]; then
    check_passed "node_modules directory exists"

    # Check key dependencies
    if [ -d "node_modules/expo" ]; then
        check_passed "Expo is installed"
    else
        check_failed "Expo is not installed"
        echo "   Fix: Run 'npm install'"
    fi

    if [ -d "node_modules/@twa-dev/sdk" ]; then
        check_passed "Telegram WebApp SDK is installed"
    else
        check_failed "Telegram WebApp SDK is not installed"
        echo "   Fix: Run 'npm install'"
    fi

    if [ -d "node_modules/@fastshot/ai" ]; then
        check_passed "Fastshot AI package is installed"
    else
        check_warning "Fastshot AI package is not installed (optional)"
    fi
else
    check_failed "node_modules directory not found"
    echo "   Fix: Run 'npm install'"
fi
echo ""

echo "4️⃣  Checking environment variables..."
if [ -f ".env" ]; then
    check_passed ".env file exists"

    # Check required variables
    if grep -q "EXPO_PUBLIC_NEWELL_API_URL" .env; then
        check_passed "EXPO_PUBLIC_NEWELL_API_URL is set"
    else
        check_warning "EXPO_PUBLIC_NEWELL_API_URL is not set"
    fi

    if grep -q "EXPO_PUBLIC_PROJECT_ID" .env; then
        check_passed "EXPO_PUBLIC_PROJECT_ID is set"
    else
        check_warning "EXPO_PUBLIC_PROJECT_ID is not set"
    fi

    # Check optional variables
    if grep -q "EXPO_PUBLIC_SUPABASE_URL" .env; then
        check_passed "Supabase URL is set"
    else
        check_warning "Supabase URL is not set (optional for auth)"
    fi

    if grep -q "EXPO_PUBLIC_AUTH_BROKER_URL" .env; then
        check_passed "Auth Broker URL is set"
    else
        check_warning "Auth Broker URL is not set (optional for auth)"
    fi
else
    check_failed ".env file not found"
    echo "   Fix: Create .env file with required variables"
    echo "   See LOCAL_SETUP.md for details"
fi
echo ""

echo "5️⃣  Checking configuration files..."
files=("package.json" "app.json" "tsconfig.json" "babel.config.js" "metro.config.js")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        check_passed "$file exists"
    else
        check_failed "$file not found"
    fi
done
echo ""

echo "6️⃣  Checking Expo setup..."
if [ -f "app.json" ]; then
    if grep -q "expo-router" app.json; then
        check_passed "Expo Router is configured"
    else
        check_warning "Expo Router might not be configured"
    fi
fi

if [ -d ".expo" ]; then
    check_passed ".expo directory exists (project has been started before)"
else
    check_warning ".expo directory not found (project hasn't been started yet)"
    echo "   This is normal for first run"
fi
echo ""

echo "7️⃣  Checking TypeScript setup..."
if npx tsc --noEmit --pretty false 2>&1 | grep -q "error TS"; then
    check_failed "TypeScript has errors"
    echo "   Fix: Run 'npx tsc' to see errors"
else
    check_passed "No TypeScript errors found"
fi
echo ""

echo "8️⃣  Checking for common issues..."

# Check for lock file
if [ -f "package-lock.json" ]; then
    check_passed "package-lock.json exists"
else
    check_warning "package-lock.json not found"
fi

# Check for conflicting dependencies
if [ -f "package.json" ]; then
    if grep -q "react-native.*0.81" package.json; then
        check_passed "React Native version looks compatible"
    fi
fi

# Check metro cache
if [ -d ".metro-health-check" ]; then
    check_warning "Metro health check directory exists (might need clearing)"
    echo "   Fix: Run 'npx expo start -c' to clear cache"
fi
echo ""

echo "9️⃣  Checking logs..."
if [ -d ".fastshot-logs" ]; then
    check_passed "Logs directory exists"

    # Check for recent errors
    if [ -f ".fastshot-logs/expo-dev-server.log" ]; then
        ERROR_COUNT=$(grep -i "error" .fastshot-logs/expo-dev-server.log 2>/dev/null | wc -l)
        if [ "$ERROR_COUNT" -gt 0 ]; then
            check_warning "Found $ERROR_COUNT error(s) in dev server logs"
            echo "   Check: cat .fastshot-logs/expo-dev-server.log"
        else
            check_passed "No errors in dev server logs"
        fi
    fi
else
    check_warning "No logs directory found (normal for first run)"
fi
echo ""

echo "🔟 Summary & Recommendations"
echo "=============================="

# Count issues
CRITICAL_ISSUES=0
WARNINGS=0

if ! command -v node &> /dev/null; then
    CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
fi

if ! command -v npm &> /dev/null; then
    CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
fi

if [ ! -d "node_modules" ]; then
    CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
fi

if [ ! -f ".env" ]; then
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
if [ $CRITICAL_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ Your setup looks good!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run: npx expo start"
    echo "  2. For TMA testing: npx expo start --tunnel"
    echo "  3. Read LOCAL_SETUP.md for detailed instructions"
else
    echo -e "${RED}❌ Found $CRITICAL_ISSUES critical issue(s)${NC}"
    echo "   Please fix the issues above and run this script again"
fi

if [ $WARNINGS -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Found $WARNINGS warning(s)${NC}"
    echo "   These are not critical but should be addressed"
fi

echo ""
echo "📚 Documentation:"
echo "   - Setup Guide: cat LOCAL_SETUP.md"
echo "   - Check logs: cat .fastshot-logs/expo-dev-server.log"
echo "   - Expo docs: https://docs.expo.dev"
echo ""
echo "🆘 Need help?"
echo "   - Run: npm install (if dependencies are missing)"
echo "   - Run: npx expo start -c (to clear cache)"
echo "   - Run: npx tsc (to check TypeScript errors)"
echo ""
