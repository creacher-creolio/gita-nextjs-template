import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { InfoIcon } from "lucide-react";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
        </div>
      </div>
      
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 items-start">
          <h2 className="font-bold text-2xl mb-4">Welcome to your dashboard!</h2>
          <p className="text-muted-foreground">
            You are successfully logged in and can access protected content.
          </p>
        </div>

        <div className="flex flex-col gap-2 items-start">
          <h3 className="font-bold text-xl mb-2">Your user details</h3>
          <div className="bg-muted p-4 rounded-lg w-full">
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
                  : "N/A"
                }
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 items-start">
          <h3 className="font-bold text-xl mb-2">Raw user data</h3>
          <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto w-full bg-muted">
            {JSON.stringify(data.user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
