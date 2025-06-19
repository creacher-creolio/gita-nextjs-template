import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { Shield, Lock, User } from "lucide-react";
import Link from "next/link";

export default async function Home() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="max-w-4xl w-full space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="flex justify-center items-center gap-2">
                        <Shield className="h-8 w-8 text-primary" />
                        <h1 className="text-4xl font-bold tracking-tight">Next.js Supabase Starter</h1>
                    </div>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        A complete authentication system with login, logout, and protected routes powered by Supabase and Next.js
                    </p>
                </div>

                {/* Authentication Status */}
                <div className="flex justify-center">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-2">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle>
                                {user ? "Welcome back!" : "Authentication Status"}
                            </CardTitle>
                            <CardDescription>
                                {user 
                                    ? `Logged in as ${user.email}`
                                    : "You are not currently logged in"
                                }
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {user ? (
                                <div className="space-y-3">
                                    <Button asChild className="w-full">
                                        <Link href="/protected">
                                            <Lock className="mr-2 h-4 w-4" />
                                            Go to Protected Area
                                        </Link>
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground">
                                        You have access to protected content
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <Button asChild className="w-full">
                                        <Link href="/auth/login">
                                            Sign In
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href="/auth/sign-up">
                                            Create Account
                                        </Link>
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground">
                                        Sign in to access protected content
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Secure Authentication
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Powered by Supabase Auth with email/password authentication and secure session management.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5" />
                                Protected Routes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Server-side route protection that automatically redirects unauthenticated users to login.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                User Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Complete user signup, login, logout, and password reset functionality.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Navigation */}
                <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold">Quick Navigation</h3>
                    <div className="flex justify-center gap-4 flex-wrap">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/auth/login">Login Page</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/auth/sign-up">Sign Up Page</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/protected">Protected Page</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
