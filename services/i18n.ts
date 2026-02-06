import AsyncStorage from '@react-native-async-storage/async-storage';
import ruTranslations from '@/locales/ru.json';

type TranslationKey = string;
type TranslationParams = Record<string, string | number>;

class I18nService {
  private currentLocale: string = 'ru'; // Default to Russian
  private translations: Record<string, any> = { ru: ruTranslations };

  async init() {
    try {
      const savedLocale = await AsyncStorage.getItem('@cryptoshield_locale');
      if (savedLocale) {
        this.currentLocale = savedLocale;
      }
    } catch (error) {
      console.error('Error loading locale:', error);
    }
  }

  async setLocale(locale: string) {
    this.currentLocale = locale;
    try {
      await AsyncStorage.setItem('@cryptoshield_locale', locale);
    } catch (error) {
      console.error('Error saving locale:', error);
    }
  }

  getCurrentLocale(): string {
    return this.currentLocale;
  }

  t(key: TranslationKey, params?: TranslationParams): string {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLocale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }

    // Handle pluralization for Russian
    if (params && 'count' in params) {
      const count = params.count as number;
      const pluralForm = this.getPluralForm(count);

      // Try to find plural form (e.g., key_one, key_few, key_many)
      const pluralKey = `${key}_${pluralForm}`;
      const pluralKeys = pluralKey.split('.');
      let pluralValue: any = this.translations[this.currentLocale];

      for (const k of pluralKeys) {
        if (pluralValue && typeof pluralValue === 'object' && k in pluralValue) {
          pluralValue = pluralValue[k];
        } else {
          pluralValue = null;
          break;
        }
      }

      if (typeof pluralValue === 'string') {
        value = pluralValue;
      }
    }

    // Replace parameters
    if (params) {
      Object.keys(params).forEach((param) => {
        value = value.replace(new RegExp(`{{${param}}}`, 'g'), String(params[param]));
      });
    }

    return value;
  }

  // Russian pluralization rules
  private getPluralForm(count: number): 'one' | 'few' | 'many' {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) {
      return 'one';
    }
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return 'few';
    }
    return 'many';
  }

  // Helper for component usage
  useTranslation() {
    return {
      t: this.t.bind(this),
      locale: this.currentLocale,
      setLocale: this.setLocale.bind(this),
    };
  }
}

export const i18n = new I18nService();
export const t = (key: TranslationKey, params?: TranslationParams) => i18n.t(key, params);
