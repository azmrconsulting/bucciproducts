"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowRight, Home } from "lucide-react";

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification link has expired or has already been used.",
  Default: "An error occurred during authentication.",
  CredentialsSignin: "Invalid email or password. Please try again.",
  SessionRequired: "Please sign in to access this page.",
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";
  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-20">
      {/* Background Pattern */}
      <div className="geo-pattern" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block">
            <span className="font-display text-3xl font-semibold tracking-[0.3em] text-gold">
              BUCCI
            </span>
            <span className="block font-display text-[0.65rem] tracking-[0.5em] text-ivory/60 mt-1">
              HAIR CARE
            </span>
          </Link>
        </div>

        {/* Error Card */}
        <div className="card p-8 sm:p-10">
          {/* Error Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>

          <div className="text-center mb-8">
            <h1 className="font-display text-2xl text-ivory mb-3">
              Authentication Error
            </h1>
            <p className="text-gray text-sm leading-relaxed">
              {errorMessage}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="btn btn-primary w-full justify-center"
            >
              <span>Try Again</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/"
              className="btn btn-secondary w-full justify-center"
            >
              <Home className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-center text-gray/50 text-xs">
          If this problem persists, please{" "}
          <Link href="/#contact" className="text-gray hover:text-ivory transition-colors">
            contact our support team
          </Link>
        </p>
      </div>
    </main>
  );
}

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 py-20">
      <div className="geo-pattern" />
      <div className="flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    </main>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ErrorContent />
    </Suspense>
  );
}
