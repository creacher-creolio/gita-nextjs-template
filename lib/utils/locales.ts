// lib/utils/locales.ts
import { SUPPORTED_LOCALES } from "@/i18n/locales";

// Locale configuration with display names and flags
export interface LocaleConfig {
    code: string;
    name: string;
    flag: string;
}

// Map of locale codes to their display information
const localeDisplayMap: Record<string, { name: string; flag: string }> = {};

// Initialize locale display mappings
localeDisplayMap.en = { name: "English", flag: "🇺🇸" };
localeDisplayMap.es = { name: "Español", flag: "🇪🇸" };
localeDisplayMap.fr = { name: "Français", flag: "🇫🇷" };
localeDisplayMap.de = { name: "Deutsch", flag: "🇩🇪" };
localeDisplayMap.ru = { name: "Русский", flag: "🇷🇺" };
localeDisplayMap["zh-TW"] = { name: "繁體中文", flag: "🇹🇼" };
localeDisplayMap["zh-CN"] = { name: "简体中文", flag: "🇨🇳" };
localeDisplayMap.ja = { name: "日本語", flag: "🇯🇵" };
localeDisplayMap.ko = { name: "한국어", flag: "🇰🇷" };
localeDisplayMap.pt = { name: "Português", flag: "🇵🇹" };
localeDisplayMap.it = { name: "Italiano", flag: "🇮🇹" };
localeDisplayMap.nl = { name: "Nederlands", flag: "🇳🇱" };
localeDisplayMap.pl = { name: "Polski", flag: "🇵🇱" };
localeDisplayMap.tr = { name: "Türkçe", flag: "🇹🇷" };
localeDisplayMap.ar = { name: "العربية", flag: "🇸🇦" };
localeDisplayMap.hi = { name: "हिन्दी", flag: "🇮🇳" };
localeDisplayMap.th = { name: "ไทย", flag: "🇹🇭" };
localeDisplayMap.vi = { name: "Tiếng Việt", flag: "🇻🇳" };
localeDisplayMap.sv = { name: "Svenska", flag: "🇸🇪" };
localeDisplayMap.da = { name: "Dansk", flag: "🇩🇰" };
localeDisplayMap.no = { name: "Norsk", flag: "🇳🇴" };
localeDisplayMap.fi = { name: "Suomi", flag: "🇫🇮" };

// Get locale configurations for supported locales
export function getSupportedLocaleConfigs(): LocaleConfig[] {
    return SUPPORTED_LOCALES.map(code => ({
        code,
        name: localeDisplayMap[code]?.name || code.toUpperCase(),
        flag: localeDisplayMap[code]?.flag || "🌐",
    }));
}

// Get the list of supported locale codes
export function getSupportedLocaleCodes(): readonly string[] {
    return SUPPORTED_LOCALES;
}
