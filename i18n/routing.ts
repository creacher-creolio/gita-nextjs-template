// i18n/routing.ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ["en", "es", "fr", "de", "zh-TW", "ru"],

    // Used when no locale matches
    defaultLocale: "en",
});

// Lightweight wrappers around Next.js' navigation APIs that consider the routing configuration
export type Locale = (typeof routing.locales)[number];
