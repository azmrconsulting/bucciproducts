/**
 * Cloudflare Turnstile CAPTCHA verification
 *
 * To use this, you need to:
 * 1. Create a Cloudflare account and enable Turnstile
 * 2. Add TURNSTILE_SECRET_KEY to your environment variables
 * 3. Add NEXT_PUBLIC_TURNSTILE_SITE_KEY for the client-side widget
 *
 * The widget is optional - if keys are not configured, CAPTCHA is bypassed
 * This allows the site to work without CAPTCHA during development
 */

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Verify a Turnstile CAPTCHA token on the server side
 * @param token The token from the client-side widget
 * @returns Promise resolving to { success: boolean, error?: string }
 */
export async function verifyTurnstileToken(
  token: string | null | undefined
): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // If no secret key configured, bypass CAPTCHA (development mode)
  if (!secretKey) {
    console.warn("[CAPTCHA] Turnstile not configured - bypassing verification");
    return { success: true };
  }

  // Token is required when CAPTCHA is configured
  if (!token) {
    return { success: false, error: "Please complete the CAPTCHA verification" };
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const data: TurnstileVerifyResponse = await response.json();

    if (!data.success) {
      console.warn("[CAPTCHA] Verification failed:", data["error-codes"]);
      return {
        success: false,
        error: "CAPTCHA verification failed. Please try again.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("[CAPTCHA] Verification error:", error);
    // SECURITY: Fail closed in production to prevent bypass attacks
    // In development, allow through to avoid blocking during testing
    if (process.env.NODE_ENV === "production") {
      return {
        success: false,
        error: "CAPTCHA verification temporarily unavailable. Please try again.",
      };
    }
    return { success: true };
  }
}

/**
 * Check if Turnstile is configured
 */
export function isTurnstileConfigured(): boolean {
  return !!process.env.TURNSTILE_SECRET_KEY;
}
