import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import WebApp from '@twa-dev/sdk';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface TelegramContextType {
  webApp: typeof WebApp;
  user: TelegramUser | null;
  isReady: boolean;
  colorScheme: 'light' | 'dark';
  themeParams: typeof WebApp.themeParams;
  showMainButton: (text: string, onClick: () => void) => void;
  hideMainButton: () => void;
  showBackButton: (onClick: () => void) => void;
  hideBackButton: () => void;
  hapticFeedback: {
    light: () => void;
    medium: () => void;
    heavy: () => void;
    success: () => void;
    warning: () => void;
    error: () => void;
    selection: () => void;
  };
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: Array<{ id: string; type: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'; text: string }>;
  }) => Promise<string>;
  showAlert: (message: string) => Promise<void>;
  showConfirm: (message: string) => Promise<boolean>;
  expand: () => void;
  close: () => void;
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(WebApp.colorScheme);

  useEffect(() => {
    // Initialize Telegram WebApp
    WebApp.ready();
    WebApp.expand();

    // Enable closing confirmation
    WebApp.enableClosingConfirmation();

    // Get user data
    const initDataUnsafe = WebApp.initDataUnsafe;
    if (initDataUnsafe.user) {
      setUser(initDataUnsafe.user as TelegramUser);
    }

    // Set color scheme
    setColorScheme(WebApp.colorScheme);

    // Listen for theme changes
    const handleThemeChanged = () => {
      setColorScheme(WebApp.colorScheme);
    };

    WebApp.onEvent('themeChanged', handleThemeChanged);

    setIsReady(true);

    return () => {
      WebApp.offEvent('themeChanged', handleThemeChanged);
    };
  }, []);

  const showMainButton = useCallback((text: string, onClick: () => void) => {
    WebApp.MainButton.setText(text);
    WebApp.MainButton.show();
    WebApp.MainButton.onClick(onClick);
  }, []);

  const hideMainButton = useCallback(() => {
    WebApp.MainButton.hide();
    WebApp.MainButton.offClick(() => {});
  }, []);

  const showBackButton = useCallback((onClick: () => void) => {
    WebApp.BackButton.show();
    WebApp.BackButton.onClick(onClick);
  }, []);

  const hideBackButton = useCallback(() => {
    WebApp.BackButton.hide();
    WebApp.BackButton.offClick(() => {});
  }, []);

  const hapticFeedback = {
    light: () => WebApp.HapticFeedback.impactOccurred('light'),
    medium: () => WebApp.HapticFeedback.impactOccurred('medium'),
    heavy: () => WebApp.HapticFeedback.impactOccurred('heavy'),
    success: () => WebApp.HapticFeedback.notificationOccurred('success'),
    warning: () => WebApp.HapticFeedback.notificationOccurred('warning'),
    error: () => WebApp.HapticFeedback.notificationOccurred('error'),
    selection: () => WebApp.HapticFeedback.selectionChanged(),
  };

  const openLink = useCallback((url: string, options?: { try_instant_view?: boolean }) => {
    if (options && options.try_instant_view !== undefined) {
      WebApp.openLink(url, { try_instant_view: options.try_instant_view });
    } else {
      WebApp.openLink(url);
    }
  }, []);

  const showPopup = useCallback(async (params: {
    title?: string;
    message: string;
    buttons?: Array<{ id: string; type: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'; text: string }>;
  }): Promise<string> => {
    return new Promise((resolve) => {
      WebApp.showPopup(params, (buttonId) => {
        resolve(buttonId || '');
      });
    });
  }, []);

  const showAlert = useCallback(async (message: string): Promise<void> => {
    return new Promise((resolve) => {
      WebApp.showAlert(message, () => {
        resolve();
      });
    });
  }, []);

  const showConfirm = useCallback(async (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      WebApp.showConfirm(message, (confirmed) => {
        resolve(confirmed);
      });
    });
  }, []);

  const expand = useCallback(() => {
    WebApp.expand();
  }, []);

  const close = useCallback(() => {
    WebApp.close();
  }, []);

  const value: TelegramContextType = {
    webApp: WebApp,
    user,
    isReady,
    colorScheme,
    themeParams: WebApp.themeParams,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    hapticFeedback,
    openLink,
    showPopup,
    showAlert,
    showConfirm,
    expand,
    close,
  };

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
};

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (context === undefined) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
};
