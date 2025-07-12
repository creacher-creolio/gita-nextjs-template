// components/locale-switcher.tsx
"use client";

import { ChevronDown, Globe } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const locales = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "zh-TW", name: "繁體中文", flag: "🇹🇼" },
];

export function LocaleSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const handleLocaleChange = (newLocale: string) => {
        startTransition(() => {
            // Remove the current locale from the pathname
            const segments = pathname.split("/");
            if (segments[1] && locales.some(l => l.code === segments[1])) {
                segments[1] = newLocale;
            } else {
                segments.unshift(newLocale);
            }
            const newPath = segments.join("/");
            router.push(newPath);
        });
    };

    const currentLocale = locales.find(l => l.code === locale);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isPending} className="gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline-block">
                        {currentLocale ? `${currentLocale.flag} ${currentLocale.name}` : locale}
                    </span>
                    <span className="sm:hidden">{currentLocale?.flag}</span>
                    <ChevronDown className="h-3 w-3" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {locales.map(loc => (
                    <DropdownMenuItem
                        key={loc.code}
                        onClick={() => handleLocaleChange(loc.code)}
                        className={`cursor-pointer ${locale === loc.code ? "bg-accent" : ""}`}>
                        <span className="mr-2">{loc.flag}</span>
                        {loc.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
