// i18n/locales.ts
// 🌍 SINGLE SOURCE OF TRUTH FOR LOCALES
// Add new locale codes here when creating new translation files in localization/
// This is the only place where you need to define supported locales

/**
 * List of all supported locale codes
 * These must match the filenames in the localization/ folder
 * Example: "ja" requires localization/ja.json to exist
 */
export const SUPPORTED_LOCALES = ["en", "es", "zh-TW", "ru", "fr"] as const;

/**
 * Default locale to use when no locale is specified or detected
 * Prefers English if available, otherwise uses the first locale in the list
 */
export const DEFAULT_LOCALE = SUPPORTED_LOCALES.includes("en" as any) ? "en" : SUPPORTED_LOCALES[0];

/**
 * Type for supported locale codes
 */
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Utility functions for locale management
 */
export const localeUtils = {
    /**
     * Check if a locale code is supported
     */
    isSupported: (locale: string): locale is SupportedLocale => {
        return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
    },

    /**
     * Get all supported locales as a readonly array
     */
    getAll: () => SUPPORTED_LOCALES,

    /**
     * Get the default locale
     */
    getDefault: () => DEFAULT_LOCALE,

    /**
     * Get a valid locale, falling back to default if invalid
     */
    getValidOrDefault: (locale?: string): SupportedLocale => {
        if (locale && localeUtils.isSupported(locale)) {
            return locale;
        }
        return DEFAULT_LOCALE;
    },
};
