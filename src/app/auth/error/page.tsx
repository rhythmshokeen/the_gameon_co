"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The verification link has expired or has been used.",
    Default: "An error occurred during authentication.",
    CredentialsSignin: "Invalid email or password.",
    OAuthSignin: "Error constructing the authorization URL.",
    OAuthCallback: "Error handling the OAuth callback.",
    OAuthCreateAccount: "Error creating the user account.",
    EmailCreateAccount: "Error creating the email account.",
    Callback: "Error in the OAuth callback handler.",
    OAuthAccountNotLinked: "This email is already associated with another account.",
    SessionRequired: "Please sign in to access this page.",
  };

  const message = errorMessages[error || "Default"] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-[#0b0d14] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <Image src="/logo.png" alt="GameOn Co." width={40} height={40} className="rounded-xl" />
          <span className="text-xl font-bold">GameOn Co.</span>
        </Link>

        <div className="p-8 rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <h1 className="text-xl font-bold mb-2">Authentication Error</h1>
          <p className="text-slate-400 text-sm mb-6">{message}</p>
          <div className="flex gap-3 justify-center">
            <Link href="/auth/login">
              <Button>Try Again</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0b0d14] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
