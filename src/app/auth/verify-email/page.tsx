"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, CheckCircle, XCircle, Mail } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          setErrorMessage(data.error || "Verification failed");
          setIsLoading(false);
          return;
        }

        setIsSuccess(true);
      } catch {
        setErrorMessage("Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  // No token provided
  if (!token && !isLoading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
        <div className="geo-pattern" />
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8 sm:mb-12">
            <Link href="/" className="inline-block">
              <span className="font-display text-2xl sm:text-3xl font-semibold tracking-[0.25em] sm:tracking-[0.3em] text-gold">
                BUCCI
              </span>
              <span className="block font-display text-[0.6rem] sm:text-[0.65rem] tracking-[0.4em] sm:tracking-[0.5em] text-ivory/60 mt-1">
                HAIR CARE
              </span>
            </Link>
          </div>
          <div className="card p-5 sm:p-8 md:p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="font-display text-xl sm:text-2xl text-ivory mb-3">
              Invalid Verification Link
            </h1>
            <p className="text-gray text-sm mb-6">
              This verification link is invalid. Please check your email for the correct link or request a new one.
            </p>
            <Link href="/auth/login" className="btn btn-primary w-full justify-center">
              Go to Sign In
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
        <div className="geo-pattern" />
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8 sm:mb-12">
            <Link href="/" className="inline-block">
              <span className="font-display text-2xl sm:text-3xl font-semibold tracking-[0.25em] sm:tracking-[0.3em] text-gold">
                BUCCI
              </span>
              <span className="block font-display text-[0.6rem] sm:text-[0.65rem] tracking-[0.4em] sm:tracking-[0.5em] text-ivory/60 mt-1">
                HAIR CARE
              </span>
            </Link>
          </div>
          <div className="card p-5 sm:p-8 md:p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
            </div>
            <h1 className="font-display text-xl sm:text-2xl text-ivory mb-3">
              Verifying Your Email
            </h1>
            <p className="text-gray text-sm">
              Please wait while we verify your email address...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (errorMessage) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
        <div className="geo-pattern" />
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8 sm:mb-12">
            <Link href="/" className="inline-block">
              <span className="font-display text-2xl sm:text-3xl font-semibold tracking-[0.25em] sm:tracking-[0.3em] text-gold">
                BUCCI
              </span>
              <span className="block font-display text-[0.6rem] sm:text-[0.65rem] tracking-[0.4em] sm:tracking-[0.5em] text-ivory/60 mt-1">
                HAIR CARE
              </span>
            </Link>
          </div>
          <div className="card p-5 sm:p-8 md:p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="font-display text-xl sm:text-2xl text-ivory mb-3">
              Verification Failed
            </h1>
            <p className="text-gray text-sm mb-6">
              {errorMessage}
            </p>
            <div className="space-y-3">
              <Link href="/auth/login" className="btn btn-primary w-full justify-center">
                Go to Sign In
                <ArrowRight className="w-5 h-5" />
              </Link>
              <ResendVerificationButton />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Success state
  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
      <div className="geo-pattern" />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <Link href="/" className="inline-block">
            <span className="font-display text-2xl sm:text-3xl font-semibold tracking-[0.25em] sm:tracking-[0.3em] text-gold">
              BUCCI
            </span>
            <span className="block font-display text-[0.6rem] sm:text-[0.65rem] tracking-[0.4em] sm:tracking-[0.5em] text-ivory/60 mt-1">
              HAIR CARE
            </span>
          </Link>
        </div>
        <div className="card p-5 sm:p-8 md:p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="font-display text-xl sm:text-2xl text-ivory mb-3">
            Email Verified!
          </h1>
          <p className="text-gray text-sm mb-6">
            Your email has been successfully verified. You can now sign in to your account.
          </p>
          <Link href="/auth/login" className="btn btn-primary w-full justify-center">
            Sign In
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </main>
  );
}

function ResendVerificationButton() {
  const [email, setEmail] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setMessage(data.message || data.error);
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-gold hover:text-gold-light text-sm flex items-center justify-center gap-2 w-full"
      >
        <Mail className="w-4 h-4" />
        Resend verification email
      </button>
    );
  }

  return (
    <form onSubmit={handleResend} className="space-y-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="form-input w-full text-sm"
        required
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !email}
        className="btn btn-secondary w-full justify-center text-sm disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Mail className="w-4 h-4" />
            Send Verification Email
          </>
        )}
      </button>
      {message && (
        <p className="text-xs text-gray">{message}</p>
      )}
    </form>
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
