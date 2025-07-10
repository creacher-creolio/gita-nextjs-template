// app/[locale]/page.tsx
import { Shield, Lock, User } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const t = await getTranslations("home");
    const tAuth = await getTranslations("home.authStatus");
    const tFeatures = await getTranslations("home.features");
    const tQuickNav = await getTranslations("home.quickNav");

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-8 dark:from-slate-900 dark:to-slate-800">
            {/* Language Switcher */}
            <div className="absolute top-4 right-4">
                <LocaleSwitcher />
            </div>

            <div className="w-full max-w-4xl space-y-8">
                {/* Header */}
                <div className="space-y-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <Shield className="text-primary h-8 w-8" />
                        <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
                    </div>
                    <p className="text-muted-foreground mx-auto max-w-2xl text-xl">{t("subtitle")}</p>
                </div>

                {/* Authentication Status */}
                <div className="flex justify-center">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="mb-2 flex justify-center">
                                <User className="text-primary h-8 w-8" />
                            </div>
                            <CardTitle>{user ? tAuth("welcomeBack") : tAuth("authStatus")}</CardTitle>
                            <CardDescription>
                                {user ? tAuth("loggedInAs", { email: user.email || "" }) : tAuth("notLoggedIn")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {user ? (
                                <div className="space-y-3">
                                    <Button asChild className="w-full">
                                        <Link href="/protected">
                                            <Lock className="mr-2 h-4 w-4" />
                                            {tAuth("goToProtected")}
                                        </Link>
                                    </Button>
                                    <p className="text-muted-foreground text-center text-xs">{tAuth("hasAccess")}</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Button asChild className="w-full">
                                        <Link href="/auth/login">{tAuth("signIn")}</Link>
                                    </Button>
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href="/auth/sign-up">{tAuth("createAccount")}</Link>
                                    </Button>
                                    <p className="text-muted-foreground text-center text-xs">
                                        {tAuth("signInToAccess")}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Features */}
                <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                {tFeatures("secureAuth.title")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">{tFeatures("secureAuth.description")}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                {tFeatures("protectedRoutes.title")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">{tFeatures("protectedRoutes.description")}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                {tFeatures("userManagement.title")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">{tFeatures("userManagement.description")}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Navigation */}
                <div className="space-y-4 text-center">
                    <h3 className="text-lg font-semibold">{tQuickNav("title")}</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/auth/login">{tQuickNav("loginPage")}</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/auth/sign-up">{tQuickNav("signUpPage")}</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/protected">{tQuickNav("protectedPage")}</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
