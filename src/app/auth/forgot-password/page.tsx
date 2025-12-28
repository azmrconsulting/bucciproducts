"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Loader2, Mail, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Something went wrong");
        setIsLoading(false);
        return;
      }

      setIsSubmitted(true);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
      {/* Background Pattern */}
      <div className="geo-pattern" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
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

        {/* Card */}
        <div className="card p-5 sm:p-8 md:p-10">
          {isSubmitted ? (
            // Success State
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="font-display text-xl sm:text-2xl text-ivory mb-3">
                Check Your Email
              </h1>
              <p className="text-gray text-sm mb-6">
                If an account exists for <span className="text-ivory">{email}</span>, we&apos;ve sent a password reset link. The link will expire in 1 hour.
              </p>
              <p className="text-gray/60 text-xs mb-8">
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                  className="btn btn-secondary w-full justify-center"
                >
                  Try Another Email
                </button>
                <Link
                  href="/auth/login"
                  className="btn btn-outline w-full justify-center"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            // Form State
            <>
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gold/10 flex items-center justify-center">
                  <Mail className="w-7 h-7 text-gold" />
                </div>
                <h1 className="font-display text-xl sm:text-2xl text-ivory mb-2">
                  Forgot Password?
                </h1>
                <p className="text-gray text-sm">
                  Enter your email and we&apos;ll send you a reset link
                </p>
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input w-full"
                    placeholder="your@email.com"
                    required
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full justify-center"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 sm:mt-8 text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-gray hover:text-gold transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
