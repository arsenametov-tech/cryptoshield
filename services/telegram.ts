import WebApp from '@twa-dev/sdk';

/**
 * Telegram Mini App Service
 * Handles Telegram-specific functionality
 */
export class TelegramService {
  /**
   * Check if app is running inside Telegram
   */
  static isInTelegram(): boolean {
    return WebApp.platform !== 'unknown';
  }

  /**
   * Get Telegram user data
   */
  static getUser() {
    return WebApp.initDataUnsafe.user;
  }

  /**
   * Get Telegram user ID
   */
  static getUserId(): number | null {
    return WebApp.initDataUnsafe.user?.id || null;
  }

  /**
   * Get user language (fallback to Russian)
   */
  static getUserLanguage(): string {
    return WebApp.initDataUnsafe.user?.language_code || 'ru';
  }

  /**
   * Check if user has Telegram Premium
   */
  static isUserPremium(): boolean {
    return WebApp.initDataUnsafe.user?.is_premium || false;
  }

  /**
   * Get Telegram theme parameters
   */
  static getThemeParams() {
    return WebApp.themeParams;
  }

  /**
   * Get color scheme
   */
  static getColorScheme(): 'light' | 'dark' {
    return WebApp.colorScheme;
  }

  /**
   * Get init data (for backend authentication)
   */
  static getInitData(): string {
    return WebApp.initData;
  }

  /**
   * Get init data unsafe (for quick access)
   */
  static getInitDataUnsafe() {
    return WebApp.initDataUnsafe;
  }

  /**
   * Expand the app to full height
   */
  static expand() {
    WebApp.expand();
  }

  /**
   * Close the mini app
   */
  static close() {
    WebApp.close();
  }

  /**
   * Show main button
   */
  static showMainButton(text: string, onClick: () => void, options?: { color?: string; textColor?: string; isActive?: boolean }) {
    WebApp.MainButton.setText(text);

    if (options?.color) {
      WebApp.MainButton.setParams({ color: options.color });
    }

    if (options?.textColor) {
      WebApp.MainButton.setParams({ text_color: options.textColor });
    }

    if (options?.isActive !== undefined) {
      if (options.isActive) {
        WebApp.MainButton.enable();
      } else {
        WebApp.MainButton.disable();
      }
    }

    WebApp.MainButton.show();
    WebApp.MainButton.onClick(onClick);
  }

  /**
   * Hide main button
   */
  static hideMainButton() {
    WebApp.MainButton.hide();
  }

  /**
   * Update main button text
   */
  static updateMainButtonText(text: string) {
    WebApp.MainButton.setText(text);
  }

  /**
   * Enable/disable main button
   */
  static setMainButtonEnabled(enabled: boolean) {
    if (enabled) {
      WebApp.MainButton.enable();
    } else {
      WebApp.MainButton.disable();
    }
  }

  /**
   * Show progress on main button
   */
  static showMainButtonProgress(visible: boolean) {
    if (visible) {
      WebApp.MainButton.showProgress();
    } else {
      WebApp.MainButton.hideProgress();
    }
  }

  /**
   * Show back button
   */
  static showBackButton(onClick: () => void) {
    WebApp.BackButton.show();
    WebApp.BackButton.onClick(onClick);
  }

  /**
   * Hide back button
   */
  static hideBackButton() {
    WebApp.BackButton.hide();
  }

  /**
   * Open external link
   */
  static openLink(url: string, options?: { try_instant_view?: boolean }) {
    if (options && options.try_instant_view !== undefined) {
      WebApp.openLink(url, { try_instant_view: options.try_instant_view });
    } else {
      WebApp.openLink(url);
    }
  }

  /**
   * Open Telegram link (e.g., user profile, channel)
   */
  static openTelegramLink(url: string) {
    WebApp.openTelegramLink(url);
  }

  /**
   * Show popup
   */
  static async showPopup(params: {
    title?: string;
    message: string;
    buttons?: Array<{ id: string; type: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'; text: string }>;
  }): Promise<string> {
    return new Promise((resolve) => {
      WebApp.showPopup(params, (buttonId) => {
        resolve(buttonId || '');
      });
    });
  }

  /**
   * Show alert
   */
  static async showAlert(message: string): Promise<void> {
    return new Promise((resolve) => {
      WebApp.showAlert(message, () => {
        resolve();
      });
    });
  }

  /**
   * Show confirm dialog
   */
  static async showConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      WebApp.showConfirm(message, (confirmed) => {
        resolve(confirmed);
      });
    });
  }

  /**
   * Request write access to send messages to user
   */
  static async requestWriteAccess(): Promise<boolean> {
    return new Promise((resolve) => {
      WebApp.requestWriteAccess((granted) => {
        resolve(granted);
      });
    });
  }

  /**
   * Request contact (phone number)
   */
  static async requestContact(): Promise<boolean> {
    return new Promise((resolve) => {
      WebApp.requestContact((granted) => {
        resolve(granted);
      });
    });
  }

  /**
   * Enable closing confirmation
   */
  static enableClosingConfirmation() {
    WebApp.enableClosingConfirmation();
  }

  /**
   * Disable closing confirmation
   */
  static disableClosingConfirmation() {
    WebApp.disableClosingConfirmation();
  }

  /**
   * Send data to bot
   */
  static sendData(data: string) {
    WebApp.sendData(data);
  }

  /**
   * Switch to inline mode
   */
  static switchInlineQuery(query: string, chatTypes?: ('users' | 'bots' | 'groups' | 'channels')[]) {
    WebApp.switchInlineQuery(query, chatTypes);
  }

  /**
   * Check if viewport is expanded
   */
  static isExpanded(): boolean {
    return WebApp.isExpanded;
  }

  /**
   * Get viewport height
   */
  static getViewportHeight(): number {
    return WebApp.viewportHeight;
  }

  /**
   * Get viewport stable height
   */
  static getViewportStableHeight(): number {
    return WebApp.viewportStableHeight;
  }
}

/**
 * Telegram Haptic Feedback Service
 * Uses native Telegram haptics
 */
export class TelegramHapticsService {
  static light() {
    if (TelegramService.isInTelegram()) {
      WebApp.HapticFeedback.impactOccurred('light');
    }
  }

  static medium() {
    if (TelegramService.isInTelegram()) {
      WebApp.HapticFeedback.impactOccurred('medium');
    }
  }

  static heavy() {
    if (TelegramService.isInTelegram()) {
      WebApp.HapticFeedback.impactOccurred('heavy');
    }
  }

  static success() {
    if (TelegramService.isInTelegram()) {
      WebApp.HapticFeedback.notificationOccurred('success');
    }
  }

  static warning() {
    if (TelegramService.isInTelegram()) {
      WebApp.HapticFeedback.notificationOccurred('warning');
    }
  }

  static error() {
    if (TelegramService.isInTelegram()) {
      WebApp.HapticFeedback.notificationOccurred('error');
    }
  }

  static selection() {
    if (TelegramService.isInTelegram()) {
      WebApp.HapticFeedback.selectionChanged();
    }
  }
}
