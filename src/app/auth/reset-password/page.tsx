"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2, Lock, CheckCircle, XCircle } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Password validation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!token) {
      setErrorMessage("Invalid reset link. Please request a new one.");
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage("Please meet all password requirements.");
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Something went wrong");
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

  // No token provided
  if (!token) {
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
              Invalid Reset Link
            </h1>
            <p className="text-gray text-sm mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link href="/auth/forgot-password" className="btn btn-primary w-full justify-center">
              Request New Link
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
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
          {isSuccess ? (
            // Success State
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="font-display text-xl sm:text-2xl text-ivory mb-3">
                Password Reset!
              </h1>
              <p className="text-gray text-sm mb-6">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <Link href="/auth/login" className="btn btn-primary w-full justify-center">
                Sign In
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            // Form State
            <>
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-gold/10 flex items-center justify-center">
                  <Lock className="w-7 h-7 text-gold" />
                </div>
                <h1 className="font-display text-xl sm:text-2xl text-ivory mb-2">
                  Create New Password
                </h1>
                <p className="text-gray text-sm">
                  Enter your new password below
                </p>
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input w-full pr-12"
                      placeholder="Enter new password"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray hover:text-ivory transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Password Requirements */}
                  <div className="mt-3 space-y-1.5">
                    <p className="text-xs text-gray">Password must have:</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <RequirementItem met={hasMinLength} text="8+ characters" />
                      <RequirementItem met={hasUppercase} text="Uppercase letter" />
                      <RequirementItem met={hasLowercase} text="Lowercase letter" />
                      <RequirementItem met={hasNumber} text="Number" />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="form-input w-full pr-12"
                      placeholder="Confirm new password"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray hover:text-ivory transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {confirmPassword && (
                    <p className={`mt-2 text-xs ${passwordsMatch ? "text-green-500" : "text-red-400"}`}>
                      {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !isPasswordValid || !passwordsMatch}
                  className="btn btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs ${met ? "text-green-500" : "text-gray/60"}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${met ? "bg-green-500" : "bg-gray/40"}`} />
      {text}
    </div>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
