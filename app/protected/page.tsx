import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
        redirect("/auth/login");
    }

    return (
        <div className="flex w-full flex-1 flex-col gap-12">
            <div className="w-full">
                <div className="bg-accent text-foreground flex items-center gap-3 rounded-md p-3 px-5 text-sm">
                    <InfoIcon size="16" strokeWidth={2} />
                    This is a protected page that you can only see as an authenticated user
                </div>
            </div>

            <div className="flex flex-col gap-6">
                <div className="flex flex-col items-start gap-2">
                    <h2 className="mb-4 text-2xl font-bold">Welcome to your dashboard!</h2>
                    <p className="text-muted-foreground">
                        You are successfully logged in and can access protected content.
                    </p>
                </div>

                <div className="flex flex-col items-start gap-2">
                    <h3 className="mb-2 text-xl font-bold">Your user details</h3>
                    <div className="bg-muted w-full rounded-lg p-4">
                        <div className="grid gap-2 text-sm">
                            <div>
                                <span className="font-medium">Email:</span> {data.user.email}
                            </div>
                            <div>
                                <span className="font-medium">User ID:</span> {data.user.id}
                            </div>
                            <div>
                                <span className="font-medium">Last sign in:</span>{" "}
                                {data.user.last_sign_in_at
                                    ? new Date(data.user.last_sign_in_at).toLocaleString()
                                    : "N/A"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-start gap-2">
                    <h3 className="mb-2 text-xl font-bold">Raw user data</h3>
                    <pre className="bg-muted max-h-32 w-full overflow-auto rounded border p-3 font-mono text-xs">
                        {JSON.stringify(data.user, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
