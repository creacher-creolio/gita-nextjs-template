// app/[locale]/auth/error/page.tsx
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

export default async function AuthErrorPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <Card>
                    <CardHeader className="text-center">
                        <div className="mb-2 flex justify-center">
                            <AlertTriangle className="text-destructive h-8 w-8" />
                        </div>
                        <CardTitle className="text-2xl">Authentication Error</CardTitle>
                        <CardDescription>
                            There was an error with the authentication process. Please try again.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Button asChild className="w-full">
                                <Link href="/auth/login">Back to Login</Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/">Go Home</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
