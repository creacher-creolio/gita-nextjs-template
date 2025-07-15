// app/[locale]/protected/layout.tsx
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

interface ProtectedLayoutProps {
    children: React.ReactNode;
    params: { locale: string };
}

export default async function ProtectedLayout({ children, params }: ProtectedLayoutProps) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/${params.locale}/auth/login`);
    }

    return <div className="flex min-h-screen w-full flex-col">{children}</div>;
}
