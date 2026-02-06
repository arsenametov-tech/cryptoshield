import WebApp from '@twa-dev/sdk';
import { TelegramService } from './telegram';

export interface TelegramStarsProduct {
  id: string;
  title: string;
  description: string;
  starsAmount: number;
  period?: 'monthly' | 'lifetime';
}

// Telegram Stars pricing
export const TELEGRAM_STARS_PRODUCTS: TelegramStarsProduct[] = [
  {
    id: 'cryptoshield_pro_monthly',
    title: 'Cryptoshield Pro (Месяц)',
    description: 'Безлимитные проверки и все премиум функции на 1 месяц',
    starsAmount: 99,
    period: 'monthly',
  },
  {
    id: 'cryptoshield_pro_lifetime',
    title: 'Cryptoshield Pro (Навсегда)',
    description: 'Пожизненный доступ ко всем премиум функциям',
    starsAmount: 499,
    period: 'lifetime',
  },
];

export interface PurchaseResult {
  success: boolean;
  cancelled: boolean;
  error?: string;
}

/**
 * Telegram Stars Payment Service
 * Handles native Telegram Stars payments
 */
export class TelegramStarsService {
  /**
   * Check if Telegram Stars payments are available
   */
  static isAvailable(): boolean {
    return TelegramService.isInTelegram() && typeof WebApp.openInvoice === 'function';
  }

  /**
   * Create an invoice link for Telegram Stars payment
   *
   * Note: This requires a bot to generate the invoice link
   * The bot should use the Telegram Bot API's createInvoiceLink method
   * with provider_token="" for Stars payments
   */
  static async purchaseWithStars(product: TelegramStarsProduct): Promise<PurchaseResult> {
    if (!this.isAvailable()) {
      return {
        success: false,
        cancelled: false,
        error: 'Telegram Stars payments are not available',
      };
    }

    try {
      // In a real implementation, you would:
      // 1. Call your backend to generate an invoice link using Telegram Bot API
      // 2. The backend would call: createInvoiceLink with provider_token="" for Stars
      // 3. Open the invoice in Telegram

      // For now, we'll show a placeholder implementation
      // You need to implement your backend endpoint that creates the invoice

      const invoiceUrl = await this.createInvoiceLink(product);

      if (!invoiceUrl) {
        return {
          success: false,
          cancelled: false,
          error: 'Failed to create invoice',
        };
      }

      // Open the invoice
      return await this.openInvoice(invoiceUrl);
    } catch (error) {
      console.error('Error purchasing with Stars:', error);
      return {
        success: false,
        cancelled: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create invoice link via backend
   * This should call your backend which then calls Telegram Bot API
   */
  private static async createInvoiceLink(product: TelegramStarsProduct): Promise<string | null> {
    try {
      // TODO: Replace with your actual backend endpoint
      // Your backend should:
      // 1. Accept product details
      // 2. Call Telegram Bot API: createInvoiceLink
      // 3. Use provider_token="" for Stars payments
      // 4. Return the invoice link

      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        console.warn('Backend URL not configured for Telegram Stars payments');
        return null;
      }

      const userId = TelegramService.getUserId();
      const initData = TelegramService.getInitData();

      const response = await fetch(`${backendUrl}/api/telegram/create-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          title: product.title,
          description: product.description,
          starsAmount: product.starsAmount,
          userId,
          initData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      const data = await response.json();
      return data.invoiceLink;
    } catch (error) {
      console.error('Error creating invoice link:', error);
      return null;
    }
  }

  /**
   * Open Telegram invoice and wait for payment result
   */
  private static async openInvoice(invoiceUrl: string): Promise<PurchaseResult> {
    return new Promise((resolve) => {
      WebApp.openInvoice(invoiceUrl, (status) => {
        switch (status) {
          case 'paid':
            resolve({ success: true, cancelled: false });
            break;
          case 'cancelled':
            resolve({ success: false, cancelled: true });
            break;
          case 'failed':
          case 'pending':
          default:
            resolve({ success: false, cancelled: false, error: `Payment ${status}` });
            break;
        }
      });
    });
  }

  /**
   * Format Stars amount with icon
   */
  static formatStarsAmount(amount: number): string {
    return `⭐ ${amount}`;
  }

  /**
   * Get product by ID
   */
  static getProduct(productId: string): TelegramStarsProduct | undefined {
    return TELEGRAM_STARS_PRODUCTS.find((p) => p.id === productId);
  }

  /**
   * Get all products
   */
  static getAllProducts(): TelegramStarsProduct[] {
    return TELEGRAM_STARS_PRODUCTS;
  }
}
