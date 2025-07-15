// app/[locale]/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";

import { SUPPORTED_LOCALES, localeUtils } from "@/i18n/locales";

import "../globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
    return SUPPORTED_LOCALES.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "metadata" });

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function LocaleLayout({ children, params }: Props) {
    const { locale } = await params;

    // Ensure that the incoming `locale` is valid
    if (!localeUtils.isSupported(locale)) {
        notFound();
    }

    // Providing all messages to the client side for the specific locale
    const messages = await getMessages({ locale });

    return (
        <html lang={locale}>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
            </body>
        </html>
    );
}
