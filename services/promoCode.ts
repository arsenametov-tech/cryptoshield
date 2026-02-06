import AsyncStorage from '@react-native-async-storage/async-storage';

// Promo code types
export enum PromoCodeType {
  BONUS_SCANS = 'BONUS_SCANS',
  PRO_TRIAL = 'PRO_TRIAL',
  LIFETIME_PRO = 'LIFETIME_PRO',
}

export interface PromoCodeData {
  code: string;
  type: PromoCodeType;
  value: number; // For BONUS_SCANS: number of scans, For PRO_TRIAL: days
  description: string;
}

// Define promo codes with their behaviors
const PROMO_CODES: PromoCodeData[] = [
  {
    code: 'FREE_START',
    type: PromoCodeType.BONUS_SCANS,
    value: 10,
    description: 'Grants 10 additional one-time scans',
  },
  {
    code: 'COMMUNITY_PRO',
    type: PromoCodeType.PRO_TRIAL,
    value: 7,
    description: 'Unlocks Pro features for 7 days',
  },
  {
    code: 'LEGACY_USER',
    type: PromoCodeType.LIFETIME_PRO,
    value: 0,
    description: 'Unlocks lifetime Pro status',
  },
  // Legacy codes for backward compatibility
  {
    code: 'FASTSHOT2025',
    type: PromoCodeType.LIFETIME_PRO,
    value: 0,
    description: 'Unlocks lifetime Pro status',
  },
  {
    code: 'CRYPTO_PRO',
    type: PromoCodeType.LIFETIME_PRO,
    value: 0,
    description: 'Unlocks lifetime Pro status',
  },
  {
    code: 'FAMILY_FOREVER',
    type: PromoCodeType.LIFETIME_PRO,
    value: 0,
    description: 'Unlocks lifetime Pro status',
  },
  {
    code: 'FRIEND_VIP',
    type: PromoCodeType.PRO_TRIAL,
    value: 14,
    description: 'Unlocks Pro features for 14 days',
  },
  {
    code: 'BETA_TESTER',
    type: PromoCodeType.BONUS_SCANS,
    value: 20,
    description: 'Grants 20 additional one-time scans',
  },
  {
    code: 'EARLY_BIRD',
    type: PromoCodeType.LIFETIME_PRO,
    value: 0,
    description: 'Unlocks lifetime Pro status',
  },
];

const PROMO_CODE_KEY = '@cryptoshield_promo_unlocked';
const PROMO_CODE_USED_KEY = '@cryptoshield_promo_code';
const PROMO_TRIAL_EXPIRY_KEY = '@cryptoshield_promo_trial_expiry';
const BONUS_SCANS_KEY = '@cryptoshield_bonus_scans';
const USED_CODES_KEY = '@cryptoshield_used_codes';

export interface ApplyPromoResult {
  success: boolean;
  message: string;
  promoData?: PromoCodeData;
}

