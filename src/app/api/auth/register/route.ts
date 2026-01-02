import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, getRateLimitHeaders, rateLimitConfigs } from "@/lib/rate-limit";
import { sendEmailVerificationEmail } from "@/lib/email";
import { verifyTurnstileToken } from "@/lib/turnstile";

// Common weak passwords to block
const commonPasswords = ['password', '12345678', 'password123', 'admin123', 'qwerty123', 'letmein', 'welcome'];

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
    .refine(
      (password) => !commonPasswords.includes(password.toLowerCase()),
      "Password is too common. Please choose a stronger password."
    ),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  turnstileToken: z.string().optional(), // CAPTCHA token (optional if not configured)
});

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Rate limit registration to prevent mass account creation
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`register:${clientIp}`, rateLimitConfigs.register);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime, rateLimitConfigs.register.maxRequests),
        }
      );
    }

    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // SECURITY: Verify CAPTCHA token
    const captchaResult = await verifyTurnstileToken(validatedData.turnstileToken);
    if (!captchaResult.success) {
      return NextResponse.json(
        { error: captchaResult.error || "CAPTCHA verification failed" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      // SECURITY: Use generic error message to prevent email enumeration
      return NextResponse.json(
        { error: "Unable to create account. Please try again or use a different email." },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    // Create user (email not verified yet)
    const user = await prisma.user.create({
      data: {
        email: validatedData.email.toLowerCase(),
        passwordHash,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        emailVerified: null, // Not verified yet
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    // SECURITY: Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

    // Token expires in 24 hours
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Store the verification token
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: hashedToken,
        expires,
      },
    });

    // Send verification email
    const emailResult = await sendEmailVerificationEmail(user.email, verificationToken);
    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error);
    }

    return NextResponse.json(
      {
        message: "Account created successfully. Please check your email to verify your account.",
        user,
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
