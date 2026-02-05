import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { TelegramHapticsService } from './telegram';

/**
 * Haptic Feedback Service for Cryptoshield
 * Provides consistent haptic feedback across the app
 * Uses Telegram haptics when running in Telegram Mini App, otherwise uses Expo haptics
 */
export class HapticsService {
  /**
   * Check if running in Telegram
   */
  private static isInTelegram(): boolean {
    // Check if we're on web and have Telegram WebApp
    return Platform.OS === 'web' && typeof window !== 'undefined' && !!(window as any).Telegram?.WebApp;
  }

  /**
   * Light impact - for UI interactions like button presses
   */
  static light() {
    if (this.isInTelegram()) {
      TelegramHapticsService.light();
    } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  /**
   * Medium impact - for standard interactions like toggling
   */
  static medium() {
    if (this.isInTelegram()) {
      TelegramHapticsService.medium();
    } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  /**
   * Heavy impact - for important actions like scan initiation
   */
  static heavy() {
    if (this.isInTelegram()) {
      TelegramHapticsService.heavy();
    } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }

  /**
   * Success notification - for completed actions
   */
  static success() {
    if (this.isInTelegram()) {
      TelegramHapticsService.success();
    } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  /**
   * Warning notification - for warning states
   */
  static warning() {
    if (this.isInTelegram()) {
      TelegramHapticsService.warning();
    } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }

  /**
   * Error notification - for error states
   */
  static error() {
    if (this.isInTelegram()) {
      TelegramHapticsService.error();
    } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  /**
   * Selection changed - for picker/toggle interactions
   */
  static selection() {
    if (this.isInTelegram()) {
      TelegramHapticsService.selection();
    } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.selectionAsync();
    }
  }
}
