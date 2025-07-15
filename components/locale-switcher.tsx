// components/locale-switcher.tsx
"use client";

import { ChevronDown, Globe } from "lucide-react";
import { useParams, usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/navigation";
import { getSupportedLocaleConfigs, getSupportedLocaleCodes } from "@/lib/utils/locales";

export function LocaleSwitcher() {
    const params = useParams();
    const locale = params.locale as string;
    const pathname = usePathname();

    // Get dynamic locale configurations
    const locales = getSupportedLocaleConfigs();
    const localeCodes = getSupportedLocaleCodes();

    // Get the path without locale for Link href
    const pathSegments = pathname.split("/");
    const hasLocale = pathSegments[1] && localeCodes.includes(pathSegments[1]);
    const pathWithoutLocale = hasLocale ? "/" + pathSegments.slice(2).join("/") : pathname;
    const cleanPath = pathWithoutLocale === "/" || pathWithoutLocale === "" ? "/" : pathWithoutLocale;

    const currentLocale = locales.find(l => l.code === locale);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
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
                    <DropdownMenuItem key={loc.code} asChild>
                        <Link
                            href={cleanPath}
                            locale={loc.code}
                            className={`flex w-full cursor-pointer items-center ${locale === loc.code ? "bg-accent" : ""}`}>
                            <span className="mr-2">{loc.flag}</span>
                            {loc.name}
                        </Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
