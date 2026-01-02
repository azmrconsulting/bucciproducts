import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp, getRateLimitHeaders, rateLimitConfigs } from '@/lib/rate-limit';

// Common weak passwords to block
const commonPasswords = ['password', '12345678', 'password123', 'admin123', 'qwerty123', 'letmein', 'welcome'];

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    .refine(
      (password) => !commonPasswords.includes(password.toLowerCase()),
      'Password is too common. Please choose a stronger password.'
    ),
});

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Rate limit password reset attempts
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`reset-password:${clientIp}`, rateLimitConfigs.resetPassword);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many password reset attempts. Please try again later.' },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime, rateLimitConfigs.resetPassword.maxRequests),
        }
      );
    }

    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find the token in database
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token: hashedToken,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 12);

    // SECURITY: Update password and set passwordChangedAt to invalidate existing sessions
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
        // Also reset lockout on successful password reset
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: hashedToken,
        },
      },
    });

    return NextResponse.json({
      message: 'Password reset successfully. You can now sign in with your new password.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
