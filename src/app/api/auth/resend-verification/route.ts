import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmailVerificationEmail } from "@/lib/email";
import { checkRateLimit, getClientIp, getRateLimitHeaders, rateLimitConfigs } from "@/lib/rate-limit";

const resendSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Rate limit resend requests
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`resend-verification:${clientIp}`, rateLimitConfigs.forgotPassword);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime, rateLimitConfigs.forgotPassword.maxRequests),
        }
      );
    }

    const body = await request.json();
    const { email } = resendSchema.parse(body);

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "If an account with that email exists and is not verified, we sent a verification link.",
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json({
        message: "If an account with that email exists and is not verified, we sent a verification link.",
      });
    }

    // Delete any existing verification tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email.toLowerCase() },
    });

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

    // Token expires in 24 hours
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Store the verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token: hashedToken,
        expires,
      },
    });

    // Send verification email
    const emailResult = await sendEmailVerificationEmail(email, verificationToken);
    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
    }

    return NextResponse.json({
      message: "If an account with that email exists and is not verified, we sent a verification link.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
