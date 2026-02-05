import AsyncStorage from '@react-native-async-storage/async-storage';

const VALID_PROMO_CODES = [
  'FASTSHOT2025',
  'CRYPTO_PRO',
  'FAMILY_FOREVER',
  'FRIEND_VIP',
  'BETA_TESTER',
  'EARLY_BIRD',
];

const PROMO_CODE_KEY = '@cryptoshield_promo_unlocked';
const PROMO_CODE_USED_KEY = '@cryptoshield_promo_code';

export class PromoCodeService {
  /**
   * Validate and apply a promo code
   */
  static async applyPromoCode(code: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const trimmedCode = code.trim().toUpperCase();

    // Check if code is valid
    if (!VALID_PROMO_CODES.includes(trimmedCode)) {
      return {
        success: false,
        message: 'Invalid promo code',
      };
    }

    // Check if user already used a promo code
    const usedCode = await AsyncStorage.getItem(PROMO_CODE_USED_KEY);
    if (usedCode) {
      return {
        success: false,
        message: 'You have already used a promo code',
      };
    }

    try {
      // Mark as unlocked via promo
      await AsyncStorage.setItem(PROMO_CODE_KEY, 'true');
      await AsyncStorage.setItem(PROMO_CODE_USED_KEY, trimmedCode);

      return {
        success: true,
        message: 'Pro access unlocked successfully!',
      };
    } catch (error) {
      console.error('Error applying promo code:', error);
      return {
        success: false,
        message: 'Failed to apply promo code',
      };
    }
  }

  /**
   * Check if user has Pro access via promo code
   */
  static async hasPromoUnlock(): Promise<boolean> {
    try {
      const unlocked = await AsyncStorage.getItem(PROMO_CODE_KEY);
      return unlocked === 'true';
    } catch (error) {
      console.error('Error checking promo unlock:', error);
      return false;
    }
  }

  /**
   * Get the used promo code (if any)
   */
  static async getUsedPromoCode(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(PROMO_CODE_USED_KEY);
    } catch (error) {
      console.error('Error getting used promo code:', error);
      return null;
    }
  }

  /**
   * Clear promo unlock (for testing purposes)
   */
  static async clearPromoUnlock(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PROMO_CODE_KEY);
      await AsyncStorage.removeItem(PROMO_CODE_USED_KEY);
    } catch (error) {
      console.error('Error clearing promo unlock:', error);
    }
  }
}
