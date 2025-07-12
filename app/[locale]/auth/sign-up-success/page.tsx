// app/[locale]/auth/sign-up-success/page.tsx
import { CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";

export default async function SignUpSuccessPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <Card>
                    <CardHeader className="text-center">
                        <div className="mb-2 flex justify-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl">Check Your Email</CardTitle>
                        <CardDescription>
                            We&apos;ve sent you a confirmation email. Please check your inbox and click the link to
                            verify your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Button asChild className="w-full">
                                <Link href="/auth/login">Go to Login</Link>
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
