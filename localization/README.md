# Localization

This folder contains all the translation files for the application. Due to Next.js Edge Runtime limitations in middleware, supported languages are configured in `i18n/locales.ts`.

## Adding a New Language

To add support for a new language:

1. **Create a new JSON file** with the language code as the filename (e.g., `ja.json` for Japanese, `pt.json` for Portuguese)
2. **Copy the structure** from `en.json` and translate all the text values
3. **Update the supported locales** in `i18n/locales.ts`:
   ```typescript
   // Update this array when adding new translation files
   export const SUPPORTED_LOCALES = ["de", "en", "es", "fr", "ru", "zh-TW", "ja"] as const; // Add your new locale here
   ```
4. **Restart the development server** - the language will appear in the language switcher

## Why Manual Configuration?

Next.js middleware runs in the Edge Runtime, which doesn't support Node.js file system APIs (`fs`, `path`). This means we can't automatically detect locale files at runtime. The configuration in `i18n/locales.ts` must be updated manually when adding new languages.

## Centralized Configuration

All locale settings are centralized in `i18n/locales.ts`:
- `SUPPORTED_LOCALES`: Array of supported locale codes
- `DEFAULT_LOCALE`: Default locale (prefers English if available)
- `localeUtils`: Utility functions for locale validation and management

This ensures that all parts of the application use the same locale configuration without duplication.

## Current Supported Languages

The following languages are currently configured (check `i18n/locales.ts` for the most up-to-date list):

- `de` - German (Deutsch)
- `en` - English
- `es` - Spanish (Español)
- `fr` - French (Français)
- `ru` - Russian (Русский)
- `zh-TW` - Traditional Chinese (繁體中文)

## Supported Language Codes

The app supports any valid locale code. Common examples:

- `en` - English
- `es` - Spanish
- `fr` - French
- `de` - German
- `ru` - Russian
- `zh-TW` - Traditional Chinese
- `zh-CN` - Simplified Chinese
- `ja` - Japanese
- `ko` - Korean
- `pt` - Portuguese
- `it` - Italian
- `nl` - Dutch
- `pl` - Polish
- `tr` - Turkish
- `ar` - Arabic
- `hi` - Hindi
- `th` - Thai
- `vi` - Vietnamese
- `sv` - Swedish
- `da` - Danish
- `no` - Norwegian
- `fi` - Finnish

## File Structure

Each translation file should contain the complete translation tree with all the same keys as the English file. The structure should look like:

```json
{
    "metadata": {
        "title": "...",
        "description": "..."
    },
    "home": {
        "title": "...",
        "subtitle": "...",
        "authStatus": {
            "welcomeBack": "...",
            // ... more keys
        },
        // ... more sections
    },
    "auth": {
        // ... auth translations
    },
    "protected": {
        // ... protected page translations
    },
    "common": {
        // ... common UI translations
    }
}
```

## Display Names and Flags

The app includes display names and flag emojis for common languages in `/lib/utils/locales.ts`. If you add a language that's not in the list, it will show the language code in uppercase with a generic globe emoji (🌐). You can add your language to the `localeDisplayMap` to customize the display name and flag.

## Notes

- **Manual Configuration Required**: You must update `i18n/locales.ts` when adding new locale files
- **Default Locale**: English (`en`) is used as the default if available, otherwise the first locale in the array
- **File Validation**: All translation files must be valid JSON
- **Restart Required**: Changes to locale configuration require a server restart in development mode
- **Missing Translations**: The app will gracefully handle missing translations by falling back to the key name
