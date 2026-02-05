import AsyncStorage from '@react-native-async-storage/async-storage';
import { TelegramService } from './telegram';

const TELEGRAM_USER_KEY = '@cryptoshield_telegram_user';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

/**
 * Telegram Authentication Service
 * Handles automatic user identification via Telegram init data
 */
export class TelegramAuthService {
  /**
   * Initialize Telegram authentication
   * Automatically identifies user if running in Telegram
   */
  static async initialize(): Promise<TelegramUser | null> {
    if (!TelegramService.isInTelegram()) {
      return null;
    }

    const user = TelegramService.getUser();
    if (!user) {
      return null;
    }

    // Store user data locally for quick access
    await this.storeUserData(user as TelegramUser);

    return user as TelegramUser;
  }

  /**
   * Get current Telegram user
   */
  static async getUser(): Promise<TelegramUser | null> {
    if (!TelegramService.isInTelegram()) {
      return null;
    }

    // Try to get from Telegram SDK first
    const user = TelegramService.getUser();
    if (user) {
      return user as TelegramUser;
    }

    // Fallback to stored user data
    return await this.getStoredUserData();
  }

  /**
   * Get user ID
   */
  static async getUserId(): Promise<number | null> {
    const user = await this.getUser();
    return user?.id || null;
  }

  /**
   * Get user full name
   */
  static async getUserFullName(): Promise<string> {
    const user = await this.getUser();
    if (!user) return 'User';

    return [user.first_name, user.last_name].filter(Boolean).join(' ');
  }

  /**
   * Get user username
   */
  static async getUsername(): Promise<string | null> {
    const user = await this.getUser();
    return user?.username || null;
  }

  /**
   * Check if user has Telegram Premium
   */
  static async hasTelegramPremium(): Promise<boolean> {
    const user = await this.getUser();
    return user?.is_premium || false;
  }

  /**
   * Get user language
   */
  static async getUserLanguage(): Promise<string> {
    const user = await this.getUser();
    return user?.language_code || 'ru';
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getUser();
    return !!user;
  }

  /**
   * Store user data locally
   */
  private static async storeUserData(user: TelegramUser): Promise<void> {
    try {
      await AsyncStorage.setItem(TELEGRAM_USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing Telegram user data:', error);
    }
  }

  /**
   * Get stored user data
   */
  private static async getStoredUserData(): Promise<TelegramUser | null> {
    try {
      const stored = await AsyncStorage.getItem(TELEGRAM_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error retrieving Telegram user data:', error);
      return null;
    }
  }

  /**
   * Clear stored user data
   */
  static async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TELEGRAM_USER_KEY);
    } catch (error) {
      console.error('Error clearing Telegram user data:', error);
    }
  }

  /**
   * Generate unique user identifier for analytics/tracking
   * Format: tg_{telegram_user_id}
   */
  static async getUniqueIdentifier(): Promise<string | null> {
    const userId = await this.getUserId();
    return userId ? `tg_${userId}` : null;
  }

  /**
   * Check if user should get Pro features
   * (e.g., Telegram Premium users might get auto-Pro)
   */
  static async shouldAutoGrantPro(): Promise<boolean> {
    // For now, we don't auto-grant Pro to Telegram Premium users
    // This can be changed based on business logic
    return false;
  }
}
