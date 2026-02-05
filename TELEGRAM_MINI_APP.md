# Cryptoshield Telegram Mini App

This document provides information about the Telegram Mini App integration for Cryptoshield.

## Features

- **Seamless Telegram Integration**: Automatically authenticates users via Telegram init data
- **Native Telegram UI**: Uses Telegram Main Button and Back Button for navigation
- **Telegram Haptic Feedback**: Native haptic feedback for all interactions
- **Theme Sync**: Automatically syncs with Telegram's color scheme while maintaining the Midnight aesthetic
- **Russian Localization**: Complete Russian translations for all features
- **Promo Code System**: Premium promo codes like FASTSHOT2025 for unlocking Pro features
- **AI-Powered Security**: Newell AI consultant for crypto fraud detection (Russian-speaking)
- **Contract Scanning**: Analyze smart contract addresses for honeypots, scams, and risks
- **URL Checking**: Verify website URLs for phishing and fraud
- **Screenshot Analysis**: Upload and analyze screenshots for social engineering detection

## Architecture

### Key Services

1. **TelegramService** (`/services/telegram.ts`)
   - Core Telegram WebApp SDK integration
   - Handles buttons, popups, haptics, and theme

2. **TelegramAuthService** (`/services/telegramAuth.ts`)
   - Automatic user authentication via Telegram init data
   - User identification without registration

3. **TelegramHapticsService** (`/services/telegram.ts`)
   - Native Telegram haptic feedback
   - Fallback to Expo haptics for non-Telegram platforms

4. **ThemeSyncService** (`/services/themeSync.ts`)
   - Syncs app colors with Telegram theme parameters
   - Maintains Midnight aesthetic while respecting Telegram's color scheme

### Context Providers

- **TelegramProvider** (`/contexts/TelegramContext.tsx`)
  - React context for accessing Telegram SDK throughout the app
  - Provides hooks for Main Button, Back Button, popups, and haptics

## User Experience

### Navigation

- **Back Button**: Native Telegram back button appears on all secondary screens
- **Main Button**: Context-aware button at the bottom for primary actions:
  - Dashboard: "Start Scan" (when input provided)
  - Premium: "Upgrade to Pro" or "Apply Promo"
  - AI Consultant: "Send" (when message typed)

### Onboarding

- Telegram users skip the onboarding flow (auto-authenticated)
- Non-Telegram users see the standard 3-screen onboarding

### Authentication

- Automatic identification via Telegram user data
- No registration or login required
- User info stored locally for quick access
- Support for Telegram Premium users (future monetization option)

## Monetization

### Promo Codes

Valid promo codes for Pro access:
- `FASTSHOT2025`
- `CRYPTO_PRO`
- `FAMILY_FOREVER`
- `FRIEND_VIP`
- `BETA_TESTER`
- `EARLY_BIRD`

### Future: Telegram Stars

The app is designed to support Telegram Stars for in-app purchases in the future. The subscription service can be extended to accept Telegram Stars as payment.

## Deployment

### Web Build for Telegram

1. Build the web version:
   ```bash
   npx expo export:web
   ```

2. Deploy to your web hosting service (Vercel, Netlify, etc.)

3. Configure the Telegram Bot:
   - Create a bot via @BotFather
   - Set the Web App URL to your deployed URL
   - Configure bot description and about text in Russian

### Bot Configuration

Example bot description (Russian):
```
🛡️ Cryptoshield - AI-защита от крипто-мошенничества

Мгновенно сканируйте контракты и сайты на honeypot'ы, scam'ы и вредоносные схемы.

✅ AI консультант по безопасности (на русском)
✅ Анализ скриншотов на социальную инженерию
✅ Проверка URL и смарт-контрактов
✅ Промо-коды для Pro доступа

Начните защищаться прямо сейчас!
```

## Technical Details

### Dependencies

- `@twa-dev/sdk`: Telegram WebApp SDK
- `@twa-dev/types`: TypeScript types for Telegram SDK
- `@fastshot/ai`: Newell AI integration for text and image analysis
- `expo`: React Native framework
- `expo-router`: File-based routing
- `expo-image-picker`: For screenshot upload

### Environment Variables

No special environment variables needed for TMA integration. The app automatically detects if it's running inside Telegram and adapts accordingly.

### Platform Detection

```typescript
const isInTelegram = Platform.OS === 'web' && TelegramService.isInTelegram();
```

### Conditional Rendering

UI elements adapt based on platform:
- Back buttons hidden in Telegram (uses native Back Button)
- Scan button hidden in Telegram (uses Main Button)
- CTA buttons hidden in Telegram (uses Main Button)

## Localization

Complete Russian localization in `/locales/ru.json`:
- All UI strings
- Error messages
- Success notifications
- AI consultant system prompts

## Best Practices

1. **Always check `isInTelegram` before using Telegram-specific features**
2. **Provide fallbacks for non-Telegram platforms**
3. **Use native Telegram buttons when available**
4. **Respect Telegram's theme while maintaining brand identity**
5. **Test on multiple devices and Telegram versions**

## Testing

### Local Testing

1. Use ngrok or similar tunnel to expose local development server:
   ```bash
   npx expo start --web
   # In another terminal:
   ngrok http 8081
   ```

2. Set the ngrok URL as your bot's Web App URL

3. Test in Telegram Desktop or mobile

### Production Testing

1. Deploy to staging environment
2. Update bot's Web App URL to staging URL
3. Test all features:
   - Contract scanning
   - URL checking
   - AI consultant
   - Screenshot analysis
   - Promo codes
   - Theme adaptation
   - Haptic feedback

## Support

For issues or questions about the Telegram Mini App integration:
- Check Telegram Mini Apps documentation
- Review the `/contexts/TelegramContext.tsx` implementation
- Consult the `/services/telegram.ts` service methods

## Future Enhancements

- [ ] Telegram Stars payment integration
- [ ] Share functionality to send scam warnings to friends
- [ ] Inline mode for quick contract checks
- [ ] Bot commands for scanning
- [ ] Group chat integration for team security
- [ ] Telegram Passport for enhanced verification
