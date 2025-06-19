import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import nextEslintPlugin from "@next/eslint-plugin-next";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";
import _import from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default defineConfig([
    globalIgnores([".prettierrc.js", "**/.next/", "**/*.config.ts", "**/build/", "**/dist/", "node_modules/"]),
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        extends: compat.extends(
            "next/core-web-vitals",
            "next/typescript",
            "plugin:react-hooks/recommended",
            "eslint:recommended",
            "plugin:jsx-a11y/recommended"
        ),

        plugins: {
            import: _import,
            "@typescript-eslint": typescriptEslint,
            react: reactPlugin,
            "react-hooks": reactHooksPlugin,
            "@next/next": nextEslintPlugin,
            "jsx-a11y": jsxA11y,
        },
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                project: "./tsconfig.json",
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                React: "readonly",
            },
        },
        rules: {
            // React specific rules
            "react/no-unescaped-entities": "off",
            "react/no-unused-prop-types": "warn",
            "react/react-in-jsx-scope": "off",

            // React Hooks rules
            "react-hooks/exhaustive-deps": "warn",
            "react-hooks/rules-of-hooks": "warn",

            // Next.js specific rules
            "@next/next/no-duplicate-head": "error",
            "@next/next/no-html-link-for-pages": "error",
            "@next/next/no-html-link-for-pages": "warn",
            "@next/next/no-img-element": "warn",
            "@next/next/no-page-custom-font": "off",
            "@next/next/no-script-component-in-head": "warn",
            "@next/next/no-unwanted-polyfillio": "error",

            // Naming conventions
            "@typescript-eslint/naming-convention": [
                "warn",
                {
                    selector: "default",
                    format: ["camelCase", "PascalCase", "UPPER_CASE", "snake_case"],
                    leadingUnderscore: "allow",
                    trailingUnderscore: "allow",
                },
            ],

            // TypeScript specific rules
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-unused-vars": "error",
            "@typescript-eslint/prefer-optional-chain": "warn",

            // Import ordering
            "import/order": [
                "warn",
                {
                    groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
                    pathGroups: [
                        {
                            pattern: "react",
                            group: "builtin",
                            position: "before",
                        },
                        {
                            pattern: "next/**",
                            group: "external",
                            position: "before",
                        },
                        {
                            pattern: "~/**",
                            group: "internal",
                            position: "after",
                        },
                        {
                            pattern: "@/**",
                            group: "internal",
                            position: "after",
                        },
                    ],
                    "newlines-between": "always",
                    alphabetize: {
                        order: "asc",
                        caseInsensitive: true,
                    },
                    warnOnUnassignedImports: true,
                },
            ],
            // Length and complexity limits
            "max-len": [
                "warn",
                {
                    code: 120,
                    ignoreComments: false,
                    ignoreRegExpLiterals: false,
                    ignoreStrings: false,
                    ignoreTemplateLiterals: false,
                    ignoreUrls: true,
                    ignorePattern: "^\\s*[\"'].*[\"'],?$|^.*(class=|className=|cn\\().*$",
                },
            ],
            "max-lines": [
                "warn",
                {
                    max: 250,
                    skipBlankLines: false,
                    skipComments: false,
                },
            ],
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },
    {
        files: ["**/components/ui/**/*.{js,ts,jsx,tsx}"],
        rules: {
            "@typescript-eslint/naming-convention": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "jsx-a11y/anchor-has-content": "off",
            "max-len": "off",
            "max-lines": "off",
            "no-explicit-any": "off",
            "no-unused-vars": "off",
            "react-hooks/exhaustive-deps": "warn",
        },
    },
    {
        files: ["**/types/**/*.{js,ts,jsx,tsx}"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "no-explicit-any": "off",
        },
    },
    eslintConfigPrettier,
]);
