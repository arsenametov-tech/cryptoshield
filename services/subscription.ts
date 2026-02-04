import Purchases, { PurchasesPackage, CustomerInfo, PurchasesOfferings } from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
   * Initialize RevenueCat SDK
   */
  async initialize(): Promise<void> {
    try {
      const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
      if (!apiKey) {
        console.warn('RevenueCat API key not found. Subscription features will be limited.');
        return;
      }

      await Purchases.configure({ apiKey });
      console.log('RevenueCat initialized successfully');
    } catch (error) {
      console.error('Error initializing RevenueCat:', error);
    }
  },

  /**
   * Check if user has Pro subscription
   */
  async isPro(): Promise<boolean> {
    try {
      const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
      if (!apiKey) {
        return false;
      }

      const customerInfo = await Purchases.getCustomerInfo();
      return Boolean(customerInfo.entitlements.active['pro']);
    } catch (error) {
      console.error('Error checking Pro status:', error);
      return false;
    }
  },

  /**
   * Get current customer info
   */
  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
      if (!apiKey) {
        return null;
      }

      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('Error getting customer info:', error);
      return null;
    }
  },

  /**
   * Get available offerings
   */
  async getOfferings(): Promise<PurchasesOfferings | null> {
    try {
      const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
      if (!apiKey) {
        return null;
      }

      return await Purchases.getOfferings();
    } catch (error) {
      console.error('Error getting offerings:', error);
      return null;
    }
  },

  /**
   * Purchase a package
   */
  async purchasePackage(pkg: PurchasesPackage): Promise<{ success: boolean; isPro: boolean }> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isPro = Boolean(customerInfo.entitlements.active['pro']);
      return { success: true, isPro };
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('User cancelled purchase');
      } else {
        console.error('Error purchasing package:', error);
      }
      return { success: false, isPro: false };
    }
  },

  /**
   * Restore purchases
   */
  async restorePurchases(): Promise<{ success: boolean; isPro: boolean }> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isPro = Boolean(customerInfo.entitlements.active['pro']);
      return { success: true, isPro };
    } catch (error) {
      console.error('Error restoring purchases:', error);
      return { success: false, isPro: false };
    }
  },

  /**
   * Login user (for tracking across devices)
   */
  async loginUser(userId: string): Promise<void> {
    try {
      const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
      if (!apiKey) {
        return;
      }

      await Purchases.logIn(userId);
    } catch (error) {
      console.error('Error logging in user:', error);
    }
  },

  /**
   * Logout user
   */
  async logoutUser(): Promise<void> {
    try {
      const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
      if (!apiKey) {
        return;
      }

      await Purchases.logOut();
    } catch (error) {
      console.error('Error logging out user:', error);
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
      if (!await AsyncStorage.getItem(SCAN_RESET_TIME_KEY)) {
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
      await AsyncStorage.setItem(SCAN_RESET_TIME_KEY, (Date.now() + RESET_INTERVAL_MS).toString());
    } catch (error) {
      console.error('Error resetting scan count:', error);
    }
  },

  /**
   * Check if user can scan (Pro user or has scans remaining)
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
};
