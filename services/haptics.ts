import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic Feedback Service for Cryptoshield
 * Provides consistent haptic feedback across the app
 */
export class HapticsService {
  /**
   * Light impact - for UI interactions like button presses
   */
  static light() {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  /**
   * Medium impact - for standard interactions like toggling
   */
  static medium() {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }

  /**
   * Heavy impact - for important actions like scan initiation
   */
  static heavy() {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }

  /**
   * Success notification - for completed actions
   */
  static success() {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  /**
   * Warning notification - for warning states
   */
  static warning() {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }

  /**
   * Error notification - for error states
   */
  static error() {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  /**
   * Selection changed - for picker/toggle interactions
   */
  static selection() {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Haptics.selectionAsync();
    }
  }
}
