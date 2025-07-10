// app/[locale]/protected/layout.tsx
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    return <div className="flex min-h-screen w-full flex-col">{children}</div>;
}
