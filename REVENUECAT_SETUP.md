# RevenueCat Setup Guide for Cryptoshield

This guide will help you set up RevenueCat for the Cryptoshield Pro subscription system.

## Overview

Cryptoshield uses RevenueCat to manage subscriptions with the following features:
- **Pro Entitlement**: Unlocks all premium features
- **Free Tier**: 3 scans per 24 hours
- **Pro Tier**: Unlimited scans, Deep Screenshot Analysis, Priority AI Expert

## Step 1: Create a RevenueCat Account

1. Go to [https://www.revenuecat.com](https://www.revenuecat.com)
2. Sign up for a free account
3. Create a new project called "Cryptoshield"

## Step 2: Configure Test Store (No App Store Account Required)

RevenueCat's Test Store allows you to test subscriptions without Apple/Google accounts:

1. In your RevenueCat dashboard, navigate to your project
2. The Test Store app should be created automatically
3. Note your **Project ID** for later

## Step 3: Create Products

Create two subscription products in RevenueCat:

### Monthly Subscription
- **Store Identifier**: `cryptoshield_monthly`
- **Display Name**: Cryptoshield Pro - Monthly
- **Type**: Subscription
- **Duration**: P1M (1 month)
- **Price**: $9.99 USD (or your preferred pricing)

### Annual Subscription (Recommended)
- **Store Identifier**: `cryptoshield_annual`
- **Display Name**: Cryptoshield Pro - Annual
- **Type**: Subscription
- **Duration**: P1Y (1 year)
- **Price**: $69.99 USD (save 40%)

## Step 4: Create the "Pro" Entitlement

1. Navigate to **Entitlements** in your RevenueCat dashboard
2. Create a new entitlement:
   - **Lookup Key**: `pro`
   - **Display Name**: Cryptoshield Pro Access
3. Attach both products (monthly and annual) to this entitlement

## Step 5: Create an Offering

1. Navigate to **Offerings** in your RevenueCat dashboard
2. Create a new offering:
   - **Lookup Key**: `default`
   - **Display Name**: Default Offering
3. Create packages within this offering:
   - **Monthly Package**:
     - Lookup Key: `$rc_monthly`
     - Attach `cryptoshield_monthly` product
   - **Annual Package**:
     - Lookup Key: `$rc_annual`
     - Attach `cryptoshield_annual` product
4. Set this offering as **Current**

## Step 6: Get Your API Keys

1. Navigate to **API Keys** in your RevenueCat dashboard
2. Find your **Public SDK Key** (NOT the secret key!)
3. Copy the key for the **Sandbox/Test** environment

## Step 7: Configure the App

Add your RevenueCat API key to the app's environment:

```bash
EXPO_PUBLIC_REVENUECAT_API_KEY=your_public_sdk_key_here
```

**Important**: Use the PUBLIC key, not the secret key! The public key is safe to use in client apps.

## Step 8: Testing Subscriptions

### Test Store Testing
With Test Store, you can test purchases without real payment:

1. Run the app on a device or simulator
2. Navigate to the Premium screen
3. Select a subscription plan
4. Complete the "purchase" (no payment required in Test Store)
5. Verify Pro features are unlocked

### Production Testing (App Store/Google Play)
When ready for production:

1. Create apps in App Store Connect and Google Play Console
2. Add those apps to your RevenueCat project
3. Configure products in App Store Connect/Play Console
4. Use TestFlight (iOS) or Internal Testing (Android) for testing
5. Use sandbox test accounts for purchases

## Features Implementation

### Free User Limitations
- **3 scans per 24 hours** (contract or URL checks)
- Basic AI Expert responses
- Standard screenshot analysis
- After 3 scans, users see the Premium upgrade screen

### Pro User Benefits
- ✅ **Unlimited scans** (no daily limit)
- ✅ **Deep Screenshot Analysis** - Advanced threat detection with detailed analysis
- ✅ **Priority AI Expert** - Enhanced responses with more detail
- ✅ **Ad-free experience**
- ✅ **Multi-device sync** (via RevenueCat)
- ✅ **Early access** to new features

## Usage Tracking

The app automatically tracks:
- Scan count for free users
- 24-hour reset timer
- Pro status across app restarts
- Subscription status via RevenueCat

## Subscription Management

Users can:
- Upgrade to Pro from multiple entry points:
  - Home screen "Pro" button
  - Scan limit reached prompt
  - Settings "Upgrade to Pro" card
  - Screenshot Analysis "Deep Analysis" toggle
- Restore purchases on new devices
- Manage subscriptions via App Store/Play Store settings

## Important Notes

1. **Never commit API keys to git**: The `.env` file should be in `.gitignore`
2. **Use public keys only**: Never use secret keys in the mobile app
3. **Test thoroughly**: Test subscription flow, restore purchases, and feature gates
4. **Handle errors gracefully**: The app should work even if RevenueCat is unavailable
5. **Monitor analytics**: RevenueCat dashboard shows subscription metrics

## Troubleshooting

### "RevenueCat API key not found"
- Ensure `EXPO_PUBLIC_REVENUECAT_API_KEY` is set in `.env`
- Restart the development server after adding the key

### Purchases not working
- Verify the API key is correct
- Check that products are properly configured in RevenueCat
- Ensure the offering is set as "Current"
- For Test Store, verify you're using the correct product identifiers

### Pro features not unlocking
- Check that the "pro" entitlement is attached to your products
- Verify the entitlement lookup key matches exactly: `pro`
- Try restoring purchases from the Premium screen

## Support

For RevenueCat-specific issues:
- [RevenueCat Documentation](https://docs.revenuecat.com)
- [RevenueCat Community](https://community.revenuecat.com)
- [RevenueCat Support](https://app.revenuecat.com/settings/support)

## Next Steps

After setup:
1. ✅ Configure RevenueCat account and products
2. ✅ Add API key to app
3. ✅ Test subscription flow
4. ✅ Test Pro feature gates
5. ✅ Test restore purchases
6. ✅ Monitor subscription metrics in RevenueCat dashboard
