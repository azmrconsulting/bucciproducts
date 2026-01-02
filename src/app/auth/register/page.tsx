"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2, Check, Mail } from "lucide-react";
import Turnstile from "@/components/Turnstile";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const passwordRequirements = [
    { label: "At least 10 characters", met: formData.password.length >= 10 },
    { label: "Contains uppercase", met: /[A-Z]/.test(formData.password) },
    { label: "Contains lowercase", met: /[a-z]/.test(formData.password) },
    { label: "Contains a number", met: /\d/.test(formData.password) },
    { label: "Contains special character", met: /[^A-Za-z0-9]/.test(formData.password) },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 10) {
      setErrorMessage("Password must be at least 10 characters");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          turnstileToken: turnstileToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Registration failed");
        setTurnstileToken(null); // Reset token on error
        setIsLoading(false);
        return;
      }

      // Show success message - user needs to verify email
      setRegistrationComplete(true);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setTurnstileToken(null);
      setIsLoading(false);
    }
  };

  // Show success message after registration
  if (registrationComplete) {
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
              <Mail className="w-8 h-8 text-gold" />
            </div>
            <h1 className="font-display text-xl sm:text-2xl text-ivory mb-3">
              Check Your Email
            </h1>
            <p className="text-gray text-sm mb-2">
              We&apos;ve sent a verification link to:
            </p>
            <p className="text-gold text-sm font-medium mb-6">
              {formData.email}
            </p>
            <p className="text-gray text-sm mb-6">
              Please click the link in the email to verify your account and complete registration.
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

        {/* Register Card */}
        <div className="card p-5 sm:p-8 md:p-10">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="font-display text-xl sm:text-2xl text-ivory mb-2">
              Create Account
            </h1>
            <p className="text-gray text-sm">
              Join the Bucci family
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-input w-full"
                  placeholder="John"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input w-full"
                  placeholder="Doe"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="your@email.com"
                required
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input w-full pr-12"
                  placeholder="Create a password"
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray hover:text-ivory transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-3 space-y-1">
                  {passwordRequirements.map((req) => (
                    <div
                      key={req.label}
                      className={`flex items-center gap-2 text-xs ${
                        req.met ? "text-green-400" : "text-gray"
                      }`}
                    >
                      <Check className={`w-3 h-3 ${req.met ? "opacity-100" : "opacity-30"}`} />
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="Confirm your password"
                required
                autoComplete="new-password"
                disabled={isLoading}
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-red-400 text-xs mt-2">Passwords do not match</p>
              )}
            </div>

            {/* CAPTCHA Widget */}
            <div className="mt-4">
              <Turnstile
                onVerify={setTurnstileToken}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setTurnstileToken(null)}
                theme="dark"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full justify-center mt-6 sm:mt-8"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 sm:my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray text-xs uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Login Link */}
          <p className="text-center text-gray text-sm">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-gold hover:text-gold-light transition-colors font-display tracking-wider"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 sm:mt-8 text-center text-gray/50 text-xs px-2">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-gray hover:text-ivory transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-gray hover:text-ivory transition-colors">
            Privacy Policy
          </Link>
        </p>
      </div>
    </main>
  );
}
