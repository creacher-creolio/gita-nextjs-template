// i18n/request.ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { localeUtils } from "./locales";

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    let locale = await requestLocale;

    // Ensure that a valid locale is used
    if (!locale || !localeUtils.isSupported(locale)) {
        locale = routing.defaultLocale;
    }

    return {
        locale,
        messages: (await import(`../localization/${locale}.json`)).default,
    };
});
