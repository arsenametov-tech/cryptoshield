import { TelegramService } from './telegram';
import { colors as baseColors } from '@/constants/theme';

/**
 * Theme Sync Service
 * Syncs app theme with Telegram's color parameters while maintaining Midnight aesthetic
 */
export class ThemeSyncService {
  /**
   * Get theme colors based on Telegram parameters
   * Maintains the Midnight aesthetic while respecting Telegram's color scheme
   */
  static getColors() {
    if (!TelegramService.isInTelegram()) {
      return baseColors;
    }

    const themeParams = TelegramService.getThemeParams();
    const isDark = TelegramService.getColorScheme() === 'dark';

    // If in Telegram, blend our colors with Telegram's theme
    // Keep our Midnight aesthetic but adjust slightly for Telegram integration
    return {
      ...baseColors,
      // Use Telegram's background if it's dark, otherwise keep ours
      background: isDark && themeParams.bg_color ? themeParams.bg_color : baseColors.background,
      backgroundSecondary: isDark && themeParams.secondary_bg_color ? themeParams.secondary_bg_color : baseColors.backgroundSecondary,
      // Keep our primary color (teal/green) for branding
      primary: baseColors.primary,
      primaryDark: baseColors.primaryDark,
      primaryGlow: baseColors.primaryGlow,
      // Use Telegram's text colors if available
      text: themeParams.text_color || baseColors.text,
      textSecondary: themeParams.hint_color || baseColors.textSecondary,
      // Keep our status colors
      success: baseColors.success,
      warning: baseColors.warning,
      danger: baseColors.danger,
      dangerDark: baseColors.dangerDark,
      // Use Telegram's link color if available, otherwise use our primary
      link: themeParams.link_color || baseColors.primary,
      // Blend borders with Telegram theme
      border: themeParams.section_separator_color || baseColors.border,
      borderLight: baseColors.borderLight,
    };
  }

  /**
   * Get button color for Telegram Main Button
   */
  static getMainButtonColor(): string {
    if (!TelegramService.isInTelegram()) {
      return baseColors.primary;
    }

    const themeParams = TelegramService.getThemeParams();
    return themeParams.button_color || baseColors.primary;
  }

  /**
   * Get button text color for Telegram Main Button
   */
  static getMainButtonTextColor(): string {
    if (!TelegramService.isInTelegram()) {
      return '#0a0e1a'; // Dark text on bright primary button
    }

    const themeParams = TelegramService.getThemeParams();
    return themeParams.button_text_color || '#0a0e1a';
  }

  /**
   * Check if we should use dark theme
   */
  static isDarkTheme(): boolean {
    if (!TelegramService.isInTelegram()) {
      return true; // Always dark for non-Telegram
    }

    return TelegramService.getColorScheme() === 'dark';
  }

  /**
   * Get header background color
   */
  static getHeaderColor(): string {
    if (!TelegramService.isInTelegram()) {
      return baseColors.background;
    }

    const themeParams = TelegramService.getThemeParams();
    return themeParams.header_bg_color || baseColors.background;
  }

  /**
   * Get accent color (for highlights, links, etc.)
   */
  static getAccentColor(): string {
    if (!TelegramService.isInTelegram()) {
      return baseColors.primary;
    }

    const themeParams = TelegramService.getThemeParams();
    // Use Telegram's accent if available, otherwise our primary
    return themeParams.link_color || baseColors.primary;
  }
}
