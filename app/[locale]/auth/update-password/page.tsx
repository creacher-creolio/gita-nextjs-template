// app/[locale]/auth/update-password/page.tsx
import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export default function Page() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <UpdatePasswordForm />
            </div>
        </div>
    );
}
