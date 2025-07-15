"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const locale = useLocale();
    const t = useTranslations("auth.forgotPassword");

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        const supabase = createClient();
        setIsLoading(true);
        setError(null);

        try {
            // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/${locale}/auth/update-password`,
            });
            if (error) throw error;
            setSuccess(true);
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : t("genericError"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            {success ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">{t("checkEmail")}</CardTitle>
                        <CardDescription>{t("instructionsSent")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">{t("emailDescription")}</p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">{t("title")}</CardTitle>
                        <CardDescription>{t("description")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleForgotPassword}>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">{t("email")}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                                {error && <p className="text-sm text-red-500">{error}</p>}
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? t("sending") : t("resetPassword")}
                                </Button>
                            </div>
                            <div className="mt-4 text-center text-sm">
                                {t("backToLogin")}{" "}
                                <Link href="/auth/login" className="underline underline-offset-4">
                                    {t("login")}
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
