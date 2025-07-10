// app/[locale]/protected/page.tsx
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedPage() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
        redirect("/auth/login");
    }

    const t = await getTranslations("protected");
    const tDetails = await getTranslations("protected.userDetails");
    const tTodo = await getTranslations("protected.todoApp");

    return (
        <div className="flex w-full flex-1 flex-col gap-12">
            <div className="w-full">
                <div className="bg-accent text-foreground flex items-center gap-3 rounded-md p-3 px-5 text-sm">
                    <InfoIcon size="16" strokeWidth={2} />
                    {t("protectedInfo")}
                </div>
            </div>

            <div className="flex flex-col gap-6">
                <div className="flex flex-col items-start gap-2">
                    <h2 className="mb-4 text-2xl font-bold">{t("title")}</h2>
                    <p className="text-muted-foreground">{t("description")}</p>
                </div>

                <div className="flex flex-col items-start gap-2">
                    <h3 className="mb-2 text-xl font-bold">{tDetails("title")}</h3>
                    <div className="bg-muted w-full rounded-lg p-4">
                        <div className="grid gap-2 text-sm">
                            <div>
                                <span className="font-medium">{tDetails("email")}:</span> {data.user.email}
                            </div>
                            <div>
                                <span className="font-medium">{tDetails("userId")}:</span> {data.user.id}
                            </div>
                            <div>
                                <span className="font-medium">{tDetails("lastSignIn")}:</span>{" "}
                                {data.user.last_sign_in_at
                                    ? new Date(data.user.last_sign_in_at).toLocaleString()
                                    : "N/A"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-start gap-2">
                    <h3 className="mb-2 text-xl font-bold">{t("rawData")}</h3>
                    <pre className="bg-muted max-h-32 w-full overflow-auto rounded border p-3 font-mono text-xs">
                        {JSON.stringify(data.user, null, 2)}
                    </pre>
                </div>
                <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 dark:border-blue-800 dark:from-blue-950 dark:to-indigo-950">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">{tTodo("title")}</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-blue-700 dark:text-blue-300">
                            {tTodo("description")}
                        </p>
                        <Link
                            href="/protected/todos"
                            className="inline-flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow-md transition-colors duration-200 hover:bg-blue-700 hover:shadow-lg">
                            <span>{tTodo("openApp")}</span>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
