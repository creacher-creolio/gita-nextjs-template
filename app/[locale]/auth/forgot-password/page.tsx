// app/[locale]/auth/forgot-password/page.tsx
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function Page() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <ForgotPasswordForm />
            </div>
        </div>
    );
}
