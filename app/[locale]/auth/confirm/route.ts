// app/[locale]/auth/confirm/route.ts
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

interface RouteParams {
    params: { locale: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const next = searchParams.get("next") ?? `/${params.locale}/protected`;

    if (token_hash && type) {
        const supabase = await createClient();

        const { error } = await supabase.auth.verifyOtp({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            type: type as any,
            token_hash,
        });
        if (!error) {
            // redirect user to specified redirect URL or protected area
            redirect(next);
        }
    }

    // redirect the user to an error page with some instructions
    redirect(`/${params.locale}/auth/error`);
}
