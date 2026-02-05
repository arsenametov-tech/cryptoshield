import { adapty } from 'react-native-adapty';
import type {
  AdaptyProfile,
  AdaptyPaywall,
  AdaptyPaywallProduct,
  AdaptyPurchaseResult,
} from 'react-native-adapty';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PromoCodeService } from './promoCode';

const SCAN_COUNT_KEY = '@cryptoshield_scan_count';
const SCAN_RESET_TIME_KEY = '@cryptoshield_scan_reset_time';
const FREE_SCAN_LIMIT = 3;
const RESET_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface ScanUsage {
  count: number;
  resetTime: number;
}

export const SubscriptionService = {
  /**
   * Initialize Adapty SDK
   */
  async initialize(): Promise<void> {
    try {
      const apiKey = process.env.EXPO_PUBLIC_ADAPTY_API_KEY;
      if (!apiKey) {
        console.warn('Adapty API key not found. Subscription features will be limited.');
        return;
      }

      await adapty.activate(apiKey, {
        __ignoreActivationOnFastRefresh: __DEV__,
      });
      console.log('Adapty initialized successfully');
    } catch (error) {
      console.error('Error initializing Adapty:', error);
    }
  },

  /**
   * Check if user has Pro subscription (via Adapty or promo code)
   */
  async isPro(): Promise<boolean> {
    try {
      // First check promo code unlock
      const hasPromo = await PromoCodeService.hasPromoUnlock();
      if (hasPromo) {
        return true;
      }

      // Then check Adapty subscription
      const apiKey = process.env.EXPO_PUBLIC_ADAPTY_API_KEY;
      if (!apiKey) {
        return false;
      }

      const profile = await adapty.getProfile();
      return profile?.accessLevels?.['premium']?.isActive ?? false;
    } catch (error) {
      console.error('Error checking Pro status:', error);
      return false;
    }
  },

  /**
   * Get current profile
   */
  async getProfile(): Promise<AdaptyProfile | null> {
    try {
      const apiKey = process.env.EXPO_PUBLIC_ADAPTY_API_KEY;
      if (!apiKey) {
        return null;
      }

      return await adapty.getProfile();
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  },

  /**
   * Get paywall
   */
  async getPaywall(): Promise<AdaptyPaywall | null> {
    try {
      const apiKey = process.env.EXPO_PUBLIC_ADAPTY_API_KEY;
      if (!apiKey) {
        return null;
      }

      const placementId = process.env.EXPO_PUBLIC_ADAPTY_PLACEMENT_ID ?? 'default';
      return await adapty.getPaywall(placementId);
    } catch (error) {
      console.error('Error getting paywall:', error);
      return null;
    }
  },

  /**
   * Get paywall products
   */
  async getPaywallProducts(paywall: AdaptyPaywall): Promise<AdaptyPaywallProduct[]> {
    try {
      return await adapty.getPaywallProducts(paywall);
    } catch (error) {
      console.error('Error getting paywall products:', error);
      return [];
    }
  },

  /**
   * Purchase a product
   */
  async purchaseProduct(
    product: AdaptyPaywallProduct
  ): Promise<{ success: boolean; isPro: boolean; cancelled: boolean }> {
    try {
      const result = await adapty.makePurchase(product);

      switch (result.type) {
        case 'success':
          const isPro = result.profile?.accessLevels?.['premium']?.isActive ?? false;
          return { success: true, isPro, cancelled: false };
        case 'user_cancelled':
          return { success: false, isPro: false, cancelled: true };
        case 'pending':
          return { success: false, isPro: false, cancelled: false };
        default:
          return { success: false, isPro: false, cancelled: false };
      }
    } catch (error: any) {
      console.error('Error purchasing product:', error);
      return { success: false, isPro: false, cancelled: false };
    }
  },

  /**
   * Restore purchases
   */
  async restorePurchases(): Promise<{ success: boolean; isPro: boolean }> {
    try {
      const profile = await adapty.restorePurchases();
      const isPro = profile?.accessLevels?.['premium']?.isActive ?? false;
      return { success: true, isPro };
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return { success: false, isPro: false };
    }
  },

  /**
   * Identify user (for tracking across devices)
   */
  async identifyUser(userId: string): Promise<void> {
    try {
      const apiKey = process.env.EXPO_PUBLIC_ADAPTY_API_KEY;
      if (!apiKey) {
        return;
      }

      await adapty.identify(userId);
    } catch (error) {
      console.error('Error identifying user:', error);
    }
  },

  /**
   * Get current scan usage for free users
   */
  async getScanUsage(): Promise<ScanUsage> {
    try {
      const countStr = await AsyncStorage.getItem(SCAN_COUNT_KEY);
      const resetTimeStr = await AsyncStorage.getItem(SCAN_RESET_TIME_KEY);

      const count = countStr ? parseInt(countStr, 10) : 0;
      const resetTime = resetTimeStr ? parseInt(resetTimeStr, 10) : Date.now() + RESET_INTERVAL_MS;

      // Check if reset time has passed
      if (Date.now() >= resetTime) {
        return { count: 0, resetTime: Date.now() + RESET_INTERVAL_MS };
      }

      return { count, resetTime };
    } catch (error) {
      console.error('Error getting scan usage:', error);
      return { count: 0, resetTime: Date.now() + RESET_INTERVAL_MS };
    }
  },

  /**
   * Increment scan count for free users
   */
  async incrementScanCount(): Promise<void> {
    try {
      const usage = await this.getScanUsage();
      const newCount = usage.count + 1;

      await AsyncStorage.setItem(SCAN_COUNT_KEY, newCount.toString());

      // Set reset time if not already set
      if (!(await AsyncStorage.getItem(SCAN_RESET_TIME_KEY))) {
        await AsyncStorage.setItem(SCAN_RESET_TIME_KEY, usage.resetTime.toString());
      }
    } catch (error) {
      console.error('Error incrementing scan count:', error);
    }
  },

  /**
   * Reset scan count (for testing or when reset time is reached)
   */
  async resetScanCount(): Promise<void> {
    try {
      await AsyncStorage.setItem(SCAN_COUNT_KEY, '0');
      await AsyncStorage.setItem(
        SCAN_RESET_TIME_KEY,
        (Date.now() + RESET_INTERVAL_MS).toString()
      );
    } catch (error) {
      console.error('Error resetting scan count:', error);
    }
  },

  /**
   * Check if user can scan (Pro user via Adapty or promo, or has scans remaining)
   */
  async canScan(): Promise<{ canScan: boolean; scansRemaining: number; isPro: boolean }> {
    const isPro = await this.isPro();

    if (isPro) {
      return { canScan: true, scansRemaining: -1, isPro: true }; // -1 means unlimited
    }

    const usage = await this.getScanUsage();

    // Reset if time has passed
    if (Date.now() >= usage.resetTime) {
      await this.resetScanCount();
      return { canScan: true, scansRemaining: FREE_SCAN_LIMIT - 1, isPro: false };
    }

    const scansRemaining = Math.max(0, FREE_SCAN_LIMIT - usage.count);
    const canScan = scansRemaining > 0;

    return { canScan, scansRemaining, isPro: false };
  },

  /**
   * Get time remaining until scan count resets
   */
  async getTimeUntilReset(): Promise<number> {
    const usage = await this.getScanUsage();
    return Math.max(0, usage.resetTime - Date.now());
  },

  /**
   * Format subscription period for display
   */
  formatSubscriptionPeriod(product: AdaptyPaywallProduct): string {
    const period = product.subscription?.subscriptionPeriod;
    if (!period) return '';

    const { numberOfUnits, unit } = period;

    // Map unit to display text
    const unitMap: Record<string, string> = {
      day: 'day',
      week: 'week',
      month: 'month',
      year: 'year',
    };

    const unitLabel = unitMap[unit] || unit;
    const pluralUnit = numberOfUnits === 1 ? unitLabel : `${unitLabel}s`;

    return numberOfUnits === 1 ? `per ${pluralUnit}` : `per ${numberOfUnits} ${pluralUnit}`;
  },

  /**
   * Get formatted price
   */
  getFormattedPrice(product: AdaptyPaywallProduct): string {
    return product.price?.localizedString || 'N/A';
  },
};