export class PromoCodeService {
  /**
   * Validate and apply a promo code
   */
  static async applyPromoCode(code: string): Promise<ApplyPromoResult> {
    const trimmedCode = code.trim().toUpperCase();

    // Find the promo code
    const promoData = PROMO_CODES.find((p) => p.code === trimmedCode);
    if (!promoData) {
      return {
        success: false,
        message: 'Invalid promo code',
      };
    }

    // Check if code was already used
    const usedCodes = await this.getUsedCodes();
    if (usedCodes.includes(trimmedCode)) {
      return {
        success: false,
        message: 'This promo code has already been used',
      };
    }

    try {
      // Apply the promo code based on its type
      switch (promoData.type) {
        case PromoCodeType.BONUS_SCANS:
          await this.addBonusScans(promoData.value);
          break;

        case PromoCodeType.PRO_TRIAL:
          await this.activateProTrial(promoData.value);
          break;

        case PromoCodeType.LIFETIME_PRO:
          await this.activateLifetimePro();
          break;
      }

      // Mark code as used
      await this.markCodeAsUsed(trimmedCode);

      return {
        success: true,
        message: 'Promo code activated successfully!',
        promoData,
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
   * Add bonus scans
   */
  private static async addBonusScans(count: number): Promise<void> {
    const currentBonus = await this.getBonusScans();
    await AsyncStorage.setItem(BONUS_SCANS_KEY, (currentBonus + count).toString());
  }

  /**
   * Get remaining bonus scans
   */
  static async getBonusScans(): Promise<number> {
    try {
      const bonusStr = await AsyncStorage.getItem(BONUS_SCANS_KEY);
      return bonusStr ? parseInt(bonusStr, 10) : 0;
    } catch (error) {
      console.error('Error getting bonus scans:', error);
      return 0;
    }
  }

  /**
   * Use a bonus scan
   */
  static async useBonusScan(): Promise<void> {
    const current = await this.getBonusScans();
    if (current > 0) {
      await AsyncStorage.setItem(BONUS_SCANS_KEY, (current - 1).toString());
    }
  }

  /**
   * Activate Pro trial
   */
  private static async activateProTrial(days: number): Promise<void> {
    const expiryDate = Date.now() + days * 24 * 60 * 60 * 1000;
    await AsyncStorage.setItem(PROMO_TRIAL_EXPIRY_KEY, expiryDate.toString());
  }

  /**
   * Check if Pro trial is active
   */
  static async hasActiveProTrial(): Promise<boolean> {
    try {
      const expiryStr = await AsyncStorage.getItem(PROMO_TRIAL_EXPIRY_KEY);
      if (!expiryStr) return false;

      const expiryDate = parseInt(expiryStr, 10);
      return Date.now() < expiryDate;
    } catch (error) {
      console.error('Error checking Pro trial:', error);
      return false;
    }
  }

  /**
   * Get Pro trial expiry date
   */
  static async getProTrialExpiry(): Promise<Date | null> {
    try {
      const expiryStr = await AsyncStorage.getItem(PROMO_TRIAL_EXPIRY_KEY);
      if (!expiryStr) return null;

      const expiryDate = parseInt(expiryStr, 10);
      return Date.now() < expiryDate ? new Date(expiryDate) : null;
    } catch (error) {
      console.error('Error getting Pro trial expiry:', error);
      return null;
    }
  }

  /**
   * Activate lifetime Pro
   */
  private static async activateLifetimePro(): Promise<void> {
    await AsyncStorage.setItem(PROMO_CODE_KEY, 'true');
    await AsyncStorage.setItem(PROMO_CODE_USED_KEY, 'LIFETIME_PRO');
  }

  /**
   * Check if user has lifetime Pro via promo code
   */
  static async hasLifetimePro(): Promise<boolean> {
    try {
      const unlocked = await AsyncStorage.getItem(PROMO_CODE_KEY);
      return unlocked === 'true';
    } catch (error) {
      console.error('Error checking lifetime Pro:', error);
      return false;
    }
  }

  /**
   * Check if user has Pro access via promo code (lifetime or trial)
   */
  static async hasPromoUnlock(): Promise<boolean> {
    const hasLifetime = await this.hasLifetimePro();
    const hasTrial = await this.hasActiveProTrial();
    return hasLifetime || hasTrial;
  }

  /**
   * Get used codes list
   */
  private static async getUsedCodes(): Promise<string[]> {
    try {
      const codesStr = await AsyncStorage.getItem(USED_CODES_KEY);
      return codesStr ? JSON.parse(codesStr) : [];
    } catch (error) {
      console.error('Error getting used codes:', error);
      return [];
    }
  }

  /**
   * Mark a code as used
   */
  private static async markCodeAsUsed(code: string): Promise<void> {
    try {
      const usedCodes = await this.getUsedCodes();
      usedCodes.push(code);
      await AsyncStorage.setItem(USED_CODES_KEY, JSON.stringify(usedCodes));
    } catch (error) {
      console.error('Error marking code as used:', error);
    }
  }

  /**
   * Get the primary used promo code (for display purposes)
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
      await AsyncStorage.removeItem(PROMO_TRIAL_EXPIRY_KEY);
      await AsyncStorage.removeItem(BONUS_SCANS_KEY);
      await AsyncStorage.removeItem(USED_CODES_KEY);
    } catch (error) {
      console.error('Error clearing promo unlock:', error);
    }
  }

  /**
   * Get promo status summary
   */
  static async getPromoStatus(): Promise<{
    hasLifetimePro: boolean;
    hasActiveTrial: boolean;
    trialExpiryDate: Date | null;
    bonusScans: number;
    usedCodes: string[];
  }> {
    return {
      hasLifetimePro: await this.hasLifetimePro(),
      hasActiveTrial: await this.hasActiveProTrial(),
      trialExpiryDate: await this.getProTrialExpiry(),
      bonusScans: await this.getBonusScans(),
      usedCodes: await this.getUsedCodes(),
    };
  }
}
